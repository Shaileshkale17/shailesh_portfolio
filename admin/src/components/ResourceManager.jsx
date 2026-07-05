import { useEffect, useState } from "react";
import api from "../lib/api";

// Generic list + create/edit/delete manager, driven by a field config.
// Used for Projects, Experience, Skills, and Testimonials so each page stays a thin config file.
const ResourceManager = ({ title, endpoint, fields, columns }) => {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null); // null = not editing, {} = new, {...} = existing
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    api
      .get(`${endpoint}?admin=true`)
      .then((res) => setItems(res.data))
      .catch(() => setError("Failed to load data."))
      .finally(() => setLoading(false));
  };

  useEffect(load, [endpoint]);

  const emptyForm = () =>
    fields.reduce((acc, f) => {
      acc[f.name] = f.type === "checkbox" ? false : f.type === "tags" ? [] : "";
      return acc;
    }, {});

  const openNew = () => setEditing(emptyForm());
  const openEdit = (item) => setEditing({ ...item });

  const handleChange = (field, value) => setEditing((prev) => ({ ...prev, [field]: value }));

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
      } else {
        await api.post(endpoint, payload);
      }
      setEditing(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Save failed.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this item? This cannot be undone.")) return;
    await api.delete(`${endpoint}/${id}`);
    load();
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-xl font-bold">{title}</h1>
        <button className="btn-primary" onClick={openNew}>
          + New
        </button>
      </div>

      {error && <p className="mb-4 text-sm text-error">{error}</p>}

      {editing && (
        <form onSubmit={handleSave} className="card mb-6 space-y-4">
          <h2 className="font-heading text-lg font-semibold">{editing._id ? "Edit" : "Create"} {title.slice(0, -1)}</h2>
          {fields.map((f) => (
            <div key={f.name}>
              <label className="mb-1 block text-sm text-text-secondary">{f.label}</label>
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
                      e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
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
            <button type="button" className="btn-secondary" onClick={() => setEditing(null)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="card overflow-x-auto p-0">
        {loading ? (
          <p className="p-6 text-sm text-text-secondary">Loading...</p>
        ) : items.length === 0 ? (
          <p className="p-6 text-sm text-text-secondary">No items yet.</p>
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
              {items.map((item) => (
                <tr key={item._id} className="border-b border-border last:border-0 hover:bg-surface-raised">
                  {columns.map((c) => (
                    <td key={c.key} className="px-6 py-3">
                      {c.render ? c.render(item) : String(item[c.key] ?? "")}
                    </td>
                  ))}
                  <td className="px-6 py-3 text-right">
                    <button className="mr-3 text-primary hover:underline" onClick={() => openEdit(item)}>
                      Edit
                    </button>
                    <button className="text-error hover:underline" onClick={() => handleDelete(item._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ResourceManager;
