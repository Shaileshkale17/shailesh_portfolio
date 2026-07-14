import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Search, X } from "lucide-react";
import api from "../lib/api";
import { useToast } from "../context/ToastContext";
import Skeleton from "./ui/Skeleton";
import EmptyState from "./ui/EmptyState";
import ConfirmDialog from "./ui/ConfirmDialog";

// Generic list + create/edit/delete manager, driven by a field config.
// Used for Projects, Experience, Skills, Achievements, Certifications, and
// Testimonials so each page stays a thin config file.
const ResourceManager = ({ title, endpoint, fields, columns }) => {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null); // null = not editing, {} = new, {...} = existing
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const toast = useToast();

  const load = () => {
    setLoading(true);
    api
      .get(`${endpoint}?admin=true`)
      .then((res) => setItems(res.data.data))
      .catch(() => toast(`Failed to load ${title.toLowerCase()}.`, "error"))
      .finally(() => setLoading(false));
  };

  useEffect(load, [endpoint]);

  const filteredItems = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter((item) =>
      JSON.stringify(item).toLowerCase().includes(q),
    );
  }, [items, search]);

  const emptyForm = () =>
    fields.reduce((acc, f) => {
      acc[f.name] = f.type === "checkbox" ? false : f.type === "tags" ? [] : "";
      return acc;
    }, {});

  const openNew = () => setEditing(emptyForm());
  const openEdit = (item) => setEditing({ ...item });

  const handleChange = (field, value) =>
    setEditing((prev) => ({ ...prev, [field]: value }));

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = { ...editing };
    delete payload._id;
    delete payload.__v;
    delete payload.createdAt;
    delete payload.updatedAt;

    try {
      if (editing._id) {
        await api.put(`${endpoint}/${editing._id}`, payload);
        toast(`${title.slice(0, -1)} updated`);
      } else {
        await api.post(endpoint, payload);
        toast(`${title.slice(0, -1)} created`);
      }
      setEditing(null);
      load();
    } catch (err) {
      toast(err.response?.data?.message || "Save failed.", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`${endpoint}/${deleteTarget._id}`);
      toast(`${title.slice(0, -1)} deleted`);
      setDeleteTarget(null);
      load();
    } catch {
      toast("Delete failed.", "error");
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-xl font-bold">{title}</h1>
        <button className="btn-primary gap-2" onClick={openNew}>
          <Plus size={16} /> New
        </button>
      </div>

      {items.length > 0 && (
        <div className="relative mb-4 max-w-xs">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
          />
          <input
            className="input pl-9"
            placeholder={`Search ${title.toLowerCase()}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      {editing && (
        <form onSubmit={handleSave} className="card mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold">
              {editing._id ? "Edit" : "Create"} {title.slice(0, -1)}
            </h2>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="text-text-secondary hover:text-text"
            >
              <X size={18} />
            </button>
          </div>
          {fields.map((f) => (
            <div key={f.name}>
              <label className="mb-1 block text-sm text-text-secondary">
                {f.label}
              </label>
              {f.type === "textarea" ? (
                <textarea
                  className="input"
                  rows={4}
                  value={editing[f.name] || ""}
                  onChange={(e) => handleChange(f.name, e.target.value)}
                />
              ) : f.type === "checkbox" ? (
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-border bg-surface-raised accent-primary"
                  checked={!!editing[f.name]}
                  onChange={(e) => handleChange(f.name, e.target.checked)}
                />
              ) : f.type === "select" ? (
                <select
                  className="input"
                  value={editing[f.name] || ""}
                  onChange={(e) => handleChange(f.name, e.target.value)}
                >
                  <option value="">Select...</option>
                  {f.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : f.type === "tags" ? (
                <input
                  className="input"
                  placeholder="Comma-separated"
                  value={(editing[f.name] || []).join(", ")}
                  onChange={(e) =>
                    handleChange(
                      f.name,
                      e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    )
                  }
                />
              ) : (
                <input
                  type={f.type || "text"}
                  className="input"
                  value={editing[f.name] || ""}
                  onChange={(e) => handleChange(f.name, e.target.value)}
                />
              )}
            </div>
          ))}
          <div className="flex gap-3">
            <button type="submit" className="btn-primary">
              Save
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setEditing(null)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="card overflow-x-auto p-0">
        {loading ? (
          <div className="space-y-3 p-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            title="No items yet"
            description={`Create your first ${title.toLowerCase().slice(0, -1)} to get started.`}
          />
        ) : filteredItems.length === 0 ? (
          <EmptyState
            title="No matches"
            description="Try a different search term."
          />
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-text-secondary">
              <tr>
                {columns.map((c) => (
                  <th key={c.key} className="px-6 py-3 font-medium">
                    {c.label}
                  </th>
                ))}
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr
                  key={item._id}
                  className="border-b border-border last:border-0 hover:bg-surface-raised"
                >
                  {columns.map((c) => (
                    <td key={c.key} className="px-6 py-3">
                      {c.render ? c.render(item) : String(item[c.key] ?? "")}
                    </td>
                  ))}
                  <td className="px-6 py-3 text-right">
                    <button
                      className="mr-3 inline-flex items-center gap-1 text-primary hover:underline"
                      onClick={() => openEdit(item)}
                    >
                      <Pencil size={13} /> Edit
                    </button>
                    <button
                      className="inline-flex items-center gap-1 text-error hover:underline"
                      onClick={() => setDeleteTarget(item)}
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title={`Delete this ${title.slice(0, -1).toLowerCase()}?`}
        description="This cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default ResourceManager;
