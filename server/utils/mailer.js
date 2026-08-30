// ============================================================
//  VirtuLab Kenya — Mailer Utility (Nodemailer)
// ============================================================

let nodemailer = null;
try {
  nodemailer = require('nodemailer');
} catch (e) {
  // nodemailer will be loaded when installed
}
const config = require('../config');

let transporter = null;

/**
 * Creates and returns the Nodemailer transporter instance.
 * Returns null if SMTP host/user are not configured or nodemailer is not installed.
 */
function getTransporter() {
  if (transporter) return transporter;

  if (!nodemailer) {
    try {
      nodemailer = require('nodemailer');
    } catch (e) {
      return null;
    }
  }

  const { smtpHost, smtpPort, smtpSecure, smtpUser, smtpPass } = config.email || {};

  if (!smtpHost || !smtpUser) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: {
      user: smtpUser,
      pass: smtpPass
    }
  });

  return transporter;
}

/**
 * Helper to wrap email body in a clean, responsive VirtuLab Kenya branded layout.
 */
function wrapEmailTemplate({ title, preheader, contentHtml }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; color: #1e293b; }
    .email-container { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
    .email-header { background: linear-gradient(135deg, #0d2847 0%, #174276 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
    .email-header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px; }
    .email-header p { margin: 6px 0 0 0; font-size: 13px; color: #94a3b8; letter-spacing: 1px; text-transform: uppercase; }
    .email-body { padding: 32px 28px; font-size: 15px; line-height: 1.6; }
    .cred-box { background: #f8fafc; border-left: 4px solid #2563eb; border-radius: 6px; padding: 18px; margin: 24px 0; }
    .cred-item { margin: 8px 0; font-family: monospace; font-size: 14px; }
    .cred-label { color: #64748b; font-size: 12px; text-transform: uppercase; font-weight: 600; display: block; }
    .btn-login { display: inline-block; background-color: #2563eb; color: #ffffff !important; text-decoration: none; font-weight: 600; font-size: 15px; padding: 12px 28px; border-radius: 8px; margin-top: 16px; }
    .email-footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 24px; text-align: center; font-size: 12px; color: #64748b; }
    .alert-box { background: #fffbeb; border: 1px solid #fef3c7; color: #92400e; padding: 12px 16px; border-radius: 6px; font-size: 13px; margin: 20px 0; }
  </style>
</head>
<body>
  <div style="display:none; font-size:1px; color:#f1f5f9; line-height:1px; max-height:0px; max-width:0px; opacity:0; overflow:hidden;">
    ${preheader || title}
  </div>
  <div class="email-container">
    <div class="email-header">
      <h1>VirtuLab Kenya 🧪</h1>
      <p>National Chemistry Practical Platform</p>
    </div>
    <div class="email-body">
      ${contentHtml}
    </div>
    <div class="email-footer">
      <p style="margin:0 0 6px 0;">VirtuLab Kenya • Republic of Kenya</p>
      <p style="margin:0;">This is an automated administrative notification. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Send welcome email to newly created system administrator.
 */
async function sendAdminWelcomeEmail({ to, name, temporaryPassword, role, loginUrl }) {
  const portalUrl = loginUrl || `${config.email.platformUrl}/admin/dashboard.html`;
  const roleDisplay = role === 'superadmin' ? 'Super Administrator' : 'Administrator';

  const html = wrapEmailTemplate({
    title: 'VirtuLab Kenya — Administrator Account Access',
    preheader: `Your VirtuLab Kenya administrator account has been created.`,
    contentHtml: `
      <h2 style="margin-top:0; color:#0f172a; font-size:20px;">Welcome to VirtuLab Kenya, ${name}</h2>
      <p>An administrator account has been created for you with <strong>${roleDisplay}</strong> privileges on the VirtuLab Kenya educational chemistry platform.</p>
      
      <div class="cred-box">
        <div class="cred-item">
          <span class="cred-label">Login Email:</span>
          <strong>${to}</strong>
        </div>
        <div class="cred-item">
          <span class="cred-label">Temporary Password:</span>
          <strong style="color:#2563eb; font-size:16px;">${temporaryPassword}</strong>
        </div>
        <div class="cred-item">
          <span class="cred-label">Access Level:</span>
          <span>${roleDisplay}</span>
        </div>
      </div>

      <div class="alert-box">
        ⚠️ <strong>Security Advisory:</strong> Please log in and update your password immediately from your account profile.
      </div>

      <div style="text-align:center; margin: 28px 0 16px;">
        <a href="${portalUrl}" class="btn-login">Access Admin Portal</a>
      </div>

      <p style="font-size:13px; color:#64748b; margin-top:24px;">
        Or copy and paste this link into your web browser:<br>
        <a href="${portalUrl}" style="color:#2563eb; word-break:break-all;">${portalUrl}</a>
      </p>
    `
  });

  const text = `VirtuLab Kenya — Administrator Account Access\n\n`
    + `Hello ${name},\n\n`
    + `Your VirtuLab Kenya administrator account has been created (${roleDisplay}).\n\n`
    + `Login Email: ${to}\n`
    + `Temporary Password: ${temporaryPassword}\n`
    + `Admin Portal: ${portalUrl}\n\n`
    + `Please log in and update your password immediately.`;

  return deliverEmail({
    to,
    subject: 'VirtuLab Kenya — Administrator Account Access',
    html,
    text
  });
}

/**
 * Send password reset email to administrator.
 */
async function sendAdminPasswordResetEmail({ to, name, temporaryPassword, loginUrl }) {
  const portalUrl = loginUrl || `${config.email.platformUrl}/admin/dashboard.html`;

  const html = wrapEmailTemplate({
    title: 'VirtuLab Kenya — Password Reset',
    preheader: `Your administrator temporary password has been reset.`,
    contentHtml: `
      <h2 style="margin-top:0; color:#0f172a; font-size:20px;">Administrator Password Reset</h2>
      <p>Hello ${name},</p>
      <p>Your password for the VirtuLab Kenya Administration Portal has been reset by an authorized Super Administrator.</p>
      
      <div class="cred-box">
        <div class="cred-item">
          <span class="cred-label">Admin Email:</span>
          <strong>${to}</strong>
        </div>
        <div class="cred-item">
          <span class="cred-label">New Temporary Password:</span>
          <strong style="color:#2563eb; font-size:16px;">${temporaryPassword}</strong>
        </div>
      </div>

      <div class="alert-box">
        🔒 For security reasons, please change this password immediately after signing in.
      </div>

      <div style="text-align:center; margin: 28px 0 16px;">
        <a href="${portalUrl}" class="btn-login">Log In to Admin Portal</a>
      </div>
    `
  });

  const text = `VirtuLab Kenya — Administrator Password Reset\n\n`
    + `Hello ${name},\n\n`
    + `Your password has been reset.\n`
    + `Admin Email: ${to}\n`
    + `New Temporary Password: ${temporaryPassword}\n`
    + `Login URL: ${portalUrl}\n\n`
    + `Please log in and update your password immediately.`;

  return deliverEmail({
    to,
    subject: 'VirtuLab Kenya — Administrator Password Reset',
    html,
    text
  });
}

/**
 * Core dispatch function.
 * If SMTP is unconfigured, logs details and safely returns emailSent: false.
 */
async function deliverEmail({ to, subject, html, text }) {
  const client = getTransporter();

  if (!client) {
    console.warn(`[VirtuLab Mailer] SMTP is not configured. Email to "${to}" was skipped.`);
    return {
      success: true,
      emailSent: false,
      reason: 'SMTP not configured'
    };
  }

  try {
    const info = await client.sendMail({
      from: config.email.from,
      to,
      subject,
      text,
      html
    });

    console.log(`[VirtuLab Mailer] Email successfully sent to ${to} (Message ID: ${info.messageId})`);
    return {
      success: true,
      emailSent: true,
      messageId: info.messageId
    };
  } catch (error) {
    console.error(`[VirtuLab Mailer] Failed to send email to ${to}:`, error.message);
    return {
      success: false,
      emailSent: false,
      error: error.message
    };
  }
}

module.exports = {
  getTransporter,
  sendAdminWelcomeEmail,
  sendAdminPasswordResetEmail,
  deliverEmail
};
