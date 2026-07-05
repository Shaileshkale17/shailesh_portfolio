const Footer = () => (
  <footer className="border-t border-border py-16">
    <div className="container grid gap-10 md:grid-cols-3">
      <div>
        <a href="#" className="font-heading text-lg font-bold">
          shailesh<span className="text-primary">.dev</span>
        </a>
        <p className="mt-3 font-mono text-xs uppercase tracking-wide text-text-secondary">
          Software Developer · MERN Stack
        </p>
      </div>
      <ul className="flex flex-wrap gap-6 md:justify-center">
        {["About", "Experience", "Projects", "Contact"].map((label) => (
          <li key={label}>
            <a href={`#${label.toLowerCase()}`} className="text-sm text-text-secondary hover:text-text">
              {label}
            </a>
          </li>
        ))}
      </ul>
      <div className="flex gap-4 md:justify-end">
        <a href="https://github.com" target="_blank" rel="noreferrer" className="text-sm text-text-secondary transition-colors hover:text-primary">
          GitHub
        </a>
        <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-sm text-text-secondary transition-colors hover:text-primary">
          LinkedIn
        </a>
      </div>
    </div>
    <p className="container mt-10 text-xs text-text-secondary">
      © {new Date().getFullYear()} Shailesh Kale. Built with React, Node.js, and GSAP.
    </p>
  </footer>
);

export default Footer;
