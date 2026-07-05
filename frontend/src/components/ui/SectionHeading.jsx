const SectionHeading = ({ eyebrow, title, subtitle }) => (
  <div className="section-head mb-12 reveal">
    <div className="eyebrow">{eyebrow}</div>
    <h2 className="font-heading text-[clamp(2rem,4vw+1rem,3rem)] font-bold leading-[1.1] tracking-tight">{title}</h2>
    {subtitle && <p className="mt-3 max-w-xl text-text-secondary">{subtitle}</p>}
  </div>
);

export default SectionHeading;
