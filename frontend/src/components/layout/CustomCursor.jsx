import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "../../animations/gsapConfig";

// Custom cursor + spotlight: a small dot follows the pointer with a cheap quickTo lag,
// scaling and inverting color over interactive elements. Disabled on touch devices and
// when prefers-reduced-motion is set. When active, the native OS cursor is hidden via
// the `custom-cursor-active` class on <html> so there's only ever one visible point —
// otherwise the real cursor and the lagging dot read as two separate, drifting points.
const CustomCursor = () => {
  const dotRef = useRef(null);
  const enabled =
    typeof window !== "undefined" &&
    !window.matchMedia("(pointer: coarse)").matches &&
    !prefersReducedMotion();

  useEffect(() => {
    if (!enabled) return;

    document.documentElement.classList.add("custom-cursor-active");

    const dot = dotRef.current;
    // Tight lag (0.12s) keeps the dot glued to the real pointer instead of visibly
    // trailing behind it during fast movement.
    const moveX = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power3" });
    const moveY = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power3" });

    const onMove = (e) => {
      moveX(e.clientX);
      moveY(e.clientY);
    };

    const interactiveSelector = "a, button, input, textarea, .project-card, .tilt-card, [data-cursor-hover]";
    const onOver = (e) => {
      if (e.target.closest(interactiveSelector)) {
        gsap.to(dot, { scale: 2.5, duration: 0.3, ease: "power2.out" });
      }
    };
    const onOut = (e) => {
      if (e.target.closest(interactiveSelector)) {
        gsap.to(dot, { scale: 1, duration: 0.3, ease: "power2.out" });
      }
    };

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);

    return () => {
      document.documentElement.classList.remove("custom-cursor-active");
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={dotRef}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[999] hidden h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white mix-blend-difference md:block"
    />
  );
};

export default CustomCursor;
