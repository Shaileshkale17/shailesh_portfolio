import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  BarChart3,
  Bell,
  FolderKanban,
  Briefcase,
  Sparkles,
  Award,
  BadgeCheck,
  Quote,
  Mail,
  Link2,
  Github,
  LogOut,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const GROUPS = [
  {
    label: "Dashboard",
    links: [
      { to: "/", label: "Overview", icon: LayoutDashboard, end: true },
      { to: "/analytics", label: "Analytics", icon: BarChart3 },
      { to: "/notifications", label: "Notifications", icon: Bell },
    ],
  },
  {
    label: "Content",
    links: [
      { to: "/projects", label: "Projects", icon: FolderKanban },
      { to: "/experience", label: "Experience", icon: Briefcase },
      { to: "/skills", label: "Skills", icon: Sparkles },
      { to: "/achievements", label: "Achievements", icon: Award },
      { to: "/certifications", label: "Certifications", icon: BadgeCheck },
      { to: "/testimonials", label: "Testimonials", icon: Quote },
    ],
  },
  {
    label: "Dashboard integrations",
    links: [
      { to: "/messages", label: "Messages", icon: Mail },
      { to: "/linked-projects", label: "Linked Projects", icon: Link2 },
      { to: "/integrations", label: "GitHub & LeetCode", icon: Github },
    ],
  },
];

/**
 * @param {{ open: boolean, onClose: () => void }} props - `open`/`onClose` only matter
 * on mobile, where the sidebar becomes a slide-in drawer with a backdrop.
 */
const Sidebar = ({ open, onClose }) => {
  const { user, logout } = useAuth();

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/60 md:hidden" onClick={onClose} />}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-shrink-0 flex-col border-r border-border bg-surface p-6 transition-transform duration-200 md:static md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-8 flex items-center justify-between">
          <div className="font-heading text-lg font-bold">
            shailesh<span className="text-primary">.dev</span>
            <div className="font-mono text-xs font-normal uppercase tracking-wide text-text-secondary">Admin</div>
          </div>
          <button className="rounded-lg p-1 text-text-secondary hover:bg-surface-raised md:hidden" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto">
          {GROUPS.map((group) => (
            <div key={group.label}>
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-text-secondary/70">
                {group.label}
              </p>
              <div className="space-y-1">
                {group.links.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.end}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                        isActive ? "bg-primary/15 text-text" : "text-text-secondary hover:bg-surface-raised hover:text-text"
                      }`
                    }
                  >
                    <link.icon size={16} />
                    {link.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-border pt-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-accent font-heading text-sm font-bold text-white">
              {(user?.name || user?.email || "?").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-text">{user?.name || "Admin"}</p>
              <p className="truncate text-xs text-text-secondary">{user?.email}</p>
            </div>
          </div>
          <button onClick={logout} className="btn-secondary w-full gap-2">
            <LogOut size={15} /> Log out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
