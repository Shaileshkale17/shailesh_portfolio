import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

// Scopes a GSAP context to a component so all its tweens/ScrollTriggers are
// automatically reverted on unmount - prevents animation leaks in a component-driven app.
export const useGsapContext = (setup, deps = []) => {
  const scope = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      setup(scope.current);
    }, scope);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return scope;
};
