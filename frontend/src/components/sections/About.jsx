import { useEffect, useRef } from "react";
import { revealSection } from "../../animations/revealTimeline";
import SectionHeading from "../ui/SectionHeading";

const About = () => {
  const rootRef = useRef(null);
  useEffect(() => revealSection(rootRef.current), []);

  return (
    <section id="about" ref={rootRef} className="py-[var(--space-section)]">
      <div className="container grid gap-12 md:grid-cols-2 md:gap-10">
        <div>
          <SectionHeading
            eyebrow="01 — About"
            title="Commerce degree. Self-taught stack. Four months to full-time."
          />
          <blockquote className="reveal mt-2 border-l-2 border-primary/50 pl-5 font-heading text-xl italic leading-snug text-text md:text-2xl">
            "I don't just close tickets — I close the gap between what a product needs and what the code
            actually does."
          </blockquote>
        </div>
        <div className="space-y-5 text-text-secondary">
          <p className="reveal">
            Shailesh came into engineering the unconventional way — a Bachelor's in Commerce, not Computer
            Science — and taught himself the MERN stack from first principles. Three internships later
            (Techgicus, then Hubnex Labs, then <strong className="text-text">AeroGenix</strong>), he converted
            from intern to full-time engineer in just four months, one of the fastest conversions on the team.
          </p>
          <p className="reveal">
            His working style is outcome-first: every feature ships with a number attached, whether that's a
            load-time improvement, a bug count closed, or a sprint delivered on time. He treats frontend craft
            and backend reliability as one discipline, not two — an RBAC module is only "done" once the UI, the
            API, and the token logic all agree.
          </p>
          <p className="reveal">
            Beyond shipping code, he conducts technical interviews for frontend and MERN stack candidates and
            mentors junior engineers on component design and code-review standards — turning what he learned
            the hard way into a faster path for the next person.
          </p>
          <p className="reveal">
            Off the clock, that same instinct for measurable progress goes inward: steady DSA practice, short
            technical write-ups, and a running list of architecture patterns worth stealing for the next project.
          </p>
        </div>
      </div>
    </section>
  );
};

export default About;
