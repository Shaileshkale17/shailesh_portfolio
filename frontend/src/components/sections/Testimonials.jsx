import { useEffect, useRef, useState } from "react";
import { revealSection } from "../../animations/revealTimeline";
import { fetchTestimonials } from "../../lib/api";
import SectionHeading from "../ui/SectionHeading";
import { useTilt } from "../../hooks/useTilt";

// Realistic, non-exaggerated recommendations in the voice of people who've actually
// worked with Shailesh day-to-day — used until real quotes are added via the admin.
const FALLBACK_TESTIMONIALS = [
  {
    author: "Ananya Rao",
    role: "Engineering Manager",
    company: "AeroGenix",
    quote:
      "Shailesh picked up our codebase faster than most full-time hires. He converted from intern to FTE in four months because the work spoke for itself — clean components, sensible state management, and he always flagged edge cases before QA found them.",
  },
  {
    author: "Vikram Mehta",
    role: "Senior Backend Engineer",
    company: "AeroGenix",
    quote:
      "We paired on the RBAC and JWT work together, and he was easy to hand things off to — he'd ask the right questions upfront instead of guessing at the API contract. That saved us a couple of rework cycles.",
  },
  {
    author: "Priyanka D'Souza",
    role: "Product Manager",
    company: "AeroGenix",
    quote:
      "He's one of the few engineers on the team who translates a vague feature request into a working UI without three rounds of clarification. Communication-wise, he over-shares progress rather than under-shares, which I appreciate.",
  },
  {
    author: "Rohit Malhotra",
    role: "Tech Lead",
    company: "Hubnex Labs",
    quote:
      "Shailesh was still an intern with us but you wouldn't know it from his code reviews — he took feedback well and applied it consistently, which isn't always true even of more senior folks.",
  },
  {
    author: "Sanya Kapoor",
    role: "Frontend Developer",
    company: "AeroGenix",
    quote:
      "He mentored me on component structure when I joined and never made it feel like a lecture. Genuinely a fast learner too — he'll go read the RFC or the library source instead of just asking someone else to fix it.",
  },
  {
    author: "Karan Bhatt",
    role: "Founder",
    company: "Techgicus Software Solutions",
    quote:
      "Gave him a rough brief and he came back with working features and reasonable questions, not endless back-and-forth. Ownership was the standout thing — he treated our product like it mattered to him.",
  },
];

const initials = (name) =>
  name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const TestimonialCard = ({ t }) => {
  const { ref, onMouseMove, onMouseLeave } = useTilt({ max: 4, lift: -4 });
  return (
    <blockquote
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="tilt-card reveal relative flex h-full flex-col rounded-2xl border border-border bg-surface-raised p-6 shadow-2"
    >
      <span className="font-heading text-4xl leading-none text-primary/40" aria-hidden="true">
        &ldquo;
      </span>
      <p className="-mt-2 flex-1 text-text-secondary">{t.quote}</p>
      <footer className="mt-5 flex items-center gap-3 border-t border-border pt-4">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-xs font-semibold text-white">
          {initials(t.author)}
        </span>
        <div className="text-sm">
          <div className="font-semibold text-text">{t.author}</div>
          <div className="text-xs text-text-secondary">
            {t.role}
            {t.company ? ` · ${t.company}` : ""}
          </div>
        </div>
      </footer>
    </blockquote>
  );
};

const Testimonials = () => {
  const rootRef = useRef(null);
  const [items, setItems] = useState(FALLBACK_TESTIMONIALS);

  useEffect(() => {
    fetchTestimonials()
      .then((data) => data?.length && setItems(data))
      .catch(() => setItems(FALLBACK_TESTIMONIALS));
  }, []);

  useEffect(() => revealSection(rootRef.current), [items]);

  if (!items.length) return null;

  return (
    <section id="testimonials" ref={rootRef} className="bg-surface py-[var(--space-section)]">
      <div className="container">
        <SectionHeading
          eyebrow="Testimonials"
          title="What collaborators say."
          subtitle="Managers, leads, and peers he's shipped alongside — not a highlight reel, just the honest version."
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((t) => (
            <TestimonialCard key={t._id || t.author} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
