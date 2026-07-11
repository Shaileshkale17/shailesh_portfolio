import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "../../animations/gsapConfig";
import { fetchExperience } from "../../lib/api";
import SectionHeading from "../ui/SectionHeading";

const FALLBACK_EXPERIENCE = [
  {
    role: "Frontend Developer",
    company: "AeroGenix",
    meta: "Bangalore (Remote) · Oct 2025 – Present",
    description:
      "Architected an RBAC module with JWT auth across Admin, Manager, and Employee roles; cut technical debt by 35% and page load speed by 30%. Also conducts technical interviews and mentors junior engineers.",
    current: true,
  },
  {
    role: "Associate Software Engineer (Intern)",
    company: "AeroGenix",
    meta: "Bangalore (Remote) · Jun 2025 – Oct 2025",
    description:
      "Shipped 10+ typed, reusable UI components, then converted to full-time in 4 months — one of the fastest conversions on the team.",
  },
  {
    role: "Software Developer Intern",
    company: "Hubnex Labs",
    meta: "Gurugram (Remote) · Mar 2024 – Sep 2024",
    description:
      "Built and maintained React-based client interfaces, lowering defect reports by 30% through structured code reviews.",
  },
  {
    role: "Software Developer Intern",
    company: "Techgicus Software Solutions",
    meta: "Nagpur · Mar 2023 – Dec 2023",
    description:
      "Independently scoped and launched 5 major features, raising application speed by 25% via code splitting and lazy loading.",
  },
];

const Experience = () => {
  const rootRef = useRef(null);
  const lineRef = useRef(null);
  const [items, setItems] = useState(FALLBACK_EXPERIENCE);

  useEffect(() => {
    fetchExperience()
      .then((data) => data?.length && setItems(data))
      .catch(() => setItems(FALLBACK_EXPERIENCE));
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(".tl-item", { opacity: 0, y: 30 });
      ScrollTrigger.batch(".tl-item", {
        start: "top 85%",
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            duration: 0.9,
            stagger: 0.1,
            ease: "power3.out",
          }),
      });

      if (lineRef.current) {
        const length = lineRef.current.getTotalLength();
        lineRef.current.style.strokeDasharray = length;
        lineRef.current.style.strokeDashoffset = length;
        gsap.to(lineRef.current, {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: {
            trigger: rootRef.current,
            start: "top 70%",
            end: "bottom 80%",
            scrub: 1,
          },
        });
      }
    }, rootRef);
    return () => ctx.revert();
  }, [items]);

  return (
    <section
      id="experience"
      ref={rootRef}
      className="bg-surface py-[var(--space-section)]"
    >
      <div className="container">
        <SectionHeading
          eyebrow="04 — Experience"
          title="Four roles, one upward line."
          subtitle="From first internship to conducting interviews — the trajectory, in order."
        />
        <div className="relative pl-8">
          <svg
            className="absolute left-0 top-0 h-full w-[2px]"
            viewBox="0 0 2 1000"
            preserveAspectRatio="none"
          >
            <line
              ref={lineRef}
              x1="1"
              y1="12"
              x2="1"
              y2="1974"
              stroke="var(--color-primary)"
              strokeWidth="2"
            />
          </svg>
          <div className="space-y-10">
            {items.map((item) => (
              <div
                key={`${item.company}-${item.role}`}
                className="tl-item relative"
              >
                <span className="absolute -left-[36.5px] top-1.5 h-3 w-3 rounded-full bg-primary shadow-glow">
                  {item.current && (
                    <span className="absolute inset-0 -m-1 animate-ping rounded-full bg-primary opacity-60" />
                  )}
                </span>
                <div className="rounded-2xl border border-border bg-surface-raised p-6 shadow-2 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-3">
                  <div className="font-heading text-lg font-semibold">
                    {item.role}
                  </div>
                  <div className="mb-2 font-mono text-xs uppercase tracking-wide text-text-secondary">
                    {item.company}
                    {item.meta ? ` · ${item.meta}` : ""}
                  </div>
                  <p className="text-sm text-text-secondary">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Experience;
