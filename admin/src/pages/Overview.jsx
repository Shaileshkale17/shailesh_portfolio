import { useEffect, useState } from "react";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";

const Overview = () => {
  const { user } = useAuth();
  const [counts, setCounts] = useState({ projects: 0, experience: 0, skills: 0, testimonials: 0, messages: 0, unread: 0 });

  useEffect(() => {
    Promise.all([
      api.get("/projects?admin=true"),
      api.get("/experience?admin=true"),
      api.get("/skills?admin=true"),
      api.get("/testimonials?admin=true"),
      api.get("/messages"),
    ]).then(([projects, experience, skills, testimonials, messages]) => {
      setCounts({
        projects: projects.data.length,
        experience: experience.data.length,
        skills: skills.data.length,
        testimonials: testimonials.data.length,
        messages: messages.data.length,
        unread: messages.data.filter((m) => !m.read).length,
      });
    });
  }, []);

  const cards = [
    { label: "Projects", value: counts.projects },
    { label: "Experience entries", value: counts.experience },
    { label: "Skills", value: counts.skills },
    { label: "Testimonials", value: counts.testimonials },
    { label: "Unread messages", value: counts.unread },
  ];

  return (
    <div>
      <h1 className="mb-1 font-heading text-xl font-bold">Welcome back{user?.name ? `, ${user.name}` : ""}</h1>
      <p className="mb-6 text-sm text-text-secondary">Here's a snapshot of your portfolio content.</p>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {cards.map((c) => (
          <div key={c.label} className="card text-center">
            <div className="font-heading text-3xl font-bold">{c.value}</div>
            <div className="mt-1 text-xs text-text-secondary">{c.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Overview;
