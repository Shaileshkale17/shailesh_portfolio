import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "../../animations/gsapConfig";
import Button from "../ui/Button";

const Hero = () => {
  const rootRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.1 });
      tl.from(".hero-badge", { opacity: 0, y: -12, duration: 0.6, ease: "power3.out" })
        .from(".hero-line", { yPercent: 120, opacity: 0, duration: 1, stagger: 0.08, ease: "power4.out" }, "-=0.3")
        .from(".hero-sub", { opacity: 0, y: 20, duration: 0.8, ease: "power3.out" }, "-=0.5")
        .from(".hero-cta > *", { opacity: 0, scale: 0.92, duration: 0.6, stagger: 0.08, ease: "power3.out" }, "-=0.4")
        .from(".scroll-cue", { opacity: 0, duration: 0.8, ease: "power2.out" }, "-=0.2");

      if (!prefersReducedMotion()) {
        gsap.to(".scroll-cue-line", { scaleY: 0.3, transformOrigin: "top", duration: 1.4, ease: "power1.inOut", repeat: -1, yoyo: true });
      }
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <header ref={rootRef} className="relative flex min-h-screen items-center overflow-hidden pt-24">
      <div className="container relative">
        <div className="hero-badge glass mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </span>
          Available for select engineering roles
        </div>
        <h1 className="font-heading font-bold leading-[1.02] tracking-tight text-[clamp(2.5rem,5vw+1rem,4.5rem)]">
          <div className="overflow-hidden">
            <span className="hero-line block">Shailesh Kale —</span>
          </div>
          <div className="overflow-hidden">
            <span className="hero-line gradient-text block">Frontend-leaning</span>
          </div>
          <div className="overflow-hidden">
            <span className="hero-line block">full-stack engineer.</span>
          </div>
        </h1>
        <p className="hero-sub mt-6 max-w-xl text-lg text-text-secondary">
          I turn ambiguous product requirements into fast, reliable interfaces — 35% technical debt cut,
          30% faster load times, 40+ critical bugs closed, with React, Node.js, and MongoDB end to end.
        </p>
        <div className="hero-cta mt-8 flex flex-wrap gap-4">
          <Button as="a" href="#projects" variant="primary">
            View projects
          </Button>
          <Button as="a" href="#contact" variant="secondary">
            Get in touch
          </Button>
        </div>
      </div>
      <a
        href="#about"
        aria-label="Scroll to About section"
        className="scroll-cue absolute bottom-10 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-xs uppercase tracking-widest text-text-secondary md:flex"
      >
        Scroll
        <span className="scroll-cue-line block h-10 w-px bg-gradient-to-b from-text-secondary to-transparent" />
      </a>
    </header>
  );
};

export default Hero;
