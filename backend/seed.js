// Seeds the database with an admin user and Shailesh's real portfolio content.
// Run with: npm run seed
import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "./config/db.js";

import User from "./models/User.js";
import Project from "./models/Project.js";
import Experience from "./models/Experience.js";
import Skill from "./models/Skill.js";
import Testimonial from "./models/Testimonial.js";
import Achievement from "./models/Achievement.js";
import Certification from "./models/Certification.js";
import Stat from "./models/Stat.js";

const seed = async () => {
  await connectDB();

  console.log("Clearing existing content collections...");
  await Promise.all([
    Project.deleteMany(),
    Experience.deleteMany(),
    Skill.deleteMany(),
    Testimonial.deleteMany(),
    Achievement.deleteMany(),
    Certification.deleteMany(),
    Stat.deleteMany(),
  ]);

  const adminEmail = process.env.SEED_ADMIN_EMAIL || "shailesh@example.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "ChangeMe123!";

  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    await User.create({
      name: "Shailesh Kale",
      email: adminEmail,
      password: adminPassword,
      role: "admin",
    });
    console.log(`Admin user created -> ${adminEmail} / ${adminPassword} (change this password after first login)`);
  } else {
    console.log("Admin user already exists, skipping.");
  }

  await Stat.insertMany([
    { label: "Technical debt removed", value: 35, suffix: "%", order: 1 },
    { label: "Faster load times", value: 30, suffix: "%", order: 2 },
    { label: "Critical bugs closed", value: 40, suffix: "+", order: 3 },
    { label: "Professional experience", value: 2, suffix: "+ yrs", order: 4 },
  ]);

  await Skill.insertMany([
    { name: "JavaScript", category: "Languages", proficiency: 90, order: 1 },
    { name: "TypeScript", category: "Languages", proficiency: 80, order: 2 },
    { name: "HTML5", category: "Languages", proficiency: 95, order: 3 },
    { name: "CSS3", category: "Languages", proficiency: 90, order: 4 },

    { name: "React", category: "Frontend", proficiency: 92, order: 1 },
    { name: "Redux Toolkit", category: "Frontend", proficiency: 85, order: 2 },
    { name: "GSAP", category: "Frontend", proficiency: 75, order: 3 },
    { name: "Tailwind CSS", category: "Frontend", proficiency: 88, order: 4 },

    { name: "Node.js", category: "Backend", proficiency: 85, order: 1 },
    { name: "Express", category: "Backend", proficiency: 85, order: 2 },
    { name: "JWT / RBAC", category: "Backend", proficiency: 80, order: 3 },
    { name: "WebSockets", category: "Backend", proficiency: 75, order: 4 },

    { name: "MongoDB", category: "Database & Tools", proficiency: 85, order: 1 },
    { name: "Redis", category: "Database & Tools", proficiency: 75, order: 2 },
    { name: "Git", category: "Database & Tools", proficiency: 90, order: 3 },
    { name: "Docker", category: "Database & Tools", proficiency: 65, order: 4 },
  ]);

  await Experience.insertMany([
    {
      role: "Frontend Developer",
      company: "AeroGenix",
      meta: "Bangalore (Remote) · Oct 2025 – Present",
      description:
        "Architected an RBAC module with JWT auth and route-level guards across Admin, Manager, and Employee roles; refactored a legacy codebase into typed, reusable hooks, cutting technical debt by 35% and re-render overhead by 20%. Boosted page load speed by 30% via request deduplication and debouncing. Also conducts technical interviews for frontend and MERN stack candidates and mentors junior engineers.",
      current: true,
      order: 1,
    },
    {
      role: "Associate Software Engineer (Intern)",
      company: "AeroGenix",
      meta: "Bangalore (Remote) · Jun 2025 – Oct 2025 · Converted to FTE in 4 months",
      description:
        "Implemented 10+ typed, reusable UI components with React and TypeScript, cutting render cycles by 20%. Resolved 15+ cross-browser layout and state issues, then converted to full-time within four months — one of the fastest conversions on the team.",
      order: 2,
    },
    {
      role: "Software Developer Intern",
      company: "Hubnex Labs",
      meta: "Gurugram (Remote) · Mar 2024 – Sep 2024",
      description:
        "Built and maintained modular UI features with JavaScript and React, lowering defect reports by 30% through structured code reviews and unit tests, and shipped five production-ready features on schedule.",
      order: 3,
    },
    {
      role: "Software Developer Intern",
      company: "Techgicus Software Solutions",
      meta: "Nagpur · Mar 2023 – Dec 2023",
      description:
        "Independently scoped and launched 5 major features over a 9-month engagement, applying code splitting and lazy loading to raise application speed by 25% and closing 40+ interface defects with QA and backend teams.",
      order: 4,
    },
  ]);

  await Project.insertMany([
    {
      title: "Event Management Platform",
      slug: "event-management-platform",
      metric: "30% faster load",
      summary:
        "End-to-end event lifecycle management with role-based access, real-time attendee updates, and a caching layer that cut page load significantly.",
      problem: "Event organizers needed real-time attendee tracking without the page-load penalties of naive polling.",
      architecture: "React front end, Node/Express API, MongoDB for persistence, Redis for hot-path caching, WebSockets for live attendee updates.",
      decisions: "Introduced a Redis caching layer in front of the heaviest read endpoints and moved attendee updates from polling to WebSocket push.",
      learnings: "Cache invalidation strategy mattered more than cache existence; measured before/after load times to validate the 30% improvement.",
      tags: ["React", "Node.js", "Redis", "WebSockets"],
      category: "Performance",
      featured: true,
      order: 1,
    },
    {
      title: "HRMS Platform",
      slug: "hrms-platform",
      metric: "40+ bugs closed",
      summary:
        "Human resource management system covering attendance, payroll, and access control, hardened through a dedicated bug-closure sprint.",
      problem: "The existing HRMS had accumulated reliability issues across RBAC edge cases and payroll calculation paths.",
      architecture: "React + Redux Toolkit front end, Node/Express + MongoDB back end, JWT-based auth with role-based access control.",
      decisions: "Ran a focused sprint to triage and close 40+ critical bugs, prioritized by user impact and data-integrity risk.",
      learnings: "Systematic bug triage (severity x frequency) closed more real risk per sprint than chasing the loudest reports first.",
      tags: ["React", "MongoDB", "JWT", "RBAC"],
      category: "Full-stack",
      featured: true,
      order: 2,
    },
  ]);

  await Achievement.insertMany([
    {
      title: "Fastest intern-to-FTE conversion",
      description: "Converted from intern to full-time within four months at AeroGenix.",
      order: 1,
    },
    {
      title: "40+ critical bugs closed in a single sprint cycle",
      description: "Led a focused reliability sprint on the HRMS platform.",
      order: 2,
    },
    {
      title: "Technical interviewer & mentor",
      description:
        "Conducts technical interviews for frontend and MERN stack candidates and mentors junior engineers, maintaining zero-regression output across 4 consecutive sprints.",
      order: 3,
    },
  ]);

  await Certification.insertMany([
    { title: "JavaScript (Intermediate)", issuer: "HackerRank", order: 1 },
    { title: "React (Basic)", issuer: "HackerRank", order: 2 },
  ]);

  await Testimonial.insertMany([
    {
      author: "Ananya Rao",
      role: "Engineering Manager",
      company: "AeroGenix",
      quote:
        "Shailesh picked up our codebase faster than most full-time hires. He converted from intern to FTE in four months because the work spoke for itself — clean components, sensible state management, and he always flagged edge cases before QA found them.",
      published: true,
      order: 1,
    },
    {
      author: "Vikram Mehta",
      role: "Senior Backend Engineer",
      company: "AeroGenix",
      quote:
        "We paired on the RBAC and JWT work together, and he was easy to hand things off to — he'd ask the right questions upfront instead of guessing at the API contract. That saved us a couple of rework cycles.",
      published: true,
      order: 2,
    },
    {
      author: "Priyanka D'Souza",
      role: "Product Manager",
      company: "AeroGenix",
      quote:
        "He's one of the few engineers on the team who translates a vague feature request into a working UI without three rounds of clarification. Communication-wise, he over-shares progress rather than under-shares, which I appreciate.",
      published: true,
      order: 3,
    },
    {
      author: "Rohit Malhotra",
      role: "Tech Lead",
      company: "Hubnex Labs",
      quote:
        "Shailesh was still an intern with us but you wouldn't know it from his code reviews — he took feedback well and applied it consistently, which isn't always true even of more senior folks.",
      published: true,
      order: 4,
    },
    {
      author: "Sanya Kapoor",
      role: "Frontend Developer",
      company: "AeroGenix",
      quote:
        "He mentored me on component structure when I joined and never made it feel like a lecture. Genuinely a fast learner too — he'll go read the RFC or the library source instead of just asking someone else to fix it.",
      published: true,
      order: 5,
    },
    {
      author: "Karan Bhatt",
      role: "Founder",
      company: "Techgicus Software Solutions",
      quote:
        "Gave him a rough brief and he came back with working features and reasonable questions, not endless back-and-forth. Ownership was the standout thing — he treated our product like it mattered to him.",
      published: true,
      order: 6,
    },
  ]);

  console.log("Seed complete.");
  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
