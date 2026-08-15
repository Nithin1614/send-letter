import nodemailer from 'nodemailer';

// Transactional Email Service (Powered by Gmail SMTP with Resend fallback)

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailParams): Promise<{ success: boolean; error?: string }> {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;

  // Auto-generate plain-text if not explicitly provided (crucial for spam filter score)
  const plainText = text || html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();

  // 1. Primary Engine: Gmail SMTP via Google App Password
  if (gmailUser && gmailPass) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailPass.replace(/\s+/g, ''), // Strip spaces from app password
        },
      });

      await transporter.sendMail({
        from: `"Send Letter" <${gmailUser}>`,
        to,
        subject,
        text: plainText,
        html,
        headers: {
          'X-Mailer': 'SendLetter/1.0',
          'X-Priority': '3',
        },
      });

      console.log(`[EMAIL GMAIL SMTP SUCCESS] ➔ Delivered to: ${to} | Subject: "${subject}"`);
      return { success: true };
    } catch (gmailErr: any) {
      console.error("[EMAIL GMAIL SMTP ERROR]", gmailErr?.message || gmailErr);
      // Fall through to Resend if Gmail SMTP throws
    }
  }

  // 2. Fallback Engine: Resend API
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || "Send Letter <onboarding@resend.dev>";

  if (resendApiKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [to],
          subject,
          html,
        }),
      });

      if (res.ok) {
        console.log(`[EMAIL RESEND SUCCESS] ➔ Delivered to: ${to}`);
        return { success: true };
      }
      const errData = await res.json().catch(() => ({}));
      console.warn("[EMAIL RESEND WARN]", errData);
    } catch (resendErr: any) {
      console.error("[EMAIL RESEND ERROR]", resendErr?.message || resendErr);
    }
  }

  return { success: false, error: "No available email transport succeeded" };
}

// ── Email Templates (Mobile-Optimized & Bulletproof for Gmail / Outlook) ────

export function getUnsealedAlertTemplate(letterTitle: string, manageUrl: string) {
  const title = letterTitle ? `"${letterTitle}"` : "Your Secret Letter";
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Letter Has Been Unsealed</title>
    </head>
    <body style="margin: 0; padding: 20px 10px; background-color: #0a0205; font-family: Georgia, 'Times New Roman', serif; -webkit-font-smoothing: antialiased;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; margin: 0 auto; background: #16060c; border: 1px solid #3d1420; border-radius: 14px; overflow: hidden; box-shadow: 0 12px 36px rgba(0,0,0,0.6);">
        <!-- Header -->
        <tr>
          <td align="center" style="padding: 36px 24px 16px 24px;">
            <div style="width: 56px; height: 56px; line-height: 56px; border-radius: 50%; background: #c41e3a; font-size: 26px; text-align: center; margin: 0 auto 16px auto; color: #ffffff;">
              💌
            </div>
            <h1 style="font-size: 23px; font-weight: normal; margin: 0 0 6px 0; color: #faf8f5; letter-spacing: 0.02em;">
              Your Letter Has Been Unsealed
            </h1>
            <p style="font-size: 12.5px; color: #d4a574; margin: 0; letter-spacing: 0.1em; text-transform: uppercase;">
              Live Delivery Receipt
            </p>
          </td>
        </tr>

        <!-- Content -->
        <tr>
          <td align="center" style="padding: 12px 28px 24px 28px;">
            <p style="font-size: 16px; line-height: 1.6; color: #e8ded2; margin: 0 0 12px 0;">
              Great news! The wax seal on <strong style="color: #ffffff;">${title}</strong> was just broken, and your recipient is reading your words right now.
            </p>
          </td>
        </tr>

        <!-- Bulletproof Button -->
        <tr>
          <td align="center" style="padding: 0 24px 32px 24px;">
            <table border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
              <tr>
                <td align="center" style="border-radius: 8px; background: #c41e3a;">
                  <a href="${manageUrl}" target="_blank" style="display: block; padding: 14px 28px; font-size: 14.5px; font-weight: bold; color: #ffffff; text-decoration: none; border-radius: 8px; letter-spacing: 0.05em; text-align: center; line-height: 1.3;">
                    VIEW LIVE DASHBOARD →
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td align="center" style="padding: 18px 24px 24px 24px; border-top: 1px solid #280e16; background: #110408;">
            <p style="font-size: 12px; color: rgba(250, 248, 245, 0.4); margin: 0; line-height: 1.5;">
              Track opens, reactions, and private activity · Sealed with Send Letter
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

export function getReactionAlertTemplate(letterTitle: string, emoji: string, manageUrl: string) {
  const title = letterTitle ? `"${letterTitle}"` : "Your Secret Letter";
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Reaction on Your Letter</title>
    </head>
    <body style="margin: 0; padding: 20px 10px; background-color: #0a0205; font-family: Georgia, 'Times New Roman', serif; -webkit-font-smoothing: antialiased;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; margin: 0 auto; background: #16060c; border: 1px solid #3d1420; border-radius: 14px; overflow: hidden; box-shadow: 0 12px 36px rgba(0,0,0,0.6);">
        <!-- Header -->
        <tr>
          <td align="center" style="padding: 36px 24px 16px 24px;">
            <div style="width: 56px; height: 56px; line-height: 56px; border-radius: 50%; background: #280a14; border: 1px solid #d4a574; font-size: 28px; text-align: center; margin: 0 auto 16px auto;">
              ${emoji}
            </div>
            <h1 style="font-size: 23px; font-weight: normal; margin: 0 0 6px 0; color: #faf8f5; letter-spacing: 0.02em;">
              New Reaction on Your Letter
            </h1>
            <p style="font-size: 12.5px; color: #d4a574; margin: 0; letter-spacing: 0.1em; text-transform: uppercase;">
              Recipient Sent ${emoji}
            </p>
          </td>
        </tr>

        <!-- Content -->
        <tr>
          <td align="center" style="padding: 12px 28px 24px 28px;">
            <p style="font-size: 16px; line-height: 1.6; color: #e8ded2; margin: 0 0 12px 0;">
              Your recipient just reacted with <strong style="font-size: 20px;">${emoji}</strong> to <strong style="color: #ffffff;">${title}</strong>.
            </p>
          </td>
        </tr>

        <!-- Bulletproof Button -->
        <tr>
          <td align="center" style="padding: 0 24px 32px 24px;">
            <table border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
              <tr>
                <td align="center" style="border-radius: 8px; background: #c41e3a;">
                  <a href="${manageUrl}" target="_blank" style="display: block; padding: 14px 28px; font-size: 14.5px; font-weight: bold; color: #ffffff; text-decoration: none; border-radius: 8px; letter-spacing: 0.05em; text-align: center; line-height: 1.3;">
                    VIEW MANAGE DASHBOARD →
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td align="center" style="padding: 18px 24px 24px 24px; border-top: 1px solid #280e16; background: #110408;">
            <p style="font-size: 12px; color: rgba(250, 248, 245, 0.4); margin: 0; line-height: 1.5;">
              Track opens, reactions, and private activity · Sealed with Send Letter
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

export function getScheduledDeliveryTemplate(letterTitle: string, recipientUrl: string, senderName?: string) {
  const title = letterTitle ? `"${letterTitle}"` : "A Secret Letter";
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>A Secret Letter Has Arrived</title>
    </head>
    <body style="margin: 0; padding: 20px 10px; background-color: #0a0205; font-family: Georgia, 'Times New Roman', serif; -webkit-font-smoothing: antialiased;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; margin: 0 auto; background: #16060c; border: 1px solid #3d1420; border-radius: 14px; overflow: hidden; box-shadow: 0 12px 36px rgba(0,0,0,0.6);">
        <!-- Header -->
        <tr>
          <td align="center" style="padding: 36px 24px 16px 24px;">
            <div style="width: 56px; height: 56px; line-height: 56px; border-radius: 50%; background: #c41e3a; font-size: 26px; text-align: center; margin: 0 auto 16px auto; color: #ffffff;">
              💌
            </div>
            <h1 style="font-size: 23px; font-weight: normal; margin: 0 0 6px 0; color: #faf8f5; letter-spacing: 0.02em;">
              A Secret Letter Has Arrived
            </h1>
            <p style="font-size: 12.5px; color: #d4a574; margin: 0; letter-spacing: 0.1em; text-transform: uppercase;">
              Sealed Just For You
            </p>
          </td>
        </tr>

        <!-- Content -->
        <tr>
          <td align="center" style="padding: 12px 28px 24px 28px;">
            <p style="font-size: 16px; line-height: 1.6; color: #e8ded2; margin: 0 0 12px 0;">
              ${senderName ? `<strong style="color: #ffffff;">${senderName}</strong> has` : '<strong style="color: #ffffff;">Someone special</strong> has'} sent you a sealed digital letter: <strong style="color: #ffffff;">${title}</strong>.
            </p>
            <p style="font-size: 14px; line-height: 1.5; color: rgba(250, 248, 245, 0.6); margin: 0;">
              Click below to break the wax seal and reveal the secret message.
            </p>
          </td>
        </tr>

        <!-- Bulletproof Button -->
        <tr>
          <td align="center" style="padding: 8px 24px 32px 24px;">
            <table border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
              <tr>
                <td align="center" style="border-radius: 8px; background: #c41e3a;">
                  <a href="${recipientUrl}" target="_blank" style="display: block; padding: 14px 32px; font-size: 15px; font-weight: bold; color: #ffffff; text-decoration: none; border-radius: 8px; letter-spacing: 0.05em; text-align: center; line-height: 1.3;">
                    UNSEAL YOUR LETTER →
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td align="center" style="padding: 18px 24px 24px 24px; border-top: 1px solid #280e16; background: #110408;">
            <p style="font-size: 12px; color: rgba(250, 248, 245, 0.4); margin: 0; line-height: 1.5;">
              Private, sealed letter · Delivered with Send Letter
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

export function getReplyAlertTemplate(originalTitle: string, replySignature: string, manageUrl: string) {
  const title = originalTitle ? `"${originalTitle}"` : "Your Secret Letter";
  const author = replySignature ? `<strong style="color: #ffffff;">${replySignature}</strong>` : "<strong style=\"color: #ffffff;\">Your recipient</strong>";
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Reply Received</title>
    </head>
    <body style="margin: 0; padding: 20px 10px; background-color: #0a0205; font-family: Georgia, 'Times New Roman', serif; -webkit-font-smoothing: antialiased;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; margin: 0 auto; background: #16060c; border: 1px solid #3d1420; border-radius: 14px; overflow: hidden; box-shadow: 0 12px 36px rgba(0,0,0,0.6);">
        <!-- Header -->
        <tr>
          <td align="center" style="padding: 36px 24px 16px 24px;">
            <div style="width: 56px; height: 56px; line-height: 56px; border-radius: 50%; background: #c41e3a; font-size: 26px; text-align: center; margin: 0 auto 16px auto; color: #ffffff;">
              📬
            </div>
            <h1 style="font-size: 23px; font-weight: normal; margin: 0 0 6px 0; color: #faf8f5; letter-spacing: 0.02em;">
              New Reply Received!
            </h1>
            <p style="font-size: 12.5px; color: #d4a574; margin: 0; letter-spacing: 0.1em; text-transform: uppercase;">
              A Secret Response Has Arrived
            </p>
          </td>
        </tr>

        <!-- Content -->
        <tr>
          <td align="center" style="padding: 12px 28px 24px 28px;">
            <p style="font-size: 16px; line-height: 1.6; color: #e8ded2; margin: 0 0 12px 0;">
              ${author} has just written back to your letter <strong style="color: #ffffff;">${title}</strong>!
            </p>
            <p style="font-size: 14px; line-height: 1.5; color: rgba(250, 248, 245, 0.6); margin: 0;">
              Click below to view the private 2-way conversation and read their reply on your live dashboard.
            </p>
          </td>
        </tr>

        <!-- Bulletproof Button -->
        <tr>
          <td align="center" style="padding: 8px 24px 32px 24px;">
            <table border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
              <tr>
                <td align="center" style="border-radius: 8px; background: #c41e3a;">
                  <a href="${manageUrl}" target="_blank" style="display: block; padding: 14px 32px; font-size: 15px; font-weight: bold; color: #ffffff; text-decoration: none; border-radius: 8px; letter-spacing: 0.05em; text-align: center; line-height: 1.3;">
                    READ SECRET REPLY →
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td align="center" style="padding: 18px 24px 24px 24px; border-top: 1px solid #280e16; background: #110408;">
            <p style="font-size: 12px; color: rgba(250, 248, 245, 0.4); margin: 0; line-height: 1.5;">
              Private, sealed letter · Delivered with Send Letter
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

export function getNewDeviceAlertTemplate(letterTitle: string, deviceType: string, manageUrl: string) {
  const title = letterTitle ? `"${letterTitle}"` : "Your Secret Letter";
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Letter Opened on New Device</title>
    </head>
    <body style="margin: 0; padding: 20px 10px; background-color: #0a0205; font-family: Georgia, 'Times New Roman', serif; -webkit-font-smoothing: antialiased;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; margin: 0 auto; background: #16060c; border: 1px solid #3d1420; border-radius: 14px; overflow: hidden; box-shadow: 0 12px 36px rgba(0,0,0,0.6);">
        <!-- Header -->
        <tr>
          <td align="center" style="padding: 36px 24px 16px 24px;">
            <div style="width: 56px; height: 56px; line-height: 56px; border-radius: 50%; background: #280a14; border: 1px solid #d4a574; font-size: 26px; text-align: center; margin: 0 auto 16px auto; color: #ffffff;">
              🔗
            </div>
            <h1 style="font-size: 23px; font-weight: normal; margin: 0 0 6px 0; color: #faf8f5; letter-spacing: 0.02em;">
              Opened on a New Device
            </h1>
            <p style="font-size: 12.5px; color: #d4a574; margin: 0; letter-spacing: 0.1em; text-transform: uppercase;">
              ${deviceType} Detected
            </p>
          </td>
        </tr>

        <!-- Content -->
        <tr>
          <td align="center" style="padding: 12px 28px 24px 28px;">
            <p style="font-size: 16px; line-height: 1.6; color: #e8ded2; margin: 0 0 12px 0;">
              Your secret letter <strong style="color: #ffffff;">${title}</strong> was just opened on a new device (<strong style="color: #d4a574;">${deviceType}</strong>).
            </p>
            <p style="font-size: 14px; line-height: 1.5; color: rgba(250, 248, 245, 0.6); margin: 0;">
              This occurs when your recipient opens the link on a second device (like their computer or tablet) or shares the link.
            </p>
          </td>
        </tr>

        <!-- Bulletproof Button -->
        <tr>
          <td align="center" style="padding: 8px 24px 32px 24px;">
            <table border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
              <tr>
                <td align="center" style="border-radius: 8px; background: #c41e3a;">
                  <a href="${manageUrl}" target="_blank" style="display: block; padding: 14px 32px; font-size: 15px; font-weight: bold; color: #ffffff; text-decoration: none; border-radius: 8px; letter-spacing: 0.05em; text-align: center; line-height: 1.3;">
                    VIEW LIVE DASHBOARD →
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td align="center" style="padding: 18px 24px 24px 24px; border-top: 1px solid #280e16; background: #110408;">
            <p style="font-size: 12px; color: rgba(250, 248, 245, 0.4); margin: 0; line-height: 1.5;">
              Live Activity Tracking · Sealed with Send Letter
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

export async function sendCreatorPatronageAlert({
  supporterName,
  supporterMessage,
  amount,
  tierName,
  paymentId,
  orderId,
}: {
  supporterName: string;
  supporterMessage?: string;
  amount: number;
  tierName: string;
  paymentId: string;
  orderId: string;
}) {
  const creatorEmail = 'nithinpenmetsa16@gmail.com';
  const name = supporterName?.trim() || 'Anonymous Supporter';
  const message = supporterMessage?.trim();
  const subject = `🎉 New Supporter on Send Letter: ₹${amount} from ${name}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Patronage Received</title>
    </head>
    <body style="margin: 0; padding: 24px 12px; background-color: #090a0f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; -webkit-font-smoothing: antialiased; color: #f3f4f6;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 540px; margin: 0 auto; background: #11131c; border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 16px; overflow: hidden; box-shadow: 0 16px 48px rgba(0,0,0,0.6);">
        <!-- Header -->
        <tr>
          <td align="center" style="padding: 32px 24px 16px 24px; background: linear-gradient(180deg, rgba(99, 102, 241, 0.15) 0%, transparent 100%);">
            <div style="display: inline-block; width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #10b981 0%, #059669 100%); line-height: 48px; font-size: 24px; color: #ffffff; text-align: center; margin-bottom: 12px; box-shadow: 0 0 20px rgba(16, 185, 129, 0.4);">
              ₹
            </div>
            <h1 style="font-size: 22px; font-weight: 700; color: #ffffff; margin: 0 0 6px 0;">
              New Supporter Contribution!
            </h1>
            <p style="font-size: 14px; color: #9ca3af; margin: 0;">
              Someone just backed Send Letter on Razorpay
            </p>
          </td>
        </tr>

        <!-- Key Metrics Box -->
        <tr>
          <td style="padding: 16px 28px;">
            <div style="background: rgba(0,0,0,0.45); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 18px 20px; text-align: center;">
              <div style="font-size: 13px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px;">
                Amount Received
              </div>
              <div style="font-size: 36px; font-weight: 800; color: #10b981; margin-bottom: 4px;">
                ₹${amount}
              </div>
              <div style="font-size: 13px; color: #818cf8; font-weight: 600;">
                Tier: ${tierName}
              </div>
            </div>
          </td>
        </tr>

        <!-- Supporter Details -->
        <tr>
          <td style="padding: 12px 28px 20px 28px;">
            <table width="100%" style="font-size: 14px; color: #d1d5db; line-height: 1.8;">
              <tr>
                <td style="color: #9ca3af; width: 120px;">Supporter:</td>
                <td style="font-weight: 600; color: #ffffff;">${name}</td>
              </tr>
              <tr>
                <td style="color: #9ca3af;">Payment ID:</td>
                <td><code style="color: #818cf8;">${paymentId}</code></td>
              </tr>
              <tr>
                <td style="color: #9ca3af;">Order ID:</td>
                <td>${orderId}</td>
              </tr>
              <tr>
                <td style="color: #9ca3af;">Timestamp:</td>
                <td>${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</td>
              </tr>
            </table>

            ${
              message
                ? `
              <div style="margin-top: 20px; background: rgba(99, 102, 241, 0.08); border-left: 3px solid #6366f1; border-radius: 4px; padding: 14px 16px;">
                <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #818cf8; margin-bottom: 6px; letter-spacing: 0.06em;">
                  💌 Message from ${name}:
                </div>
                <div style="font-size: 15px; color: #ffffff; font-style: italic; line-height: 1.5;">
                  &ldquo;${message}&rdquo;
                </div>
              </div>
            `
                : ''
            }
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td align="center" style="padding: 16px 24px; border-top: 1px solid rgba(255,255,255,0.06); background: rgba(0,0,0,0.3);">
            <p style="font-size: 12px; color: #6b7280; margin: 0;">
              Send Letter Creator Intelligence · Automatic Patron Notification
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return sendEmail({
    to: creatorEmail,
    subject,
    html,
  });
}

