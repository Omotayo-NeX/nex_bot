/**
 * Field Link Utilities
 * Utilities for generating and validating secure field worker links
 */

import { SignJWT, jwtVerify } from 'jose';
import { nanoid } from 'nanoid';

const JWT_SECRET = new TextEncoder().encode(
  process.env.FIELD_LINK_SECRET || process.env.AUTH_SECRET || 'default-secret-change-in-production'
);

export interface FieldLinkPayload {
  linkId: string;
  businessId: string;
  workerName: string;
  projectName?: string;
  expiresAt: number;
  allowedActions: string[];
}

/**
 * Generate a secure JWT token for field links
 */
export async function generateFieldLinkToken(payload: Omit<FieldLinkPayload, 'linkId'>): Promise<string> {
  const linkId = nanoid(32); // 32-character unique ID

  const token = await new SignJWT({ ...payload, linkId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(new Date(payload.expiresAt))
    .sign(JWT_SECRET);

  return token;
}

/**
 * Verify and decode a field link token
 */
export async function verifyFieldLinkToken(token: string): Promise<FieldLinkPayload | null> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload as unknown as FieldLinkPayload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Generate a shareable URL for a field link
 */
export function generateFieldLinkUrl(token: string, baseUrl?: string): string {
  const base = baseUrl || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return `${base}/expensa/submit/${token}`;
}

/**
 * Calculate expiry date based on duration in days
 */
export function calculateExpiryDate(daysFromNow: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date;
}

/**
 * Check if a field link is still valid
 */
export function isFieldLinkExpired(expiresAt: Date | string): boolean {
  const expiry = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt;
  return expiry < new Date();
}

/**
 * Format field link for sharing
 */
export interface ShareableFieldLink {
  url: string;
  token: string;
  workerName: string;
  projectName?: string;
  expiresAt: string;
  qrCode?: string; // Future: Generate QR code
}

export function formatFieldLinkForSharing(
  token: string,
  workerName: string,
  expiresAt: Date,
  projectName?: string
): ShareableFieldLink {
  return {
    url: generateFieldLinkUrl(token),
    token,
    workerName,
    projectName,
    expiresAt: expiresAt.toISOString(),
  };
}

/**
 * Generate WhatsApp share text
 */
export function generateWhatsAppMessage(link: ShareableFieldLink): string {
  const message = `
🔗 *Expense Submission Link*

Hi ${link.workerName},

Please use this secure link to submit your expenses${link.projectName ? ` for ${link.projectName}` : ''}:

${link.url}

⏰ This link expires on ${new Date(link.expiresAt).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}

📝 Instructions:
1. Click the link above
2. Upload your receipt photo
3. Fill in expense details
4. Submit

Your submission will be instantly reviewed.

---
Powered by NeX Expensa
  `.trim();

  return encodeURIComponent(message);
}

/**
 * Generate email share HTML
 */
export function generateEmailHTML(link: ShareableFieldLink, businessName?: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Expense Submission Link</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
    .content { background: #f7f7f7; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; background: #FFC700; color: #0d1117; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
    .button:hover { background: #e6b300; }
    .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
    .expiry { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px; margin: 15px 0; }
    ul { padding-left: 20px; }
    li { margin: 8px 0; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🧾 Expense Submission Link</h1>
    <p>Secure access for ${link.workerName}</p>
  </div>

  <div class="content">
    <p>Hi <strong>${link.workerName}</strong>,</p>

    <p>${businessName || 'Your organization'} has created a secure link for you to submit expenses${link.projectName ? ` for <strong>${link.projectName}</strong>` : ''}.</p>

    <div style="text-align: center;">
      <a href="${link.url}" class="button">Submit Expense Now</a>
    </div>

    <div class="expiry">
      <strong>⏰ Link Expiry:</strong><br>
      ${new Date(link.expiresAt).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      })}
    </div>

    <div class="info-box">
      <h3 style="margin-top: 0;">📝 How to Submit:</h3>
      <ul>
        <li>Click the button above to open the submission form</li>
        <li>Take or upload a clear photo of your receipt</li>
        <li>Fill in the expense details (amount, category, description)</li>
        <li>Submit and you're done!</li>
      </ul>
    </div>

    <p><strong>Note:</strong> Your submission will be instantly sent to the admin for review and approval.</p>

    <p>If you have any questions, please contact your administrator.</p>
  </div>

  <div class="footer">
    <p>Powered by <strong>NeX Expensa</strong></p>
    <p>Smart expense tracking for modern businesses</p>
  </div>
</body>
</html>
  `;
}
