import { useEffect, useRef, useState } from "react";
import { revealSection } from "../../animations/revealTimeline";
import { fetchProjects } from "../../lib/api";
import SectionHeading from "../ui/SectionHeading";
import { useTilt } from "../../hooks/useTilt";

const FALLBACK_PROJECTS = [
  {
    title: "Event Management Platform",
    metric: "30% faster load",
    summary:
      "End-to-end event lifecycle management with role-based access, real-time attendee updates, and a caching layer that cut page load significantly.",
    tags: ["React", "Node.js", "Redis", "WebSockets"],
  },
  {
    title: "HRMS Platform",
    metric: "40+ bugs closed",
    summary:
      "Human resource management system covering attendance, payroll, and access control, hardened through a dedicated bug-closure sprint.",
    tags: ["React", "MongoDB", "JWT", "RBAC"],
  },
];

const ProjectCard = ({ project }) => {
  const { ref, onMouseMove, onMouseLeave } = useTilt({ max: 5, lift: -6 });

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="tilt-card reveal project-card rounded-2xl border border-border bg-surface p-6 shadow-2"
    >
      <div className="mb-4 flex h-40 items-center justify-center overflow-hidden rounded-xl bg-surface-raised text-sm text-text-secondary">
        <span className="gradient-text font-heading text-base font-semibold">{project.title}</span>
      </div>
      <div className="mb-2 inline-block rounded-full bg-primary/10 px-3 py-1 font-mono text-xs text-primary">
        {project.metric}
      </div>
      <h4 className="font-heading text-lg font-semibold">{project.title}</h4>
      <p className="mt-2 text-sm text-text-secondary">{project.summary}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {project.tags?.map((tag) => (
          <span key={tag} className="rounded-full border border-border px-2.5 py-1 text-xs text-text-secondary">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

const Projects = () => {
  const rootRef = useRef(null);
  const [projects, setProjects] = useState(FALLBACK_PROJECTS);

  useEffect(() => {
    fetchProjects()
      .then((data) => data?.length && setProjects(data))
      .catch(() => setProjects(FALLBACK_PROJECTS));
  }, []);

  useEffect(() => revealSection(rootRef.current), [projects]);

  return (
    <section id="projects" ref={rootRef} className="py-[var(--space-section)]">
      <div className="container">
        <SectionHeading
          eyebrow="05 — Featured Projects"
          title="Outcome first, tech list second."
          subtitle="Two production systems, each shipped with a number that proves it worked."
        />
        <div className="grid gap-6 md:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard key={project.title} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
