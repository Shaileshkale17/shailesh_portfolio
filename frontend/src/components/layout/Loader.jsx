import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "../../animations/gsapConfig";

// Full-bleed preloader: counts to 100 alongside a thin gradient progress bar,
// then wipes upward to reveal the hero mid-entrance. Skips straight to done
// when the user prefers reduced motion.
const Loader = ({ onComplete }) => {
  const counterRef = useRef(null);
  const panelRef = useRef(null);
  const barRef = useRef(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setDone(true);
      onComplete?.();
      return;
    }

    const counterObj = { value: 0 };
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(panelRef.current, {
          yPercent: -100,
          duration: 0.9,
          ease: "power2.inOut",
          onComplete: () => {
            setDone(true);
            onComplete?.();
          },
        });
      },
    });

    tl.to(counterObj, {
      value: 100,
      duration: 1.4,
      ease: "power2.inOut",
      snap: { value: 1 },
      onUpdate: () => {
        if (counterRef.current) counterRef.current.textContent = Math.round(counterObj.value);
        if (barRef.current) barRef.current.style.width = `${counterObj.value}%`;
      },
    });

    return () => tl.kill();
  }, [onComplete]);

  if (done) return null;

  return (
    <div
      ref={panelRef}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-bg"
      aria-hidden="true"
    >
      <div className="font-heading text-2xl font-bold">
        shailesh<span className="gradient-text">.dev</span>
      </div>
      <div className="flex items-center gap-3 font-mono text-sm text-text-secondary">
        <span ref={counterRef}>0</span>
        <span className="text-primary">%</span>
      </div>
      <div className="h-px w-40 overflow-hidden rounded-full bg-border">
        <div ref={barRef} className="h-full w-0 bg-gradient-to-r from-primary to-accent" />
      </div>
    </div>
  );
};

export default Loader;
