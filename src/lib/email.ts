const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const RESEND_FROM = process.env.RESEND_FROM || "Akenga Arts Centre";
const FROM_EMAIL = process.env.FROM_EMAIL || "hello@akengaarts.com";
const FROM = `${RESEND_FROM} <${FROM_EMAIL}>`;

export async function sendEmail(to: string, subject: string, html: string) {
  if (!RESEND_API_KEY) {
    console.log(`[EMAIL] Not sent (no RESEND_API_KEY). To: ${to}, Subject: ${subject}`);
    return { ok: false, reason: "no_api_key" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM,
        to: [to],
        subject,
        html,
      }),
    });

    const body = await res.json() as any;
    if (!res.ok) {
      console.error("[EMAIL] Resend error:", body);
      return { ok: false, reason: "resend_error", detail: body };
    }
    console.log(`[EMAIL] Sent to ${to}: ${subject}`);
    return { ok: true, id: body.id };
  } catch (err) {
    console.error("[EMAIL] Exception:", err);
    return { ok: false, reason: "exception" };
  }
}

export function renderActivationEmail(name: string, activationUrl: string) {
  return `
    <div style="font-family:Inter,system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#0a0a0a;color:#e0e0e0">
      <div style="text-align:center;margin-bottom:24px">
        <div style="display:inline-block;width:48px;height:48px;border-radius:50%;border:2px solid #c8a45c;line-height:44px;font-family:Georgia,serif;font-size:22px;color:#c8a45c">A</div>
      </div>
      <h2 style="font-family:Georgia,serif;font-size:24px;color:#f5f5f5;margin:0 0 8px">Welcome, ${name}</h2>
      <p style="font-size:14px;line-height:1.6;color:#a0a0a0;margin:0 0 24px">
        Thank you for joining the Akenga Arts Centre. Activate your account to access the boutique, enroll in classes, and more.
      </p>
      <div style="text-align:center;margin-bottom:32px">
        <a href="${activationUrl}" style="display:inline-block;padding:12px 32px;background:#c8a45c;color:#0a0a0a;font-size:12px;letter-spacing:0.2em;text-transform:uppercase;text-decoration:none;border-radius:4px">Activate Account</a>
      </div>
      <p style="font-size:12px;color:#666;margin:0">
        If you did not create this account, you can safely ignore this email.
      </p>
      <hr style="border:none;border-top:1px solid #222;margin:24px 0" />
      <p style="font-size:11px;color:#555;text-align:center">
        Akenga Arts Centre · Devson Court, Argwings Kodhek Close · Hurlingham, Nairobi
      </p>
    </div>
  `;
}

export function renderResetEmail(name: string, resetUrl: string) {
  return `
    <div style="font-family:Inter,system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#0a0a0a;color:#e0e0e0">
      <div style="text-align:center;margin-bottom:24px">
        <div style="display:inline-block;width:48px;height:48px;border-radius:50%;border:2px solid #c8a45c;line-height:44px;font-family:Georgia,serif;font-size:22px;color:#c8a45c">A</div>
      </div>
      <h2 style="font-family:Georgia,serif;font-size:24px;color:#f5f5f5;margin:0 0 8px">Reset Your Password</h2>
      <p style="font-size:14px;line-height:1.6;color:#a0a0a0;margin:0 0 24px">
        Hi ${name}, we received a request to reset your Akenga Arts Centre password. Click below to choose a new one (expires in 1 hour).
      </p>
      <div style="text-align:center;margin-bottom:32px">
        <a href="${resetUrl}" style="display:inline-block;padding:12px 32px;background:#c8a45c;color:#0a0a0a;font-size:12px;letter-spacing:0.2em;text-transform:uppercase;text-decoration:none;border-radius:4px">Reset Password</a>
      </div>
      <p style="font-size:12px;color:#666;margin:0">If you did not request this, ignore this email.</p>
      <hr style="border:none;border-top:1px solid #222;margin:24px 0" />
      <p style="font-size:11px;color:#555;text-align:center">Akenga Arts Centre · Hurlingham, Nairobi</p>
    </div>
  `;
}
