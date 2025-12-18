import nodemailer from 'nodemailer';

type SendEmailOptions = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export function getMailer() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === 'true';

  if (!host || !user || !pass) {
    throw new Error('SMTP credentials are not configured');
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    tls: {
      // Allow opting into ignoring invalid certs for dev; do not enable in production.
      rejectUnauthorized: process.env.SMTP_TLS_REJECT_UNAUTHORIZED !== 'false',
    },
  });
}

export async function sendEmail(options: SendEmailOptions) {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const transporter = getMailer();
  await transporter.sendMail({ from, ...options });
}
