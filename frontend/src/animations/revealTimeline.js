import { gsap, ScrollTrigger, EASE, prefersReducedMotion } from "./gsapConfig";

// Shared "section reveal" factory used by every section so entrance motion stays consistent.
// Batches triggers for repeated elements (skill chips, project cards) to reduce reflow cost.
export const revealSection = (root, selector = ".reveal") => {
  if (!root) return;
  const targets = root.querySelectorAll(selector);
  if (!targets.length) return;

  if (prefersReducedMotion()) {
    gsap.set(targets, { opacity: 1, y: 0 });
    return;
  }

  gsap.set(targets, { opacity: 0, y: 40 });

  ScrollTrigger.batch(targets, {
    start: "top 80%",
    onEnter: (batch) =>
      gsap.to(batch, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: EASE.entrance,
        stagger: 0.06,
        overwrite: true,
      }),
    onLeaveBack: (batch) => gsap.set(batch, { opacity: 0, y: 40 }),
  });
};
