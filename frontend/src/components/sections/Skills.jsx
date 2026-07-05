import { useEffect, useRef, useState } from "react";
import { revealSection } from "../../animations/revealTimeline";
import { fetchSkills } from "../../lib/api";
import SectionHeading from "../ui/SectionHeading";
import Chip from "../ui/Chip";

const FALLBACK_SKILLS = [
  { category: "Languages", name: "JavaScript" },
  { category: "Languages", name: "TypeScript" },
  { category: "Languages", name: "HTML5" },
  { category: "Languages", name: "CSS3" },
  { category: "Frontend", name: "React" },
  { category: "Frontend", name: "Redux Toolkit" },
  { category: "Frontend", name: "GSAP" },
  { category: "Frontend", name: "Tailwind CSS" },
  { category: "Backend", name: "Node.js" },
  { category: "Backend", name: "Express" },
  { category: "Backend", name: "JWT / RBAC" },
  { category: "Backend", name: "WebSockets" },
  { category: "Database & Tools", name: "MongoDB" },
  { category: "Database & Tools", name: "Redis" },
  { category: "Database & Tools", name: "Git" },
  { category: "Database & Tools", name: "Docker" },
];

const CATEGORY_ORDER = ["Languages", "Frontend", "Backend", "Database & Tools"];

const Skills = () => {
  const rootRef = useRef(null);
  const [skills, setSkills] = useState(FALLBACK_SKILLS);

  useEffect(() => {
    fetchSkills()
      .then((data) => data?.length && setSkills(data))
      .catch(() => setSkills(FALLBACK_SKILLS));
  }, []);

  useEffect(() => revealSection(rootRef.current), [skills]);

  const grouped = CATEGORY_ORDER.map((category) => ({
    category,
    items: skills.filter((s) => s.category === category),
  })).filter((g) => g.items.length);

  return (
    <section id="skills" ref={rootRef} className="py-[var(--space-section)]">
      <div className="container">
        <SectionHeading
          eyebrow="03 — Skills"
          title="The stack, categorized."
          subtitle="Not a keyword wall — the tools he reaches for daily, grouped by where they sit in the request lifecycle."
        />
        <div className="space-y-8">
          {grouped.map((group) => (
            <div key={group.category} className="reveal">
              <div className="mb-3 font-mono text-xs uppercase tracking-wide text-text-secondary">
                {group.category}
              </div>
              <div className="flex flex-wrap gap-3">
                {group.items.map((skill) => (
                  <Chip key={skill.name}>{skill.name}</Chip>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;
