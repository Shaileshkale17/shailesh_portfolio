import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, prefersReducedMotion } from "../animations/gsapConfig";

// Wires up Lenis smooth-scroll and keeps it in lockstep with GSAP's ticker so
// ScrollTrigger-driven reveals stay perfectly in sync with the eased scroll
// position (the standard Lenis + GSAP integration pattern). Skipped entirely
// when the user prefers reduced motion — native scroll behaves normally.
export const useSmoothScroll = () => {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);
};
