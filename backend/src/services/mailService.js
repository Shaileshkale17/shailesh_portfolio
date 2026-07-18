// import nodemailer from "nodemailer";
// import logger from "../utils/logger.js";
// import { escapeHtml } from "../utils/text.js";

// let transporter = null;

// /**
//  * Lazily builds (and caches) the nodemailer transporter from SMTP env vars.
//  * Returns null if SMTP isn't configured, so callers can skip sending
//  * gracefully — email is a nice-to-have side effect of a contact-form
//  * submission, never something that should block or fail the request.
//  */
// const getTransporter = () => {
//   if (transporter) return transporter;

//   const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
//   if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;

//   transporter = nodemailer.createTransport({
//     host: SMTP_HOST,
//     port: Number(SMTP_PORT) || 587,
//     secure: Number(SMTP_PORT) === 465,
//     auth: { user: SMTP_USER, pass: SMTP_PASS },
//   });
//   return transporter;
// };

// /**
//  * Sends an email. Never throws — logs and returns false on any failure
//  * (missing config, SMTP error, etc.) so callers never fail a request just
//  * because email delivery failed.
//  * @param {{ to: string, subject: string, html: string, text: string }} input
//  * @returns {Promise<boolean>} Whether the email was actually sent.
//  */
// const sendMail = async ({ to, subject, html, text }) => {
//   const client = getTransporter();
//   if (!client) {
//     logger.warn("SMTP not configured — skipping email send", { to, subject });
//     return false;
//   }

//   try {
//     await client.sendMail({
//       from: process.env.SMTP_FROM || process.env.SMTP_USER,
//       to,
//       subject,
//       html,
//       text,
//     });
//     return true;
//   } catch (err) {
//     logger.error(`Failed to send email to ${to}`, err);
//     return false;
//   }
// };

// /**
//  * Notifies the site owner (`ADMIN_EMAIL`) of a new contact-form submission.
//  * @param {{ name: string, email: string, message: string }} input
//  */
// const sendAdminNewMessageAlert = async ({ name, email, message }) => {
//   const adminEmail = process.env.ADMIN_EMAIL;
//   if (!adminEmail) {
//     logger.warn(
//       "ADMIN_EMAIL not configured — skipping new-message alert email",
//     );
//     return false;
//   }

//   const safeName = escapeHtml(name);
//   const safeMessage = escapeHtml(message);

//   return sendMail({
//     to: adminEmail,
//     subject: `New portfolio contact from ${name}`,
//     html: `<p><strong>${safeName}</strong> (${escapeHtml(email)}) sent:</p><p>${safeMessage}</p>`,
//     text: `${name} (${email}) sent:\n${message}`,
//   });
// };

// /**
//  * Sends an auto-reply confirming receipt to whoever submitted the contact form.
//  * @param {{ name: string, email: string }} input
//  */
// const sendAutoReply = async ({ name, email }) => {
//   const safeName = escapeHtml(name);
//   return sendMail({
//     to: email,
//     subject: "Thanks for reaching out!",
//     html: `<p>Hi ${safeName},</p><p>Thanks for your message — I typically respond within 24-48 hours.</p>`,
//     text: `Hi ${name}, thanks for your message — I typically respond within 24-48 hours.`,
//   });
// };

// export default { sendMail, sendAdminNewMessageAlert, sendAutoReply };

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
    await client.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
      text,
    });
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
    logger.warn(
      "ADMIN_EMAIL not configured — skipping new-message alert email",
    );
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
 * Premium HTML auto-reply template. Placeholders ({{name}}, {{github_url}},
 * {{linkedin_url}}, {{portfolio_url}}) are filled in by buildAutoReplyHtml
 * before sending. Kept as a single exported constant so it's easy to tweak
 * copy/branding in one place without touching the send logic.
 */
const AUTO_REPLY_TEMPLATE = `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>Message Received</title>
<!--[if mso]>
<noscript>
<xml>
<o:OfficeDocumentSettings>
<o:PixelsPerInch>96</o:PixelsPerInch>
</o:OfficeDocumentSettings>
</xml>
</noscript>
<![endif]-->
</head>
<body style="margin:0; padding:0; background-color:#eef2f8; font-family:'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#eef2f8; margin:0; padding:0;">
<tr>
<td align="center" style="padding:40px 16px;">

<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px; max-width:600px; background-color:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 10px 40px rgba(37,99,235,0.12), 0 2px 8px rgba(0,0,0,0.04);">

<!-- HEADER -->
<tr>
<td align="center" style="background:linear-gradient(135deg, #2563EB 0%, #3B82F6 100%); background-color:#2563EB; padding:48px 32px 40px 32px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0">
<tr>
<td align="center" style="padding-bottom:20px;">
<table role="presentation" width="72" height="72" cellpadding="0" cellspacing="0" border="0" style="background-color:rgba(255,255,255,0.18); border-radius:50%; width:72px; height:72px;">
<tr>
<td align="center" valign="middle" style="width:72px; height:72px; border-radius:50%;">
<span style="font-size:32px; line-height:1;">💬</span>
</td>
</tr>
</table>
</td>
</tr>
</table>
<h1 style="margin:0; padding:0; font-size:26px; line-height:32px; font-weight:700; color:#ffffff; font-family:'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">Message Received!</h1>
<p style="margin:10px 0 0 0; padding:0; font-size:15px; line-height:22px; color:#dbe8ff; font-family:'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">Thank you for contacting me.</p>
</td>
</tr>

<!-- GREETING -->
<tr>
<td style="padding:36px 40px 8px 40px;">
<p style="margin:0 0 16px 0; font-size:16px; line-height:26px; color:#1f2937; font-family:'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">Hi <strong style="color:#2563EB;">{{name}}</strong>,</p>
<p style="margin:0; font-size:15px; line-height:26px; color:#4b5563; font-family:'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">Thank you for taking the time to reach out. I've successfully received your message and truly appreciate your interest.</p>
</td>
</tr>

<!-- INFO CARD -->
<tr>
<td style="padding:24px 40px 8px 40px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f8faff; border:1px solid #e6edff; border-radius:16px;">

<tr>
<td style="padding:22px 24px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr>
<td valign="top" width="44" style="padding-right:14px;">
<table role="presentation" width="40" height="40" cellpadding="0" cellspacing="0" border="0" style="background-color:#e8f0ff; border-radius:12px; width:40px; height:40px;">
<tr><td align="center" valign="middle" style="font-size:18px;">📩</td></tr>
</table>
</td>
<td valign="middle" align="left" style="font-family:'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
<p style="margin:0 0 3px 0; font-size:14.5px; font-weight:700; color:#1f2937;">Message Received</p>
<p style="margin:0; font-size:13.5px; line-height:20px; color:#6b7280;">Your contact request has been successfully submitted.</p>
</td>
</tr>
</table>
</td>
</tr>

<tr>
<td style="padding:0 24px;">
<hr style="border:none; border-top:1px solid #e6edff; margin:0;">
</td>
</tr>

<tr>
<td style="padding:22px 24px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr>
<td valign="top" width="44" style="padding-right:14px;">
<table role="presentation" width="40" height="40" cellpadding="0" cellspacing="0" border="0" style="background-color:#e8f0ff; border-radius:12px; width:40px; height:40px;">
<tr><td align="center" valign="middle" style="font-size:18px;">⏰</td></tr>
</table>
</td>
<td valign="middle" align="left" style="font-family:'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
<p style="margin:0 0 3px 0; font-size:14.5px; font-weight:700; color:#1f2937;">Response Time</p>
<p style="margin:0; font-size:13.5px; line-height:20px; color:#6b7280;">Usually within 24–48 hours.</p>
</td>
</tr>
</table>
</td>
</tr>

<tr>
<td style="padding:0 24px;">
<hr style="border:none; border-top:1px solid #e6edff; margin:0;">
</td>
</tr>

<tr>
<td style="padding:22px 24px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr>
<td valign="top" width="44" style="padding-right:14px;">
<table role="presentation" width="40" height="40" cellpadding="0" cellspacing="0" border="0" style="background-color:#e8f0ff; border-radius:12px; width:40px; height:40px;">
<tr><td align="center" valign="middle" style="font-size:18px;">💻</td></tr>
</table>
</td>
<td valign="middle" align="left" style="font-family:'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
<p style="margin:0 0 3px 0; font-size:14.5px; font-weight:700; color:#1f2937;">Portfolio</p>
<p style="margin:0; font-size:13.5px; line-height:20px; color:#6b7280;">I'm currently building modern web applications using React, Node.js, Express, MongoDB, and AI technologies.</p>
</td>
</tr>
</table>
</td>
</tr>

</table>
</td>
</tr>

<!-- NEXT STEPS -->
<tr>
<td style="padding:32px 40px 8px 40px;">
<h2 style="margin:0 0 18px 0; font-size:18px; font-weight:700; color:#1f2937; font-family:'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">What happens next?</h2>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr>
<td style="padding:0 0 14px 0;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0">
<tr>
<td valign="top" width="26">
<table role="presentation" width="20" height="20" cellpadding="0" cellspacing="0" border="0" style="background-color:#2563EB; border-radius:50%; width:20px; height:20px;">
<tr><td align="center" valign="middle" style="font-size:11px; color:#ffffff; font-weight:bold;">✔</td></tr>
</table>
</td>
<td valign="middle" style="font-size:14.5px; line-height:21px; color:#374151; font-family:'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding-left:10px;">I'll carefully review your message.</td>
</tr>
</table>
</td>
</tr>
<tr>
<td style="padding:0 0 14px 0;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0">
<tr>
<td valign="top" width="26">
<table role="presentation" width="20" height="20" cellpadding="0" cellspacing="0" border="0" style="background-color:#2563EB; border-radius:50%; width:20px; height:20px;">
<tr><td align="center" valign="middle" style="font-size:11px; color:#ffffff; font-weight:bold;">✔</td></tr>
</table>
</td>
<td valign="middle" style="font-size:14.5px; line-height:21px; color:#374151; font-family:'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding-left:10px;">I'll get back to you as soon as possible.</td>
</tr>
</table>
</td>
</tr>
<tr>
<td style="padding:0;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0">
<tr>
<td valign="top" width="26">
<table role="presentation" width="20" height="20" cellpadding="0" cellspacing="0" border="0" style="background-color:#2563EB; border-radius:50%; width:20px; height:20px;">
<tr><td align="center" valign="middle" style="font-size:11px; color:#ffffff; font-weight:bold;">✔</td></tr>
</table>
</td>
<td valign="middle" style="font-size:14.5px; line-height:21px; color:#374151; font-family:'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding-left:10px;">If necessary, I'll schedule a follow-up discussion.</td>
</tr>
</table>
</td>
</tr>
</table>
</td>
</tr>

<!-- QUOTE -->
<tr>
<td style="padding:32px 40px 8px 40px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:linear-gradient(135deg, #2563EB 0%, #3B82F6 100%); background-color:#2563EB; border-radius:16px;">
<tr>
<td style="padding:26px 28px;">
<p style="margin:0; font-size:15px; line-height:24px; font-style:italic; color:#ffffff; font-family:'Segoe UI', Roboto, Helvetica, Arial, sans-serif; text-align:center;">"Every great collaboration begins with a simple conversation."</p>
</td>
</tr>
</table>
</td>
</tr>

<!-- PRIMARY BUTTON -->
<tr>
<td align="center" style="padding:36px 40px 8px 40px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0">
<tr>
<td align="center" style="border-radius:12px; background:linear-gradient(135deg, #2563EB 0%, #3B82F6 100%); background-color:#2563EB; box-shadow:0 8px 20px rgba(37,99,235,0.35);">
<a href="{{portfolio_url}}" target="_blank" style="display:inline-block; padding:15px 40px; font-size:15px; font-weight:700; color:#ffffff; text-decoration:none; font-family:'Segoe UI', Roboto, Helvetica, Arial, sans-serif; border-radius:12px;">View Portfolio</a>
</td>
</tr>
</table>
</td>
</tr>

<!-- SOCIAL BUTTONS -->
<tr>
<td align="center" style="padding:26px 40px 8px 40px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0">
<tr>
<td style="padding:0 6px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-radius:24px; border:1px solid #e5e9f2; background-color:#ffffff;">
<tr>
<td style="padding:10px 20px;">
<a href="{{github_url}}" target="_blank" style="text-decoration:none;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0">
<tr>
<td valign="middle" style="padding-right:7px; line-height:0;"><img src="https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/github.svg" width="15" height="15" alt="GitHub" style="display:block; filter:invert(20%);"></td>
<td valign="middle" style="font-size:13.5px; font-weight:600; color:#374151; font-family:'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">GitHub</td>
</tr>
</table>
</a>
</td>
</tr>
</table>
</td>
<td style="padding:0 6px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-radius:24px; border:1px solid #e5e9f2; background-color:#ffffff;">
<tr>
<td style="padding:10px 20px;">
<a href="{{linkedin_url}}" target="_blank" style="text-decoration:none;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0">
<tr>
<td valign="middle" style="padding-right:7px; line-height:0;"><img src="https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/linkedin.svg" width="15" height="15" alt="LinkedIn" style="display:block; filter:invert(29%) sepia(94%) saturate(1665%) hue-rotate(190deg) brightness(93%) contrast(101%);"></td>
<td valign="middle" style="font-size:13.5px; font-weight:600; color:#374151; font-family:'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">LinkedIn</td>
</tr>
</table>
</a>
</td>
</tr>
</table>
</td>
<td style="padding:0 6px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-radius:24px; border:1px solid #e5e9f2; background-color:#ffffff;">
<tr>
<td style="padding:10px 20px;">
<a href="{{portfolio_url}}" target="_blank" style="text-decoration:none;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0">
<tr>
<td valign="middle" style="padding-right:7px; line-height:0;">
<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
<circle cx="12" cy="12" r="10"/>
<line x1="2" y1="12" x2="22" y2="12"/>
<path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
</svg>
</td>
<td valign="middle" style="font-size:13.5px; font-weight:600; color:#374151; font-family:'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">Portfolio</td>
</tr>
</table>
</a>
</td>
</tr>
</table>
</td>
</tr>
</table>
</td>
</tr>

<!-- FOOTER -->
<tr>
<td style="padding:36px 40px 0 40px;">
<hr style="border:none; border-top:1px solid #e5e9f2; margin:0;">
</td>
</tr>
<tr>
<td align="center" style="padding:24px 40px 8px 40px;">
<p style="margin:0 0 4px 0; font-size:14px; line-height:22px; color:#4b5563; font-family:'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">Thanks again for reaching out.</p>
<p style="margin:0 0 18px 0; font-size:14px; line-height:22px; color:#4b5563; font-family:'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">Looking forward to connecting with you!</p>
<p style="margin:0; font-size:14.5px; font-weight:700; color:#1f2937; font-family:'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">Best regards,</p>
<p style="margin:2px 0 0 0; font-size:15px; font-weight:700; color:#2563EB; font-family:'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">Shailesh Kale</p>
<p style="margin:2px 0 0 0; font-size:13px; color:#6b7280; font-family:'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">Full Stack MERN Developer</p>
</td>
</tr>

<!-- BOTTOM FOOTER -->
<tr>
<td align="center" style="background-color:#f8faff; padding:20px 40px;">
<p style="margin:0; font-size:12px; line-height:18px; color:#9ca3af; font-family:'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">This is an automated confirmation email.<br>Please do not reply to this email.</p>
</td>
</tr>

</table>

</td>
</tr>
</table>
</body>
</html>`;

/**
 * Fills the AUTO_REPLY_TEMPLATE placeholders with escaped, request-specific
 * values plus the site owner's social/portfolio links (from env vars, with
 * sensible fallbacks so the template never ships with a dangling href).
 * @param {{ name: string }} input
 */
const buildAutoReplyHtml = ({ name }) => {
  const safeName = escapeHtml(name);
  const githubUrl = process.env.GITHUB_URL || "https://github.com/";
  const linkedinUrl = process.env.LINKEDIN_URL || "https://linkedin.com/";
  const portfolioUrl = process.env.PORTFOLIO_URL || "https://shailesh.dev";

  return AUTO_REPLY_TEMPLATE.replaceAll("{{name}}", safeName)
    .replaceAll("{{github_url}}", githubUrl)
    .replaceAll("{{linkedin_url}}", linkedinUrl)
    .replaceAll("{{portfolio_url}}", portfolioUrl);
};

/**
 * Sends an auto-reply confirming receipt to whoever submitted the contact form.
 * @param {{ name: string, email: string }} input
 */
const sendAutoReply = async ({ name, email }) => {
  return sendMail({
    to: email,
    subject: "Message Received — Thanks for reaching out!",
    html: buildAutoReplyHtml({ name }),
    text: `Hi ${name},\n\nThank you for taking the time to reach out. I've successfully received your message and truly appreciate your interest.\n\nWhat happens next:\n- I'll carefully review your message.\n- I'll get back to you as soon as possible (usually within 24-48 hours).\n- If necessary, I'll schedule a follow-up discussion.\n\nBest regards,\nShailesh Kale\nFull Stack MERN Developer\n\nThis is an automated confirmation email. Please do not reply to this email.`,
  });
};

export default { sendMail, sendAdminNewMessageAlert, sendAutoReply };
