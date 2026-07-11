// import { useEffect, useRef, useState } from "react";
// import { gsap, prefersReducedMotion } from "../../animations/gsapConfig";

// // Full-bleed preloader: counts to 100 alongside a thin gradient progress bar,
// // then wipes upward to reveal the hero mid-entrance. Skips straight to done
// // when the user prefers reduced motion.
// const Loader = ({ onComplete }) => {
//   const counterRef = useRef(null);
//   const panelRef = useRef(null);
//   const barRef = useRef(null);
//   const [done, setDone] = useState(false);

//   useEffect(() => {
//     if (prefersReducedMotion()) {
//       setDone(true);
//       onComplete?.();
//       return;
//     }

//     const counterObj = { value: 0 };
//     const tl = gsap.timeline({
//       onComplete: () => {
//         gsap.to(panelRef.current, {
//           yPercent: -100,
//           duration: 0.9,
//           ease: "power2.inOut",
//           onComplete: () => {
//             setDone(true);
//             onComplete?.();
//           },
//         });
//       },
//     });

//     tl.to(counterObj, {
//       value: 100,
//       duration: 1.4,
//       ease: "power2.inOut",
//       snap: { value: 1 },
//       onUpdate: () => {
//         if (counterRef.current)
//           counterRef.current.textContent = Math.round(counterObj.value);
//         if (barRef.current) barRef.current.style.width = `${counterObj.value}%`;
//       },
//     });

//     return () => tl.kill();
//   }, [onComplete]);

//   if (done) return null;

//   return (
//     <div
//       ref={panelRef}
//       className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-bg"
//       aria-hidden="true"
//     >
//       <div className="font-heading text-2xl font-bold">
//         shailesh<span className="gradient-text">.dev</span>
//       </div>
//       <div className="flex items-center gap-3 font-mono text-sm text-text-secondary">
//         <span ref={counterRef}>0</span>
//         <span className="text-primary">%</span>
//       </div>
//       <div className="h-px w-40 overflow-hidden rounded-full bg-border">
//         <div
//           ref={barRef}
//           className="h-full w-0 bg-gradient-to-r from-primary to-accent"
//         />
//       </div>
//     </div>
//   );
// };

// export default Loader;

import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "../../animations/gsapConfig";

/**
 * WaterFillLoader
 * ------------------------------------------------------------------------
 * Splash-screen preloader where the wordmark fills up like a glass vessel
 * with real, animated water: a rising fill level, two drifting wave layers
 * for surface motion, a gentle bob for ripple, and a zoom + glow finale
 * before handing off to `onComplete` (typically a route change to Home).
 *
 * Flow: mount → measure wordmark → water rises 0→100% → zoom-in + glow →
 * panel fades out → onComplete() fires. The real Home page should already
 * be mounted underneath (or mounted on onComplete before this unmounts)
 * so the hand-off has no blank frame / flicker.
 *
 * Respects prefers-reduced-motion: skips straight to onComplete with no
 * animation in that case.
 * ------------------------------------------------------------------------
 * Structure:
 *  - <clipPath id="wordmarkClip">   exact letterform shape, used to clip
 *                                    the water so it only fills the text
 *  - hidden measurement <text>      same glyphs, used once to read the
 *                                    bounding box (top/bottom fill range)
 *  - outline <text>                 faint stroke, keeps the wordmark
 *                                    legible before/while it fills
 *  - water group (clipped)          two wave <path>s + solid body,
 *                                    translated vertically = fill level
 *  - glow <text>                    invisible duplicate, filter-blurred,
 *                                    faded in only for the 100% finale
 * ------------------------------------------------------------------------
 */

// ---- Brand + timing config -------------------------------------------------
const APP_NAME = "shailesh"; // swap for your app name/logo text
const APP_SUFFIX = ".dev";

const VIEWBOX_W = 800;
const VIEWBOX_H = 220;
const WAVE_TILE_W = 400; // width of one repeating wave unit
const FONT_SIZE = 88;

const FILL_DURATION = 2.4; // seconds for water to reach 100%
const ANTICIPATION_DURATION = 0.45; // small bump + glow-in before the big zoom
const ZOOM_DURATION = 1.1; // full-screen zoom-through duration
const ZOOM_SCALE = 26; // how large the wordmark grows to fill/exceed the viewport
const HOLD_BEFORE_EXIT = 0.15; // beat held at full glow before the zoom starts

const textStyle = {
  fontFamily: "var(--font-heading, sans-serif)",
  fontWeight: 800,
  fontSize: FONT_SIZE,
};

// Builds a smooth, seamlessly-tileable sine-style wave path (as an SVG
// path `d` string) that also closes down into a filled body, so it can
// double as a solid "body of water" beneath the wave crest.
function buildWavePath(
  amplitude,
  baseline,
  tileWidth = WAVE_TILE_W,
  repeats = 3,
) {
  let d = `M0,${baseline}`;
  for (let i = 0; i < repeats; i++) {
    const x0 = i * tileWidth;
    const midX = x0 + tileWidth / 2;
    const endX = x0 + tileWidth;
    d += ` C${x0 + tileWidth * 0.25},${baseline - amplitude} ${x0 + tileWidth * 0.25},${baseline + amplitude} ${midX},${baseline}`;
    d += ` C${midX + tileWidth * 0.25},${baseline - amplitude} ${midX + tileWidth * 0.25},${baseline + amplitude} ${endX},${baseline}`;
  }
  d += ` V${VIEWBOX_H + 200} H0 Z`; // extend well past the viewBox so the "body" below the crest is always solid
  return d;
}

const Loader = ({ onComplete }) => {
  const panelRef = useRef(null);
  const svgWrapperRef = useRef(null); // scaled as one unit for the full-screen zoom finale
  const textMeasureRef = useRef(null);
  const waterGroupRef = useRef(null);
  const waveFrontRef = useRef(null);
  const waveBackRef = useRef(null);
  const fillClipGroupRef = useRef(null);
  const glowTextRef = useRef(null);
  const percentRef = useRef(null);
  const srStatusRef = useRef(null);

  const [bbox, setBbox] = useState(null); // measured wordmark bounding box
  const [done, setDone] = useState(false);

  // Measure the wordmark once mounted so the water's vertical travel range
  // matches this exact font/text.
  useEffect(() => {
    if (textMeasureRef.current) {
      setBbox(textMeasureRef.current.getBBox());
    }
  }, []);

  useEffect(() => {
    if (!bbox) return;

    if (prefersReducedMotion()) {
      setDone(true);
      onComplete?.();
      return;
    }

    const ctx = gsap.context(() => {
      const topY = bbox.y - 6; // slight overshoot so the fill reads as fully complete
      const bottomY = bbox.y + bbox.height + 12; // start fully below the letters (0%)

      // Single shared state so the fill tween and the idle ripple bob can
      // both drive the same transform without fighting each other.
      const state = { fillY: bottomY, bob: 0 };
      const applyTransform = () => {
        waterGroupRef.current?.setAttribute(
          "transform",
          `translate(0, ${state.fillY + state.bob})`,
        );
      };
      applyTransform();

      // Continuous horizontal drift on both wave layers - independent of
      // fill progress, keeps running until unmount. Different speeds and
      // opacities give the water a layered, believable ripple depth.
      gsap.to(waveFrontRef.current, {
        x: -WAVE_TILE_W,
        duration: 2.6,
        ease: "none",
        repeat: -1,
      });
      gsap.to(waveBackRef.current, {
        x: -WAVE_TILE_W,
        duration: 4.2,
        ease: "none",
        repeat: -1,
      });

      // Gentle vertical bob layered on the fill level = a "breathing" surface.
      gsap.to(state, {
        bob: 4,
        duration: 1.6,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        onUpdate: applyTransform,
      });

      // Main fill driver: 0% -> 100% over FILL_DURATION.
      const fillTl = gsap.timeline({ onComplete: runFinale });
      fillTl.to(state, {
        fillY: topY,
        duration: FILL_DURATION,
        ease: "power2.inOut",
        onUpdate: () => {
          applyTransform();
          const progress = Math.round(
            ((bottomY - state.fillY) / (bottomY - topY)) * 100,
          );
          if (percentRef.current) percentRef.current.textContent = progress;
          if (srStatusRef.current)
            srStatusRef.current.textContent = `Loading, ${progress}%`;
        },
      });

      // Finale: a small anticipation bump + glow, then the whole wordmark
      // zooms up to swallow the screen while fading, revealing Home
      // underneath - a "zoom through the letters" transition rather than
      // a subtle scale-tick.
      function runFinale() {
        if (srStatusRef.current)
          srStatusRef.current.textContent = "Loading complete";

        const finale = gsap.timeline({
          onComplete: () => {
            setDone(true);
            onComplete?.();
          },
        });

        finale
          // anticipation: tiny bump + glow ignites
          .to(fillClipGroupRef.current, {
            scale: 1.0,
            transformOrigin: "50% 50%",
            duration: ANTICIPATION_DURATION,
            ease: "power2.out",
          })
          .to(
            glowTextRef.current,
            { opacity: 1, duration: ANTICIPATION_DURATION, ease: "power2.out" },
            "<",
          )
          // brief hold at full glow before the zoom launches
          .to({}, { duration: HOLD_BEFORE_EXIT })
          // the actual full-screen zoom: whole wordmark (water + outline +
          // glow together, since they share svgWrapperRef) grows past the
          // viewport edges while the percent readout and panel fade out
          .to(
            svgWrapperRef.current,
            {
              scale: ZOOM_SCALE,
              transformOrigin: "50% 50%",
              duration: ZOOM_DURATION,
              ease: "power3.in",
            },
            ">",
          )
          .to(
            percentRef.current?.parentElement || percentRef.current,
            { opacity: 0, duration: ZOOM_DURATION * 0.3, ease: "power1.out" },
            "<",
          )
          .to(
            panelRef.current,
            { opacity: 0, duration: ZOOM_DURATION * 0.4, ease: "power1.in" },
            `>-${ZOOM_DURATION * 0.35}`,
          );
      }
    });

    return () => ctx.revert();
  }, [bbox, onComplete]);

  if (done) return null;

  const waveFront = buildWavePath(7, 0);
  const waveBack = buildWavePath(5, 5);

  return (
    <div
      ref={panelRef}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-8 bg-bg"
      style={{ willChange: "opacity" }}
    >
      {/* Screen-reader-only live status; visuals below are decorative */}
      <span
        ref={srStatusRef}
        className="sr-only"
        role="status"
        aria-live="polite"
      >
        Loading, 0%
      </span>

      <svg
        ref={svgWrapperRef}
        viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
        className="w-[80vw]"
        style={{ overflow: "visible", willChange: "transform, opacity" }}
        aria-hidden="true"
      >
        <defs>
          <clipPath id="wordmarkClip">
            <text
              x="50%"
              y="55%"
              textAnchor="middle"
              dominantBaseline="middle"
              style={textStyle}
            >
              {APP_NAME}
              {APP_SUFFIX}
            </text>
          </clipPath>

          <linearGradient id="waterGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-accent, #22d3ee)" />
            <stop offset="100%" stopColor="var(--color-primary, #6366f1)" />
          </linearGradient>

          <filter id="softGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="7" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Hidden reference copy, used only once to measure geometry */}
        <text
          ref={textMeasureRef}
          x="50%"
          y="55%"
          textAnchor="middle"
          dominantBaseline="middle"
          style={textStyle}
          opacity="0"
        >
          {APP_NAME}
          {APP_SUFFIX}
        </text>

        {/* Faint outline - keeps the wordmark legible before/under the fill */}
        <text
          x="50%"
          y="55%"
          textAnchor="middle"
          dominantBaseline="middle"
          style={textStyle}
          fill="none"
          stroke="var(--color-border, #2a2a2a)"
          strokeWidth="1.5"
        >
          {APP_NAME}
          {APP_SUFFIX}
        </text>

        {/* Water fill, clipped to the exact wordmark shape. Scaled as a
            group (not the SVG root) so the finale zoom stays crisp and
            GPU-composited via transform only. */}
        <g ref={fillClipGroupRef} clipPath="url(#wordmarkClip)">
          <g ref={waterGroupRef}>
            <path
              ref={waveBackRef}
              d={waveBack}
              fill="url(#waterGradient)"
              opacity="0.5"
            />
            <path ref={waveFrontRef} d={waveFront} fill="url(#waterGradient)" />
          </g>
        </g>

        {/* Glow duplicate - invisible until the 100% finale fades it in */}
        <text
          ref={glowTextRef}
          x="50%"
          y="55%"
          textAnchor="middle"
          dominantBaseline="middle"
          style={textStyle}
          fill="url(#waterGradient)"
          filter="url(#softGlow)"
          opacity="0"
        >
          {APP_NAME}
          {APP_SUFFIX}
        </text>
      </svg>

      <div
        className="font-mono text-xs tracking-widest text-text-secondary"
        aria-hidden="true"
      >
        <span ref={percentRef}>0</span>
        <span className="text-primary">%</span>
      </div>
    </div>
  );
};

export default Loader;
