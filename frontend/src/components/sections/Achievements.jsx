import { useEffect, useRef, useState } from "react";
import { revealSection } from "../../animations/revealTimeline";
import { fetchAchievements, fetchCertifications } from "../../lib/api";
import SectionHeading from "../ui/SectionHeading";

// Combines Achievements + Certifications into one "credibility" section, per the design doc's
// sections 11 (Achievements) and 13 (Certifications).
const Achievements = () => {
  const rootRef = useRef(null);
  const [achievements, setAchievements] = useState([]);
  const [certifications, setCertifications] = useState([]);

  useEffect(() => {
    fetchAchievements().then(setAchievements).catch(() => setAchievements([]));
    fetchCertifications().then(setCertifications).catch(() => setCertifications([]));
  }, []);

  useEffect(() => revealSection(rootRef.current), [achievements, certifications]);

  if (!achievements.length && !certifications.length) return null;

  return (
    <section id="achievements" ref={rootRef} className="py-[var(--space-section)]">
      <div className="container grid gap-12 md:grid-cols-2">
        {achievements.length > 0 && (
          <div>
            <SectionHeading eyebrow="11 — Achievements" title="Recognitions along the way." />
            <ul className="space-y-4">
              {achievements.map((a) => (
                <li
                  key={a._id || a.title}
                  className="reveal rounded-xl border border-border bg-surface-raised p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-2"
                >
                  <div className="font-heading font-semibold">{a.title}</div>
                  {a.description && <p className="mt-1 text-sm text-text-secondary">{a.description}</p>}
                </li>
              ))}
            </ul>
          </div>
        )}
        {certifications.length > 0 && (
          <div>
            <SectionHeading eyebrow="13 — Certifications" title="Verifiable credentials." />
            <ul className="space-y-4">
              {certifications.map((c) => (
                <li
                  key={c._id || c.title}
                  className="reveal rounded-xl border border-border bg-surface-raised p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-2"
                >
                  <div className="font-heading font-semibold">{c.title}</div>
                  <div className="mt-1 font-mono text-xs uppercase tracking-wide text-text-secondary">
                    {c.issuer}
                  </div>
                  {c.credentialUrl && (
                    <a href={c.credentialUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm text-primary hover:underline">
                      View credential →
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
};

export default Achievements;
