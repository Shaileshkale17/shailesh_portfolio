import { useEffect, useRef, useState } from "react";
import { gsap } from "../../animations/gsapConfig";
import { useTheme } from "../../context/ThemeContext";

const NAV_LINKS = [
  { href: "#about", label: "About" },
  { href: "#skills", label: "Skills" },
  { href: "#experience", label: "Experience" },
  { href: "#projects", label: "Projects" },
  { href: "#contact", label: "Contact" },
];

const Navbar = () => {
  const navRef = useRef(null);
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      const direction = y > lastY ? 1 : -1;
      lastY = y;
      gsap.to(navRef.current, {
        yPercent: direction === 1 && y > 120 ? -100 : 0,
        duration: 0.35,
        ease: "power2.out",
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 h-[72px] transition-shadow duration-300 ${
        scrolled ? "glass shadow-2" : ""
      }`}
    >
      <div className="container flex h-full items-center justify-between">
        <a href="#" className="font-heading text-lg font-bold">
          shailesh<span className="text-primary">.dev</span>
        </a>
        <ul className="hidden gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="group relative inline-block text-sm text-text-secondary transition-colors hover:text-text"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-gradient-to-r from-primary to-accent transition-all duration-300 group-hover:w-full" />
              </a>
            </li>
          ))}
        </ul>
        <button
          onClick={toggleTheme}
          aria-label="Toggle color theme"
          className="grid h-9 w-9 place-items-center rounded-full border border-border bg-surface-raised text-sm transition-transform hover:rotate-[8deg]"
        >
          {theme === "dark" ? "🌙" : "☀️"}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
