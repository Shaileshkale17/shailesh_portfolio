import ResourceManager from "../components/ResourceManager";

const fields = [
  { name: "role", label: "Role" },
  { name: "company", label: "Company" },
  { name: "meta", label: "Meta label (e.g. Current)" },
  { name: "description", label: "Description", type: "textarea" },
  { name: "startDate", label: "Start date", type: "date" },
  { name: "endDate", label: "End date", type: "date" },
  { name: "current", label: "Current role", type: "checkbox" },
  { name: "order", label: "Sort order", type: "number" },
];

const columns = [
  { key: "role", label: "Role" },
  { key: "company", label: "Company" },
  { key: "meta", label: "Meta" },
];

const Experience = () => <ResourceManager title="Experience" endpoint="/experience" fields={fields} columns={columns} />;

export default Experience;
