import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "../../animations/gsapConfig";

// Ambient, mouse-reactive backdrop for the whole page. Two layers:
//  1. Three blurred gradient orbs that drift slowly on their own and get a
//     gentle parallax nudge from the cursor (different depth per orb).
//  2. A lightweight canvas of ~36 floating points connected by faint lines
//     when close together, plus a soft attraction toward the pointer.
// Both layers are `pointer-events: none` and sit behind all content. Canvas
// work is capped and paused off-screen/on reduced-motion/tab-blur to protect
// frame budget.
const InteractiveBackground = () => {
  const orbRefs = useRef([]);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Orb parallax
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const isTouch = window.matchMedia("(pointer: coarse)").matches;

    const quickSetters = orbRefs.current.map((el) => ({
      x: gsap.quickTo(el, "x", { duration: 1.2, ease: "power3.out" }),
      y: gsap.quickTo(el, "y", { duration: 1.2, ease: "power3.out" }),
    }));

    const depths = [0.02, 0.035, 0.05];

    const handlePointer = (clientX, clientY) => {
      const { innerWidth, innerHeight } = window;
      const dx = clientX - innerWidth / 2;
      const dy = clientY - innerHeight / 2;
      quickSetters.forEach((setter, i) => {
        setter.x(dx * depths[i]);
        setter.y(dy * depths[i]);
      });
    };

    const onMouseMove = (e) => handlePointer(e.clientX, e.clientY);
    const onTouchMove = (e) => {
      const t = e.touches[0];
      if (t) handlePointer(t.clientX, t.clientY);
    };

    if (isTouch) {
      window.addEventListener("touchmove", onTouchMove, { passive: true });
    } else {
      window.addEventListener("mousemove", onMouseMove, { passive: true });
    }

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  // Particle field
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || prefersReducedMotion()) return;

    const ctx = canvas.getContext("2d");
    let width, height, dpr;
    let particles = [];
    let raf = null;
    let running = true;
    const pointer = { x: -9999, y: -9999, active: false };

    const COUNT = window.innerWidth < 768 ? 20 : 36;
    const LINK_DIST = 140;
    const POINTER_RADIUS = 160;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const makeParticles = () => {
      particles = Array.from({ length: COUNT }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        r: Math.random() * 1.6 + 0.8,
      }));
    };

    resize();
    makeParticles();

    const rootStyles = getComputedStyle(document.documentElement);
    const getAccent = () => rootStyles.getPropertyValue("--color-primary-light").trim() || "#a78bfa";

    const draw = () => {
      if (!running) return;
      ctx.clearRect(0, 0, width, height);
      const accent = getAccent();

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (pointer.active) {
          const dx = pointer.x - p.x;
          const dy = pointer.y - p.y;
          const dist = Math.hypot(dx, dy);
          if (dist < POINTER_RADIUS) {
            const force = (1 - dist / POINTER_RADIUS) * 0.02;
            p.vx += dx * force * 0.02;
            p.vy += dy * force * 0.02;
          }
        }

        p.vx *= 0.99;
        p.vy *= 0.99;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
        p.x = Math.max(0, Math.min(width, p.x));
        p.y = Math.max(0, Math.min(height, p.y));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = accent;
        ctx.globalAlpha = 0.35;
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < LINK_DIST) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = accent;
            ctx.globalAlpha = (1 - dist / LINK_DIST) * 0.12;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;

      raf = requestAnimationFrame(draw);
    };

    const onMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active = true;
    };
    const onTouchMove = (e) => {
      const t = e.touches[0];
      if (!t) return;
      const rect = canvas.getBoundingClientRect();
      pointer.x = t.clientX - rect.left;
      pointer.y = t.clientY - rect.top;
      pointer.active = true;
    };
    const onLeave = () => {
      pointer.active = false;
    };
    const onResize = () => {
      resize();
    };
    const onVisibility = () => {
      running = document.visibilityState === "visible";
      if (running && !raf) raf = requestAnimationFrame(draw);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("mouseleave", onLeave);
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);

    raf = requestAnimationFrame(draw);

    return () => {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div ref={containerRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div
        ref={(el) => (orbRefs.current[0] = el)}
        className="orb absolute -left-[10%] top-[-10%] h-[42vw] w-[42vw] max-w-[560px] max-h-[560px] rounded-full opacity-40 blur-[90px]"
        style={{ background: "radial-gradient(circle, rgba(124,58,237,0.55), transparent 70%)" }}
      />
      <div
        ref={(el) => (orbRefs.current[1] = el)}
        className="orb absolute right-[-8%] top-[20%] h-[36vw] w-[36vw] max-w-[480px] max-h-[480px] rounded-full opacity-30 blur-[90px]"
        style={{ background: "radial-gradient(circle, rgba(34,211,238,0.45), transparent 70%)" }}
      />
      <div
        ref={(el) => (orbRefs.current[2] = el)}
        className="orb absolute left-[20%] bottom-[-15%] h-[38vw] w-[38vw] max-w-[520px] max-h-[520px] rounded-full opacity-25 blur-[100px]"
        style={{ background: "radial-gradient(circle, rgba(167,139,250,0.4), transparent 70%)" }}
      />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full opacity-70" />
      <div className="grain absolute inset-0" />
    </div>
  );
};

export default InteractiveBackground;
