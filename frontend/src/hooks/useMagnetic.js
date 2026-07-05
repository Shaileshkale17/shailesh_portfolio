import { useRef } from "react";
import { gsap, prefersReducedMotion } from "../animations/gsapConfig";

// Shared magnetic-hover behavior: the element nudges toward the cursor while
// hovered and springs back with an elastic ease on release. Strength controls
// how far it travels relative to the cursor offset; disabled on touch and
// when the user prefers reduced motion.
export const useMagnetic = (strength = 0.35) => {
  const ref = useRef(null);

  const onMouseMove = (e) => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || window.matchMedia("(pointer: coarse)").matches) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    gsap.to(el, { x: x * strength, y: y * strength, duration: 0.5, ease: "power3.out" });
  };

  const onMouseLeave = () => {
    if (!ref.current) return;
    gsap.to(ref.current, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.4)" });
  };

  return { ref, onMouseMove, onMouseLeave };
};
