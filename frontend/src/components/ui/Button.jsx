import { useRef } from "react";
import { gsap } from "../../animations/gsapConfig";

// Magnetic button: nudges toward the cursor on hover, snaps back with an elastic ease on leave.
const Button = ({ as: Tag = "button", variant = "primary", className = "", children, ...rest }) => {
  const ref = useRef(null);

  const base =
    "inline-flex items-center justify-center rounded-[10px] font-semibold text-sm px-6 py-3 transition-colors duration-200";
  const variants = {
    primary: "bg-gradient-to-r from-primary to-accent text-white shadow-2 hover:shadow-glow",
    secondary: "border border-border text-text hover:bg-surface-raised",
    ghost: "text-primary hover:underline",
  };

  const handleMove = (e) => {
    const el = ref.current;
    if (!el || window.matchMedia("(pointer: coarse)").matches) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    gsap.to(el, { x: x * 0.3, y: y * 0.3, duration: 0.4, ease: "power3.out" });
  };

  const handleLeave = () => {
    if (!ref.current) return;
    gsap.to(ref.current, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" });
  };

  return (
    <Tag
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={`${base} ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
};

export default Button;
