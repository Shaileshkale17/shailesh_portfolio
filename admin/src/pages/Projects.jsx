import ResourceManager from "../components/ResourceManager";

const fields = [
  { name: "title", label: "Title" },
  { name: "slug", label: "Slug (URL-safe, unique)" },
  { name: "metric", label: "Headline metric (e.g. 30% faster load)" },
  { name: "summary", label: "Summary", type: "textarea" },
  { name: "problem", label: "Problem", type: "textarea" },
  { name: "architecture", label: "Architecture", type: "textarea" },
  { name: "decisions", label: "Key decisions", type: "textarea" },
  { name: "learnings", label: "Learnings", type: "textarea" },
  { name: "tags", label: "Tags", type: "tags" },
  { name: "category", label: "Category", type: "select", options: ["Frontend", "Full-stack", "Performance", "Other"] },
  { name: "thumbnailUrl", label: "Thumbnail URL" },
  { name: "liveUrl", label: "Live URL" },
  { name: "repoUrl", label: "Repo URL" },
  { name: "featured", label: "Featured", type: "checkbox" },
  { name: "order", label: "Sort order", type: "number" },
];

const columns = [
  { key: "title", label: "Title" },
  { key: "metric", label: "Metric" },
  { key: "category", label: "Category" },
  { key: "featured", label: "Featured", render: (i) => (i.featured ? "Yes" : "No") },
];

const Projects = () => <ResourceManager title="Projects" endpoint="/projects" fields={fields} columns={columns} />;

export default Projects;
