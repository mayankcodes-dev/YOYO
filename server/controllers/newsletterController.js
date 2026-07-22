import Newsletter   from '../models/Newsletter.js';
import transporter  from '../configs/nodemailer.js';
import { ok, fail } from '../utils/respond.js';
import rateLimit    from 'express-rate-limit';

const SENDER = `"YoYo Rooms" <${process.env.SMTP_USER}>`;

// ── Rate limiter: max 3 subscribe attempts per IP per hour ───────
export const subscribeLimit = rateLimit({
    windowMs: 60 * 60 * 1000,
    max:      3,
    message:  { success: false, message: 'Too many subscribe requests. Please try again later.' },
    standardHeaders: true,
    legacyHeaders:   false,
});

// ── POST /api/newsletter/subscribe ───────────────────────────────
export const subscribe = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email?.trim()) return fail(res, 'Email is required');

        const emailLower = email.toLowerCase().trim();
        if (!/^\S+@\S+\.\S+$/.test(emailLower)) return fail(res, 'Invalid email address');

        // Upsert: if they previously unsubscribed, re-activate
        const existing = await Newsletter.findOne({ email: emailLower });
        if (existing) {
            if (existing.active) return fail(res, 'You are already subscribed!', 409);
            existing.active = true;
            await existing.save();
            return ok(res, { message: 'Welcome back! You have been re-subscribed.' });
        }

        await Newsletter.create({ email: emailLower });

        // Send a welcome confirmation email (fire-and-forget — don't block response)
        transporter.sendMail({
            from:    SENDER,
            to:      emailLower,
            subject: '🎉 You\'re on the list — YoYo Rooms',
            html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0f0f14;font-family:'Inter',sans-serif;color:#f1f1f1;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:40px auto;">
    <tr>
      <td style="background:linear-gradient(135deg,#E8003D,#9B001F);border-radius:16px 16px 0 0;padding:36px 40px;text-align:center;">
        <h1 style="margin:0;font-size:28px;font-weight:900;color:#fff;letter-spacing:-0.5px;">YoYo Rooms</h1>
        <p style="margin:8px 0 0;color:rgba(255,255,255,0.75);font-size:13px;">Hotel Booking, Reinvented</p>
      </td>
    </tr>
    <tr>
      <td style="background:#1a1a24;padding:36px 40px;border-radius:0 0 16px 16px;">
        <h2 style="margin:0 0 12px;font-size:22px;color:#fff;">You're in! 🎉</h2>
        <p style="margin:0 0 20px;color:#a0a0b0;line-height:1.65;font-size:15px;">
          Thanks for subscribing to <strong style="color:#fff;">YoYo Rooms</strong>. 
          You'll be the first to know about exclusive deals, flash sales, and new destinations.
        </p>
        <div style="background:rgba(232,0,61,0.10);border:1px solid rgba(232,0,61,0.25);border-radius:12px;padding:20px;margin-bottom:28px;">
          <p style="margin:0;color:#E8003D;font-weight:700;font-size:13px;letter-spacing:0.5px;text-transform:uppercase;">Your welcome gift</p>
          <p style="margin:6px 0 0;color:#fff;font-size:22px;font-weight:900;">Use code <span style="color:#E8003D;">WELCOME50</span></p>
          <p style="margin:4px 0 0;color:#a0a0b0;font-size:13px;">₹50 off your first booking</p>
        </div>
        <a href="${process.env.CLIENT_URL || 'https://yoyo-rooms.vercel.app'}/rooms"
           style="display:inline-block;background:linear-gradient(135deg,#E8003D,#9B001F);color:#fff;text-decoration:none;padding:14px 28px;border-radius:12px;font-weight:700;font-size:15px;">
          Browse Rooms →
        </a>
        <p style="margin:28px 0 0;color:#606070;font-size:12px;line-height:1.5;">
          You received this because you subscribed at yoyo-rooms.vercel.app.<br>
          <a href="mailto:admin@mayankcodes.dev?subject=Unsubscribe&body=${encodeURIComponent(emailLower)}" style="color:#E8003D;">Unsubscribe</a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
            `.trim(),
        }).catch(err => console.error('[newsletter] welcome email failed:', err.message));

        return res.status(201).json({ success: true, message: 'Subscribed! Check your inbox for a welcome gift 🎁' });
    } catch (err) {
        if (err.code === 11000) return fail(res, 'You are already subscribed!', 409); // duplicate key
        console.error('[newsletter/subscribe]', err.message);
        return fail(res, 'Subscription failed. Please try again.', 500);
    }
};

// ── POST /api/newsletter/unsubscribe ─────────────────────────────
export const unsubscribe = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email?.trim()) return fail(res, 'Email is required');

        const doc = await Newsletter.findOne({ email: email.toLowerCase().trim() });
        if (!doc || !doc.active) return ok(res, { message: 'Email not found in our list.' });

        doc.active = false;
        await doc.save();
        return ok(res, { message: 'You have been unsubscribed.' });
    } catch (err) {
        return fail(res, 'Unsubscribe failed', 500);
    }
};
