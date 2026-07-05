import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "../../animations/gsapConfig";
import { fetchStats } from "../../lib/api";
import SectionHeading from "../ui/SectionHeading";
import { useTilt } from "../../hooks/useTilt";

const StatCard = ({ stat }) => {
  const { ref, onMouseMove, onMouseLeave } = useTilt({ max: 6, lift: -4 });
  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="tilt-card reveal rounded-2xl border border-border bg-surface-raised p-6 text-center shadow-2"
    >
      <div className="font-heading text-4xl font-bold">
        <span className="impact-count" data-target={stat.value}>
          0
        </span>
        <span className="gradient-text">{stat.suffix}</span>
      </div>
      <div className="mt-2 text-sm text-text-secondary">{stat.label}</div>
    </div>
  );
};

const FALLBACK_STATS = [
  { label: "Technical debt removed", value: 35, suffix: "%" },
  { label: "Faster load times", value: 30, suffix: "%" },
  { label: "Critical bugs closed", value: 40, suffix: "+" },
  { label: "Professional experience", value: 2, suffix: "+ yrs" },
];

const Impact = () => {
  const rootRef = useRef(null);
  const [stats, setStats] = useState(FALLBACK_STATS);

  useEffect(() => {
    fetchStats()
      .then((data) => data?.length && setStats(data))
      .catch(() => setStats(FALLBACK_STATS));
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const counters = rootRef.current.querySelectorAll(".impact-count");
      counters.forEach((el) => {
        const target = Number(el.dataset.target);
        const obj = { value: 0 };
        ScrollTrigger.create({
          trigger: el,
          start: "top 85%",
          once: true,
          onEnter: () =>
            gsap.to(obj, {
              value: target,
              duration: 1.8,
              ease: "power1.out",
              snap: { value: 1 },
              onUpdate: () => (el.textContent = obj.value),
            }),
        });
      });
    }, rootRef);
    return () => ctx.revert();
  }, [stats]);

  return (
    <section id="impact" ref={rootRef} className="bg-surface py-[var(--space-section)]">
      <div className="container">
        <SectionHeading
          eyebrow="02 — Impact Snapshot"
          title="Numbers before adjectives."
          subtitle="Every claim on this page is backed by a metric someone measured — not a vibe."
        />
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {stats.map((s) => (
            <StatCard key={s.label} stat={s} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Impact;
