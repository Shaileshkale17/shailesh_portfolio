import { useEffect, useState } from "react";
import api from "../lib/api";

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api
      .get("/messages")
      .then((res) => setMessages(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const toggleRead = async (msg) => {
    await api.patch(`/messages/${msg._id}`, { read: !msg.read });
    load();
  };

  const remove = async (id) => {
    if (!confirm("Delete this message?")) return;
    await api.delete(`/messages/${id}`);
    load();
  };

  return (
    <div>
      <h1 className="mb-6 font-heading text-xl font-bold">Contact Messages</h1>
      {loading ? (
        <p className="text-sm text-text-secondary">Loading...</p>
      ) : messages.length === 0 ? (
        <p className="text-sm text-text-secondary">No messages yet.</p>
      ) : (
        <div className="space-y-4">
          {messages.map((m) => (
            <div key={m._id} className={`card ${m.read ? "opacity-70" : ""}`}>
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <span className="font-semibold">{m.name}</span>{" "}
                  <span className="text-sm text-text-secondary">&lt;{m.email}&gt;</span>
                </div>
                <span className="text-xs text-text-secondary">{new Date(m.createdAt).toLocaleString()}</span>
              </div>
              <p className="mb-4 text-sm text-text-secondary">{m.message}</p>
              <div className="flex gap-3 text-sm">
                <button className="text-primary hover:underline" onClick={() => toggleRead(m)}>
                  Mark as {m.read ? "unread" : "read"}
                </button>
                <button className="text-error hover:underline" onClick={() => remove(m._id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Messages;
