import analyticsService from "./analyticsService.js";
import notificationService from "./notificationService.js";
import Message from "../models/Message.js";
import Project from "../models/Project.js";
import LinkedProject from "../models/LinkedProject.js";

/**
 * Aggregates the numbers the dashboard's top-level overview cards need in
 * one round trip, instead of the frontend firing five-plus separate
 * requests on load.
 */
const getSummary = async () => {
  const [analytics, totalMessages, unreadMessages, totalProjects, linkedWebsites, unreadNotifications] =
    await Promise.all([
      analyticsService.getSummary(),
      Message.countDocuments(),
      Message.countDocuments({ read: false }),
      Project.countDocuments(),
      LinkedProject.countDocuments({ enabled: true }),
      notificationService.getUnreadCount(),
    ]);

  return {
    analytics,
    contacts: { total: totalMessages, unread: unreadMessages },
    projects: { total: totalProjects },
    linkedWebsites: { total: linkedWebsites },
    notifications: { unread: unreadNotifications },
  };
};

export default { getSummary };
