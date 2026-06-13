import * as nodemailer from 'nodemailer';
import { ConfigManager } from '../config/ConfigManager';

export interface MailMessage {
  subject: string;
  text?: string;
  html?: string;
  from: string;
  to: string;
}

/**
 * Connects to a fake SMTP server (smtp4dev / MailHog) to read/verify emails
 * sent during test flows (e.g. registration confirmations).
 */
export class MailClient {
  private transporter: nodemailer.Transporter;

  constructor() {
    const cfg = ConfigManager.getInstance().get().mail;
    this.transporter = nodemailer.createTransport({
      host: cfg.host,
      port: cfg.port,
      secure: cfg.secure,
    });
  }

  async send(opts: { to: string; from?: string; subject: string; text?: string; html?: string }): Promise<void> {
    await this.transporter.sendMail({
      from: opts.from || 'noreply@test.local',
      to: opts.to,
      subject: opts.subject,
      text: opts.text,
      html: opts.html,
    });
  }

  /** Poll MailHog HTTP API for a message to the given address */
  async waitForEmail(toAddress: string, subjectContains: string, timeoutMs = 15_000): Promise<MailMessage> {
    const cfg = ConfigManager.getInstance().get().mail;
    const apiBase = `http://${cfg.host}:8025/api/v2`;
    const deadline = Date.now() + timeoutMs;

    while (Date.now() < deadline) {
      const res = await fetch(`${apiBase}/search?kind=to&query=${encodeURIComponent(toAddress)}`);
      if (res.ok) {
        const data = (await res.json()) as {
          items: Array<{ Content: { Headers: Record<string, string[]>; Body: string } }>;
        };
        const match = data.items.find((m) => m.Content.Headers['Subject']?.[0]?.includes(subjectContains));
        if (match) {
          return {
            subject: match.Content.Headers['Subject']?.[0] || '',
            text: match.Content.Body,
            from: match.Content.Headers['From']?.[0] || '',
            to: toAddress,
          };
        }
      }
      await new Promise((r) => setTimeout(r, 1000));
    }
    throw new Error(`No email to ${toAddress} with subject containing "${subjectContains}" within ${timeoutMs}ms`);
  }
}
