import nodemailer from "nodemailer";
import logger from "../utils/logger.js";
import { escapeHtml } from "../utils/text.js";

let transporter = null;

/**
 * Lazily builds (and caches) the nodemailer transporter from SMTP env vars.
 * Returns null if SMTP isn't configured, so callers can skip sending
 * gracefully — email is a nice-to-have side effect of a contact-form
 * submission, never something that should block or fail the request.
 */
const getTransporter = () => {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return transporter;
};

/**
 * Sends an email. Never throws — logs and returns false on any failure
 * (missing config, SMTP error, etc.) so callers never fail a request just
 * because email delivery failed.
 * @param {{ to: string, subject: string, html: string, text: string }} input
 * @returns {Promise<boolean>} Whether the email was actually sent.
 */
const sendMail = async ({ to, subject, html, text }) => {
  const client = getTransporter();
  if (!client) {
    logger.warn("SMTP not configured — skipping email send", { to, subject });
    return false;
  }

  try {
    await client.sendMail({ from: process.env.SMTP_FROM || process.env.SMTP_USER, to, subject, html, text });
    return true;
  } catch (err) {
    logger.error(`Failed to send email to ${to}`, err);
    return false;
  }
};

/**
 * Notifies the site owner (`ADMIN_EMAIL`) of a new contact-form submission.
 * @param {{ name: string, email: string, message: string }} input
 */
const sendAdminNewMessageAlert = async ({ name, email, message }) => {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    logger.warn("ADMIN_EMAIL not configured — skipping new-message alert email");
    return false;
  }

  const safeName = escapeHtml(name);
  const safeMessage = escapeHtml(message);

  return sendMail({
    to: adminEmail,
    subject: `New portfolio contact from ${name}`,
    html: `<p><strong>${safeName}</strong> (${escapeHtml(email)}) sent:</p><p>${safeMessage}</p>`,
    text: `${name} (${email}) sent:\n${message}`,
  });
};

/**
 * Sends an auto-reply confirming receipt to whoever submitted the contact form.
 * @param {{ name: string, email: string }} input
 */
const sendAutoReply = async ({ name, email }) => {
  const safeName = escapeHtml(name);
  return sendMail({
    to: email,
    subject: "Thanks for reaching out!",
    html: `<p>Hi ${safeName},</p><p>Thanks for your message — I typically respond within 24-48 hours.</p>`,
    text: `Hi ${name}, thanks for your message — I typically respond within 24-48 hours.`,
  });
};

export default { sendMail, sendAdminNewMessageAlert, sendAutoReply };
