import ResourceManager from "../components/ResourceManager";

const fields = [
  { name: "title", label: "Title" },
  { name: "issuer", label: "Issuer" },
  { name: "issueDate", label: "Issue date", type: "date" },
  { name: "credentialUrl", label: "Credential URL" },
  { name: "order", label: "Sort order", type: "number" },
];

const columns = [
  { key: "title", label: "Title" },
  { key: "issuer", label: "Issuer" },
  { key: "issueDate", label: "Issued", render: (i) => (i.issueDate ? new Date(i.issueDate).toLocaleDateString() : "—") },
];

const Certifications = () => (
  <ResourceManager title="Certifications" endpoint="/certifications" fields={fields} columns={columns} />
);

export default Certifications;
