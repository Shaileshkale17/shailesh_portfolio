import ResourceManager from "../components/ResourceManager";

const fields = [
  { name: "author", label: "Author" },
  { name: "role", label: "Role" },
  { name: "company", label: "Company" },
  { name: "quote", label: "Quote", type: "textarea" },
  { name: "avatarUrl", label: "Avatar URL" },
  { name: "published", label: "Published", type: "checkbox" },
  { name: "order", label: "Sort order", type: "number" },
];

const columns = [
  { key: "author", label: "Author" },
  { key: "company", label: "Company" },
  { key: "published", label: "Published", render: (i) => (i.published ? "Yes" : "No") },
];

const Testimonials = () => (
  <ResourceManager title="Testimonials" endpoint="/testimonials" fields={fields} columns={columns} />
);

export default Testimonials;
