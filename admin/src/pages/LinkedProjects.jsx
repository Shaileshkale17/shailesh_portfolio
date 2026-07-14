import { useEffect, useState } from "react";
import { Plus, RefreshCw, Trash2, Pencil, Link2, AlertCircle, CheckCircle2, X } from "lucide-react";
import api from "../lib/api";
import Skeleton from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import { useToast } from "../context/ToastContext";
import { timeAgo } from "../lib/format";

const EMPTY_FORM = {
  name: "",
  url: "",
  category: "Other",
  description: "",
  analyticsEndpoint: "",
  apiKey: "",
  enabled: true,
};

const CATEGORIES = ["Portfolio", "Event Management", "Blog", "Ecommerce", "Company Project", "Other"];

const LinkedProjects = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null = closed, {} = new, {...} = existing
  const [syncingId, setSyncingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const toast = useToast();

  const load = () => {
    setLoading(true);
    api
      .get("/linked-projects")
      .then((res) => setItems(res.data))
      .catch(() => toast("Failed to load linked projects", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openNew = () => setEditing({ ...EMPTY_FORM });
  const openEdit = (item) => setEditing({ ...EMPTY_FORM, ...item, apiKey: "" });

  const handleChange = (field, value) => setEditing((prev) => ({ ...prev, [field]: value }));

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = { ...editing };
    delete payload._id;
    delete payload.__v;
    delete payload.createdAt;
    delete payload.updatedAt;
    delete payload.lastStats;
    delete payload.lastSyncedAt;
    delete payload.lastSyncError;
    // Don't overwrite a stored credential with an empty string when editing without changing it.
    if (!payload.apiKey) delete payload.apiKey;

    try {
      if (editing._id) {
        await api.put(`/linked-projects/${editing._id}`, payload);
        toast("Linked project updated");
      } else {
        await api.post("/linked-projects", payload);
        toast("Linked project connected");
      }
      setEditing(null);
      load();
    } catch (err) {
      toast(err.response?.data?.message || "Save failed", "error");
    }
  };

  const handleSync = async (id) => {
    setSyncingId(id);
    try {
      await api.post(`/linked-projects/${id}/sync`);
      toast("Sync complete");
      load();
    } catch (err) {
      toast(err.response?.data?.message || "Sync failed", "error");
    } finally {
      setSyncingId(null);
    }
  };

  const handleToggleEnabled = async (item) => {
    try {
      await api.put(`/linked-projects/${item._id}`, { enabled: !item.enabled });
      load();
    } catch {
      toast("Couldn't update status", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/linked-projects/${deleteTarget._id}`);
      toast("Linked project removed");
      setDeleteTarget(null);
      load();
    } catch {
      toast("Delete failed", "error");
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="mb-1 font-heading text-xl font-bold">Linked Projects</h1>
          <p className="text-sm text-text-secondary">Connect other sites/projects to pull their analytics in here.</p>
        </div>
        <button className="btn-primary gap-2" onClick={openNew}>
          <Plus size={16} /> Connect project
        </button>
      </div>

      {editing && (
        <form onSubmit={handleSave} className="card mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold">{editing._id ? "Edit" : "Connect"} project</h2>
            <button type="button" onClick={() => setEditing(null)} className="text-text-secondary hover:text-text">
              <X size={18} />
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-text-secondary">Name</label>
              <input className="input" required value={editing.name} onChange={(e) => handleChange("name", e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-sm text-text-secondary">Category</label>
              <select className="input" value={editing.category} onChange={(e) => handleChange("category", e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm text-text-secondary">Website URL</label>
            <input className="input" required value={editing.url} onChange={(e) => handleChange("url", e.target.value)} />
          </div>

          <div>
            <label className="mb-1 block text-sm text-text-secondary">Description</label>
            <textarea
              className="input"
              rows={2}
              value={editing.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-text-secondary">Analytics endpoint (optional)</label>
              <input
                className="input"
                placeholder="https://project.example.com/api/analytics"
                value={editing.analyticsEndpoint}
                onChange={(e) => handleChange("analyticsEndpoint", e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-text-secondary">
                API key {editing._id && <span className="text-text-secondary">(leave blank to keep current)</span>}
              </label>
              <input
                type="password"
                className="input"
                placeholder={editing._id ? "•••••••• (unchanged)" : ""}
                value={editing.apiKey}
                onChange={(e) => handleChange("apiKey", e.target.value)}
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-text-secondary">
            <input
              type="checkbox"
              checked={editing.enabled}
              onChange={(e) => handleChange("enabled", e.target.checked)}
              className="h-4 w-4 rounded border-border bg-surface-raised accent-primary"
            />
            Enabled
          </label>

          <div className="flex gap-3">
            <button type="submit" className="btn-primary">
              Save
            </button>
            <button type="button" className="btn-secondary" onClick={() => setEditing(null)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Link2}
            title="No projects connected yet"
            description="Connect your other websites/projects to see all their analytics in one place."
            action={
              <button className="btn-primary gap-2" onClick={openNew}>
                <Plus size={16} /> Connect project
              </button>
            }
          />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item) => (
            <div key={item._id} className="card">
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-heading font-semibold">{item.name}</p>
                    <span className="flex-shrink-0 rounded-full bg-surface-raised px-2 py-0.5 text-[11px] text-text-secondary">
                      {item.category}
                    </span>
                  </div>
                  <a href={item.url} target="_blank" rel="noreferrer" className="truncate text-xs text-text-secondary hover:text-primary hover:underline">
                    {item.url}
                  </a>
                </div>
                <button
                  onClick={() => handleToggleEnabled(item)}
                  className={`flex-shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
                    item.enabled ? "bg-success/15 text-success" : "bg-surface-raised text-text-secondary"
                  }`}
                >
                  {item.enabled ? "Enabled" : "Disabled"}
                </button>
              </div>

              {item.description && <p className="mb-3 text-sm text-text-secondary">{item.description}</p>}

              {item.analyticsEndpoint ? (
                <div className="mb-3 rounded-lg border border-border bg-surface-raised p-3 text-xs">
                  {item.lastSyncError ? (
                    <p className="flex items-center gap-1.5 text-error">
                      <AlertCircle size={13} /> {item.lastSyncError}
                    </p>
                  ) : item.lastSyncedAt ? (
                    <p className="flex items-center gap-1.5 text-success">
                      <CheckCircle2 size={13} /> Synced {timeAgo(item.lastSyncedAt)}
                    </p>
                  ) : (
                    <p className="text-text-secondary">Not synced yet</p>
                  )}
                </div>
              ) : (
                <p className="mb-3 text-xs text-text-secondary">No analytics endpoint configured — status only.</p>
              )}

              <div className="flex gap-3 text-sm">
                {item.analyticsEndpoint && (
                  <button
                    onClick={() => handleSync(item._id)}
                    disabled={syncingId === item._id || !item.enabled}
                    className="flex items-center gap-1.5 text-primary hover:underline disabled:opacity-40"
                  >
                    <RefreshCw size={13} className={syncingId === item._id ? "animate-spin" : ""} />
                    Sync
                  </button>
                )}
                <button onClick={() => openEdit(item)} className="flex items-center gap-1.5 text-text-secondary hover:text-text">
                  <Pencil size={13} /> Edit
                </button>
                <button onClick={() => setDeleteTarget(item)} className="flex items-center gap-1.5 text-error hover:underline">
                  <Trash2 size={13} /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title={`Remove "${deleteTarget?.name}"?`}
        description="This only removes it from your dashboard — the linked website itself is unaffected."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default LinkedProjects;
