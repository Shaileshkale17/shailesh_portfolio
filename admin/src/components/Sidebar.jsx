import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LINKS = [
  { to: "/", label: "Overview", end: true },
  { to: "/projects", label: "Projects" },
  { to: "/experience", label: "Experience" },
  { to: "/skills", label: "Skills" },
  { to: "/achievements", label: "Achievements" },
  { to: "/certifications", label: "Certifications" },
  { to: "/testimonials", label: "Testimonials" },
  { to: "/messages", label: "Messages" },
];

const Sidebar = () => {
  const { user, logout } = useAuth();

  return (
    <aside className="flex h-screen w-64 flex-shrink-0 flex-col border-r border-border bg-surface p-6">
      <div className="mb-8 font-heading text-lg font-bold">
        shailesh<span className="text-primary">.dev</span>
        <div className="font-mono text-xs font-normal uppercase tracking-wide text-text-secondary">Admin</div>
      </div>
      <nav className="flex-1 space-y-1">
        {LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `block rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive ? "bg-primary/15 text-text" : "text-text-secondary hover:bg-surface-raised"
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-border pt-4">
        <div className="mb-2 text-sm text-text-secondary">{user?.email}</div>
        <button onClick={logout} className="btn-secondary w-full">
          Log out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
