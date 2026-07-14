import { useEffect, useState } from "react";
import { Search, Download, Mail, MailOpen, Trash2, X, CheckCircle2, XCircle } from "lucide-react";
import api from "../lib/api";
import Skeleton from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import { useToast } from "../context/ToastContext";
import { timeAgo } from "../lib/format";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "false", label: "Unread" },
  { key: "true", label: "Read" },
];

// Debounces the search box so it doesn't fire a request on every keystroke.
const useDebouncedValue = (value, delayMs) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
};

const Messages = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [readFilter, setReadFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [exporting, setExporting] = useState(false);
  const toast = useToast();

  const debouncedSearch = useDebouncedValue(search, 300);

  const load = () => {
    setLoading(true);
    const params = {};
    if (debouncedSearch) params.search = debouncedSearch;
    if (readFilter !== "all") params.read = readFilter;

    api
      .get("/messages", { params })
      .then((res) => setItems(res.data))
      .catch(() => toast("Failed to load messages", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(load, [debouncedSearch, readFilter]);

  const toggleRead = async (item) => {
    try {
      await api.patch(`/messages/${item._id}`, { read: !item.read });
      load();
      if (selected?._id === item._id) setSelected((s) => ({ ...s, read: !s.read }));
    } catch {
      toast("Couldn't update message", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/messages/${deleteTarget._id}`);
      toast("Message deleted");
      if (selected?._id === deleteTarget._id) setSelected(null);
      setDeleteTarget(null);
      load();
    } catch {
      toast("Delete failed", "error");
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = {};
      if (debouncedSearch) params.search = debouncedSearch;
      if (readFilter !== "all") params.read = readFilter;

      const res = await api.get("/messages/export", { params, responseType: "blob" });
      const url = URL.createObjectURL(new Blob([res.data], { type: "text/csv" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `messages-${Date.now()}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      toast("Export failed", "error");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="mb-1 font-heading text-xl font-bold">Messages</h1>
          <p className="text-sm text-text-secondary">Contact form submissions from your portfolio.</p>
        </div>
        <button onClick={handleExport} disabled={exporting} className="btn-secondary gap-2">
          <Download size={15} />
          {exporting ? "Exporting..." : "Export CSV"}
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            className="input pl-9"
            placeholder="Search name, email, message..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setReadFilter(f.key)}
              className={`rounded-lg px-3 py-1.5 text-sm transition ${
                readFilter === f.key ? "bg-primary/15 text-text" : "text-text-secondary hover:bg-surface-raised"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="card p-0 lg:col-span-2">
          {loading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <EmptyState icon={Mail} title="No messages" description="Nothing matches your current filters." />
          ) : (
            <ul className="max-h-[70vh] overflow-y-auto">
              {items.map((item) => (
                <li key={item._id}>
                  <button
                    onClick={() => setSelected(item)}
                    className={`flex w-full items-start gap-3 border-b border-border px-4 py-3 text-left last:border-0 hover:bg-surface-raised ${
                      selected?._id === item._id ? "bg-surface-raised" : ""
                    }`}
                  >
                    <div className="mt-0.5 flex-shrink-0 text-text-secondary">
                      {item.read ? <MailOpen size={15} /> : <Mail size={15} className="text-primary" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`truncate text-sm ${item.read ? "text-text-secondary" : "font-semibold text-text"}`}>
                          {item.name}
                        </p>
                        <span className="flex-shrink-0 text-[11px] text-text-secondary">{timeAgo(item.createdAt)}</span>
                      </div>
                      <p className="truncate text-xs text-text-secondary">{item.message}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card lg:col-span-3">
          {!selected ? (
            <EmptyState icon={Mail} title="Select a message" description="Pick a message from the list to read it." />
          ) : (
            <div>
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate font-heading text-lg font-semibold">{selected.name}</h2>
                  <a href={`mailto:${selected.email}`} className="text-sm text-primary hover:underline">
                    {selected.email}
                  </a>
                  <p className="mt-1 text-xs text-text-secondary">{new Date(selected.createdAt).toLocaleString()}</p>
                </div>
                <button onClick={() => setSelected(null)} className="flex-shrink-0 text-text-secondary hover:text-text lg:hidden">
                  <X size={18} />
                </button>
              </div>

              <p className="mb-6 whitespace-pre-wrap rounded-xl border border-border bg-surface-raised p-4 text-sm text-text">
                {selected.message}
              </p>

              <div className="mb-6 flex flex-wrap gap-4 text-xs text-text-secondary">
                <span className="flex items-center gap-1.5">
                  {selected.emailStatus?.adminNotified ? (
                    <CheckCircle2 size={13} className="text-success" />
                  ) : (
                    <XCircle size={13} className="text-text-secondary" />
                  )}
                  Admin alert {selected.emailStatus?.adminNotified ? "sent" : "not sent"}
                </span>
                <span className="flex items-center gap-1.5">
                  {selected.emailStatus?.autoReplySent ? (
                    <CheckCircle2 size={13} className="text-success" />
                  ) : (
                    <XCircle size={13} className="text-text-secondary" />
                  )}
                  Auto-reply {selected.emailStatus?.autoReplySent ? "sent" : "not sent"}
                </span>
              </div>

              <div className="flex gap-3">
                <button onClick={() => toggleRead(selected)} className="btn-secondary gap-2">
                  {selected.read ? <Mail size={15} /> : <MailOpen size={15} />}
                  Mark as {selected.read ? "unread" : "read"}
                </button>
                <button
                  onClick={() => setDeleteTarget(selected)}
                  className="inline-flex items-center gap-2 rounded-lg border border-error/30 px-4 py-2 text-sm font-semibold text-error transition hover:bg-error/10"
                >
                  <Trash2 size={15} /> Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this message?"
        description="This can't be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default Messages;
