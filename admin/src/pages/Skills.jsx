import ResourceManager from "../components/ResourceManager";

const fields = [
  { name: "name", label: "Skill name" },
  {
    name: "category",
    label: "Category",
    type: "select",
    options: ["Languages", "Frontend", "Backend", "Database & Tools"],
  },
  { name: "proficiency", label: "Proficiency (0-100)", type: "number" },
  { name: "order", label: "Sort order", type: "number" },
];

const columns = [
  { key: "name", label: "Name" },
  { key: "category", label: "Category" },
  { key: "proficiency", label: "Proficiency" },
];

const Skills = () => <ResourceManager title="Skills" endpoint="/skills" fields={fields} columns={columns} />;

export default Skills;
