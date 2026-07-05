import ResourceManager from "../components/ResourceManager";

const fields = [
  { name: "title", label: "Title" },
  { name: "description", label: "Description", type: "textarea" },
  { name: "date", label: "Date", type: "date" },
  { name: "order", label: "Sort order", type: "number" },
];

const columns = [
  { key: "title", label: "Title" },
  { key: "date", label: "Date", render: (i) => (i.date ? new Date(i.date).toLocaleDateString() : "—") },
];

const Achievements = () => (
  <ResourceManager title="Achievements" endpoint="/achievements" fields={fields} columns={columns} />
);

export default Achievements;
