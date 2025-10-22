/**
 * Professional email templates for NeX AI
 * Uses inline styles for maximum email client compatibility
 */

const BASE_STYLES = {
  container: 'max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;',
  header: 'background: linear-gradient(135deg, #0A0F24 0%, #1a2332 100%); padding: 40px 20px; text-align: center;',
  logo: 'font-size: 48px; font-weight: bold; background: linear-gradient(135deg, #FEE440 0%, #fff59d 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0;',
  content: 'background: #ffffff; padding: 40px 20px;',
  button: 'display: inline-block; background: #FEE440; color: #0A0F24; padding: 14px 32px; text-decoration: none; border-radius: 12px; font-weight: 600; margin: 20px 0;',
  footer: 'background: #f9fafb; padding: 30px 20px; text-align: center; color: #6b7280; font-size: 14px;',
};

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

/**
 * Welcome email for new users
 */
export function welcomeEmail(userName: string): EmailTemplate {
  return {
    subject: 'Welcome to NeX AI! 🎉',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to NeX AI</title>
</head>
<body style="margin: 0; padding: 20px; background-color: #f3f4f6;">
  <div style="${BASE_STYLES.container}">
    <!-- Header -->
    <div style="${BASE_STYLES.header}">
      <h1 style="${BASE_STYLES.logo}">NeX AI</h1>
      <p style="color: #FEE440; font-size: 18px; margin: 10px 0 0 0;">Marketing Automation for African Entrepreneurs</p>
    </div>

    <!-- Content -->
    <div style="${BASE_STYLES.content}">
      <h2 style="color: #0A0F24; font-size: 28px; margin-top: 0;">Welcome, ${userName}! 👋</h2>

      <p style="color: #374151; font-size: 16px; line-height: 1.6;">
        We're thrilled to have you join the NeX AI family! You now have access to powerful AI tools designed specifically for African entrepreneurs like you.
      </p>

      <h3 style="color: #0A0F24; font-size: 20px; margin-top: 30px;">Get Started:</h3>

      <div style="background: #f9fafb; border-left: 4px solid #FEE440; padding: 20px; margin: 20px 0; border-radius: 8px;">
        <p style="margin: 0 0 10px 0; color: #374151;"><strong>✨ AI Chat:</strong> Get instant marketing advice and business insights</p>
        <p style="margin: 0 0 10px 0; color: #374151;"><strong>🎨 Image Generation:</strong> Create stunning visuals for your brand</p>
        <p style="margin: 0 0 10px 0; color: #374151;"><strong>🎙️ Voice AI:</strong> Generate professional voiceovers</p>
        <p style="margin: 0; color: #374151;"><strong>📊 Analytics:</strong> Track your usage and costs</p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="https://ai.nexconsultingltd.com/chat" style="${BASE_STYLES.button}">
          Start Chatting
        </a>
      </div>

      <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-top: 30px;">
        Need help? Check out our <a href="https://ai.nexconsultingltd.com/docs" style="color: #FEE440; text-decoration: none;">documentation</a> or reply to this email.
      </p>
    </div>

    <!-- Footer -->
    <div style="${BASE_STYLES.footer}">
      <p style="margin: 0 0 10px 0;">
        <strong>NeX Consulting Limited</strong><br>
        Empowering African Entrepreneurs with AI
      </p>
      <p style="margin: 10px 0;">
        <a href="https://ai.nexconsultingltd.com" style="color: #0A0F24; text-decoration: none; margin: 0 10px;">Home</a>
        <a href="https://ai.nexconsultingltd.com/pricing" style="color: #0A0F24; text-decoration: none; margin: 0 10px;">Pricing</a>
        <a href="https://ai.nexconsultingltd.com/settings" style="color: #0A0F24; text-decoration: none; margin: 0 10px;">Settings</a>
      </p>
      <p style="margin: 10px 0; font-size: 12px;">
        You're receiving this email because you signed up for NeX AI.
      </p>
    </div>
  </div>
</body>
</html>
    `,
    text: `
Welcome to NeX AI, ${userName}!

We're thrilled to have you join the NeX AI family! You now have access to powerful AI tools designed specifically for African entrepreneurs like you.

GET STARTED:
✨ AI Chat: Get instant marketing advice and business insights
🎨 Image Generation: Create stunning visuals for your brand
🎙️ Voice AI: Generate professional voiceovers
📊 Analytics: Track your usage and costs

Visit https://ai.nexconsultingltd.com/chat to start chatting!

Need help? Check out our documentation at https://ai.nexconsultingltd.com/docs or reply to this email.

---
NeX Consulting Limited
Empowering African Entrepreneurs with AI
https://ai.nexconsultingltd.com
    `,
  };
}

/**
 * Password reset email
 */
export function passwordResetEmail(userName: string, resetLink: string): EmailTemplate {
  return {
    subject: 'Reset Your NeX AI Password',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 20px; background-color: #f3f4f6;">
  <div style="${BASE_STYLES.container}">
    <!-- Header -->
    <div style="${BASE_STYLES.header}">
      <h1 style="${BASE_STYLES.logo}">NeX AI</h1>
    </div>

    <!-- Content -->
    <div style="${BASE_STYLES.content}">
      <h2 style="color: #0A0F24; font-size: 28px; margin-top: 0;">Reset Your Password</h2>

      <p style="color: #374151; font-size: 16px; line-height: 1.6;">
        Hi ${userName},
      </p>

      <p style="color: #374151; font-size: 16px; line-height: 1.6;">
        We received a request to reset your password for your NeX AI account. Click the button below to choose a new password:
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" style="${BASE_STYLES.button}">
          Reset Password
        </a>
      </div>

      <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 8px;">
        <p style="margin: 0; color: #92400e; font-size: 14px;">
          <strong>⚠️ Security Notice:</strong> This link will expire in 1 hour. If you didn't request this reset, please ignore this email or contact support if you have concerns.
        </p>
      </div>

      <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
        If the button doesn't work, copy and paste this link into your browser:<br>
        <a href="${resetLink}" style="color: #0A0F24; word-break: break-all;">${resetLink}</a>
      </p>
    </div>

    <!-- Footer -->
    <div style="${BASE_STYLES.footer}">
      <p style="margin: 0 0 10px 0;">
        <strong>NeX Consulting Limited</strong>
      </p>
      <p style="margin: 10px 0; font-size: 12px;">
        If you have any questions, reply to this email or contact us at nexconsultingltd@gmail.com
      </p>
    </div>
  </div>
</body>
</html>
    `,
    text: `
Reset Your NeX AI Password

Hi ${userName},

We received a request to reset your password for your NeX AI account. Click the link below to choose a new password:

${resetLink}

⚠️ SECURITY NOTICE: This link will expire in 1 hour. If you didn't request this reset, please ignore this email or contact support if you have concerns.

---
NeX Consulting Limited
If you have any questions, reply to this email or contact us at nexconsultingltd@gmail.com
    `,
  };
}

/**
 * Subscription confirmation email
 */
export function subscriptionConfirmationEmail(
  userName: string,
  plan: string,
  amount: number,
  renewalDate: string
): EmailTemplate {
  const planEmoji = plan === 'pro' ? '⭐' : plan === 'enterprise' ? '💎' : '🎯';

  return {
    subject: `Welcome to NeX AI ${plan.charAt(0).toUpperCase() + plan.slice(1)}! ${planEmoji}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Subscription Confirmed</title>
</head>
<body style="margin: 0; padding: 20px; background-color: #f3f4f6;">
  <div style="${BASE_STYLES.container}">
    <!-- Header -->
    <div style="${BASE_STYLES.header}">
      <h1 style="${BASE_STYLES.logo}">NeX AI</h1>
      <div style="background: #FEE440; color: #0A0F24; display: inline-block; padding: 8px 20px; border-radius: 20px; margin-top: 15px; font-weight: 600;">
        ${planEmoji} ${plan.toUpperCase()} PLAN
      </div>
    </div>

    <!-- Content -->
    <div style="${BASE_STYLES.content}">
      <h2 style="color: #0A0F24; font-size: 28px; margin-top: 0;">Subscription Confirmed!</h2>

      <p style="color: #374151; font-size: 16px; line-height: 1.6;">
        Thank you, ${userName}! Your subscription to NeX AI ${plan} has been confirmed.
      </p>

      <div style="background: #f0fdf4; border: 2px solid #22c55e; padding: 20px; margin: 25px 0; border-radius: 12px; text-align: center;">
        <p style="margin: 0; color: #15803d; font-size: 18px; font-weight: 600;">
          ₦${amount.toLocaleString()}/month
        </p>
        <p style="margin: 10px 0 0 0; color: #16a34a; font-size: 14px;">
          Renews on ${new Date(renewalDate).toLocaleDateString()}
        </p>
      </div>

      <h3 style="color: #0A0F24; font-size: 20px; margin-top: 30px;">Your Benefits:</h3>

      ${
        plan === 'pro'
          ? `
      <div style="margin: 20px 0;">
        <p style="margin: 10px 0; color: #374151;"><strong>✨ Unlimited</strong> chat messages</p>
        <p style="margin: 10px 0; color: #374151;"><strong>🎨 50 HD images</strong> per month</p>
        <p style="margin: 10px 0; color: #374151;"><strong>🎙️ 300 voice minutes</strong> per month</p>
        <p style="margin: 10px 0; color: #374151;"><strong>🎯 Priority support</strong></p>
      </div>
      `
          : plan === 'enterprise'
          ? `
      <div style="margin: 20px 0;">
        <p style="margin: 10px 0; color: #374151;"><strong>✨ Unlimited</strong> everything</p>
        <p style="margin: 10px 0; color: #374151;"><strong>👥 Team collaboration</strong></p>
        <p style="margin: 10px 0; color: #374151;"><strong>📊 Advanced analytics</strong></p>
        <p style="margin: 10px 0; color: #374151;"><strong>🎯 Dedicated support</strong></p>
      </div>
      `
          : ''
      }

      <div style="text-align: center; margin: 30px 0;">
        <a href="https://ai.nexconsultingltd.com/analytics" style="${BASE_STYLES.button}">
          View Dashboard
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="${BASE_STYLES.footer}">
      <p style="margin: 0 0 10px 0;">
        <strong>NeX Consulting Limited</strong>
      </p>
      <p style="margin: 10px 0;">
        <a href="https://ai.nexconsultingltd.com/settings" style="color: #0A0F24; text-decoration: none;">Manage Subscription</a>
      </p>
    </div>
  </div>
</body>
</html>
    `,
    text: `
Subscription Confirmed!

Thank you, ${userName}! Your subscription to NeX AI ${plan.toUpperCase()} has been confirmed.

Amount: ₦${amount.toLocaleString()}/month
Renews on: ${new Date(renewalDate).toLocaleDateString()}

${
  plan === 'pro'
    ? `
YOUR BENEFITS:
✨ Unlimited chat messages
🎨 50 HD images per month
🎙️ 300 voice minutes per month
🎯 Priority support
`
    : plan === 'enterprise'
    ? `
YOUR BENEFITS:
✨ Unlimited everything
👥 Team collaboration
📊 Advanced analytics
🎯 Dedicated support
`
    : ''
}

View your dashboard: https://ai.nexconsultingltd.com/analytics
Manage subscription: https://ai.nexconsultingltd.com/settings

---
NeX Consulting Limited
    `,
  };
}
