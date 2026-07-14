import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import api from "../lib/api";
import { useAuth } from "./AuthContext";

const NotificationsContext = createContext(null);

const POLL_INTERVAL_MS = 30000;

/**
 * Keeps the notification bell (and the full Notifications page) in sync by
 * polling every 30s while a user is logged in. Simple interval polling
 * rather than WebSockets/SSE — appropriate for a single-admin dashboard;
 * swap for a push-based approach if this ever needs true real-time.
 */
export const NotificationsProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(() => {
    if (!user) return;
    api
      .get("/notifications")
      .then((res) => setNotifications(res.data.data))
      .catch(() => {});
    api
      .get("/notifications/unread-count")
      .then((res) => setUnreadCount(res.data.count))
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    refresh();
    const interval = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [user, refresh]);

  const markRead = async (id) => {
    await api.patch(`/notifications/${id}/read`);
    refresh();
  };

  const markAllRead = async () => {
    await api.patch("/notifications/read-all");
    refresh();
  };

  const remove = async (id) => {
    await api.delete(`/notifications/${id}`);
    refresh();
  };

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        refresh,
        markRead,
        markAllRead,
        remove,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationsContext);
  if (!ctx)
    throw new Error(
      "useNotifications must be used within NotificationsProvider",
    );
  return ctx;
};
