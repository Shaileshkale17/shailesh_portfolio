import { Menu } from "lucide-react";
import { useLocation } from "react-router-dom";
import NotificationBell from "./NotificationBell";

const TITLES = {
  "/": "Dashboard",
  "/analytics": "Analytics",
  "/projects": "Projects",
  "/experience": "Experience",
  "/skills": "Skills",
  "/achievements": "Achievements",
  "/certifications": "Certifications",
  "/testimonials": "Testimonials",
  "/messages": "Messages",
  "/linked-projects": "Linked Projects",
  "/integrations": "GitHub & LeetCode",
  "/notifications": "Notifications",
};

const Topbar = ({ onMenuClick }) => {
  const location = useLocation();
  const title = TITLES[location.pathname] || "Dashboard";

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-bg/80 px-4 py-4 backdrop-blur md:px-8">
      <div className="flex items-center gap-3">
        <button
          className="rounded-lg p-2 text-text-secondary hover:bg-surface-raised md:hidden"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <h2 className="font-heading text-lg font-semibold">{title}</h2>
      </div>
      <NotificationBell />
    </header>
  );
};

export default Topbar;
