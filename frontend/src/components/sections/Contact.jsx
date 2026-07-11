import { useEffect, useRef, useState } from "react";
import { revealSection } from "../../animations/revealTimeline";
import { sendMessage } from "../../lib/api";
import Button from "../ui/Button";
import SectionHeading from "../ui/SectionHeading";

const Contact = () => {
  const rootRef = useRef(null);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error

  useEffect(() => revealSection(rootRef.current), []);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    try {
      await sendMessage(form);
      setStatus("sent");
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      setStatus("error");
    }
  };

  return (
    <section
      id="contact"
      ref={rootRef}
      className="bg-surface py-[var(--space-section)]"
    >
      <div className="container">
        <SectionHeading
          eyebrow="06 — Contact"
          title="Let's build something measurable."
          subtitle="Open to select frontend-leaning full-stack roles. Typical response time is 24-48 hours."
        />
        <form onSubmit={handleSubmit} className="reveal w-full space-y-5">
          <div>
            <label
              htmlFor="name"
              className="mb-1.5 block text-sm text-text-secondary"
            >
              Name
            </label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Your name"
              className="w-full rounded-lg border border-border bg-surface-raised px-4 py-3 text-sm outline-none focus:border-primary focus:shadow-glow"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm text-text-secondary"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
              className="w-full rounded-lg border border-border bg-surface-raised px-4 py-3 text-sm outline-none focus:border-primary focus:shadow-glow"
            />
          </div>
          <div>
            <label
              htmlFor="message"
              className="mb-1.5 block text-sm text-text-secondary"
            >
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={5}
              value={form.message}
              onChange={handleChange}
              required
              placeholder="What are you building?"
              className="w-full rounded-lg border border-border bg-surface-raised px-4 py-3 text-sm outline-none focus:border-primary focus:shadow-glow"
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            disabled={status === "sending"}
          >
            {status === "sending" ? "Sending..." : "Send message"}
          </Button>
          {status === "sent" && (
            <p className="text-sm text-success">
              Thanks — typical response time is 24-48 hours.
            </p>
          )}
          {status === "error" && (
            <p className="text-sm text-error">
              Something went wrong. Please try again.
            </p>
          )}
        </form>
      </div>
    </section>
  );
};

export default Contact;
