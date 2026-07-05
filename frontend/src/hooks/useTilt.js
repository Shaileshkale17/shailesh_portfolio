import { useRef } from "react";
import { gsap, prefersReducedMotion } from "../animations/gsapConfig";

// Subtle 3D tilt-on-hover for cards: rotates toward the cursor within a small
// range and lifts slightly, with a soft radial highlight tracking the pointer
// via CSS custom properties. Disabled on touch and reduced-motion.
export const useTilt = ({ max = 8, lift = -6, scale = 1.01 } = {}) => {
  const ref = useRef(null);

  const disabled = () =>
    typeof window !== "undefined" &&
    (prefersReducedMotion() || window.matchMedia("(pointer: coarse)").matches);

  const onMouseMove = (e) => {
    const el = ref.current;
    if (!el || disabled()) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rotateX = (0.5 - py) * max;
    const rotateY = (px - 0.5) * max;

    gsap.to(el, {
      rotateX,
      rotateY,
      y: lift,
      scale,
      duration: 0.5,
      ease: "power2.out",
      transformPerspective: 800,
    });
    el.style.setProperty("--spot-x", `${px * 100}%`);
    el.style.setProperty("--spot-y", `${py * 100}%`);
    el.style.setProperty("--spot-opacity", "1");
  };

  const onMouseLeave = () => {
    const el = ref.current;
    if (!el) return;
    gsap.to(el, { rotateX: 0, rotateY: 0, y: 0, scale: 1, duration: 0.6, ease: "power3.out" });
    el.style.setProperty("--spot-opacity", "0");
  };

  return { ref, onMouseMove, onMouseLeave };
};
