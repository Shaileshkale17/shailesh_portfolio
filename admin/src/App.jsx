import { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Login from "./pages/Login";
import Overview from "./pages/Overview";
import Analytics from "./pages/Analytics";
import Projects from "./pages/Projects";
import Experience from "./pages/Experience";
import Skills from "./pages/Skills";
import Achievements from "./pages/Achievements";
import Certifications from "./pages/Certifications";
import Testimonials from "./pages/Testimonials";
import Messages from "./pages/Messages";
import LinkedProjects from "./pages/LinkedProjects";
import Integrations from "./pages/Integrations";
import Notifications from "./pages/Notifications";

// Every private page in the app, in sidebar/route order. Keeping this as a
// single list (rather than repeating the same <Route><ProtectedRoute><Layout>
// block per page) keeps App.jsx from growing every time a page is added.
const PAGES = [
  { path: "/", element: <Overview /> },
  { path: "/analytics", element: <Analytics /> },
  { path: "/projects", element: <Projects /> },
  { path: "/experience", element: <Experience /> },
  { path: "/skills", element: <Skills /> },
  { path: "/achievements", element: <Achievements /> },
  { path: "/certifications", element: <Certifications /> },
  { path: "/testimonials", element: <Testimonials /> },
  { path: "/messages", element: <Messages /> },
  { path: "/linked-projects", element: <LinkedProjects /> },
  { path: "/integrations", element: <Integrations /> },
  { path: "/notifications", element: <Notifications /> },
];

const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -6 }}
    transition={{ duration: 0.18, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-bg text-text">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <AnimatePresence mode="wait">
            <PageTransition key={location.pathname}>{children}</PageTransition>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      {PAGES.map(({ path, element }) => (
        <Route
          key={path}
          path={path}
          element={
            <ProtectedRoute>
              <Layout>{element}</Layout>
            </ProtectedRoute>
          }
        />
      ))}
    </Routes>
  );
}

export default App;
