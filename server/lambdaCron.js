/**
 * lambdaCron.js — Scheduled Lambda handlers for YoYo cron jobs
 *
 * These are triggered by AWS EventBridge Scheduler rules defined in serverless.yml.
 * They run the same job functions as scheduler.js but as standalone Lambda invocations
 * instead of node-cron (which only works in long-running EC2/server.js processes).
 *
 * H-3 FIX: cron was only started in server.js (EC2 / local). lambda.js never called
 * startScheduler(), so auto-cancel and check-in reminders were completely dead on the
 * Lambda production deployment. EventBridge Scheduler is part of the AWS free tier
 * (1 million invocations/month free) — no EC2 required.
 *
 * Handlers exported:
 *   autoCancelHandler   — cancel unpaid bookings older than 30 min (every 15 min)
 *   reminderHandler     — send check-in reminder emails (daily 8 AM IST)
 */

import 'dotenv/config';
import connectDB     from './configs/db.js';
import Booking       from './models/Booking.js';
import User          from './models/User.js';
import Room          from './models/Room.js';
import transporter   from './configs/nodemailer.js';

// ── DB bootstrap ──────────────────────────────────────────────────
const withDB = (fn) => async (event) => {
    await connectDB();
    return fn(event);
};

// ── Job 1: Auto-cancel unpaid pending bookings ────────────────────
const autoCancelJob = async () => {
    const cutoff = new Date(Date.now() - 30 * 60 * 1000); // 30 min ago
    const result = await Booking.updateMany(
        {
            status:    'pending',
            isPaid:    false,
            createdAt: { $lt: cutoff },
        },
        {
            $set: {
                status:      'cancelled',
                cancelledAt: new Date(),
                refundStatus:'none',
            },
        }
    );
    const count = result.modifiedCount;
    console.log(`[Cron/Lambda] Auto-cancelled ${count} unpaid booking(s)`);
    return { statusCode: 200, body: JSON.stringify({ cancelled: count }) };
};

export const autoCancelHandler = withDB(autoCancelJob);

// ── Reminder email template (mirrors scheduler.js) ─────────────────
const sendReminderEmail = async (toEmail, username, booking, room) => {
    const html = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f6f6fc;font-family:'Inter',Arial,sans-serif">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
    <div style="background:#E8003D;padding:28px 24px;text-align:center">
      <span style="font-size:26px;font-weight:900;color:#fff;letter-spacing:-1px">YoYo Rooms</span>
      <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px">⏰ Check-In Tomorrow!</p>
    </div>
    <div style="padding:32px 24px">
      <p style="font-size:16px;color:#0d0d1a">Hi <strong>${username}</strong>,</p>
      <p style="font-size:14px;color:#4a4a6a">Your check-in is <strong>tomorrow</strong>. Get ready for a great stay!</p>
      <div style="background:#f6f6fc;border-radius:12px;padding:20px;margin:20px 0">
        <p style="margin:4px 0;font-size:14px;color:#0d0d1a"><strong>🏨 Hotel:</strong> ${room?.hotel?.name || 'Your Hotel'}</p>
        <p style="margin:4px 0;font-size:14px;color:#0d0d1a"><strong>📍 City:</strong> ${room?.hotel?.city || ''}</p>
        <p style="margin:4px 0;font-size:14px;color:#0d0d1a"><strong>📅 Check-In:</strong> ${new Date(booking.checkInDate).toDateString()}</p>
        <p style="margin:4px 0;font-size:14px;color:#0d0d1a"><strong>📅 Check-Out:</strong> ${new Date(booking.checkOutDate).toDateString()}</p>
      </div>
      <p style="font-size:12px;color:#8888aa">Booking ID: ${booking._id}</p>
    </div>
    <div style="background:#f6f6fc;padding:16px;text-align:center">
      <p style="color:#8888aa;font-size:12px;margin:0">© 2025 YoYo Rooms. Have a wonderful stay! 🌟</p>
    </div>
  </div>
</body>
</html>`;

    await transporter.sendMail({
        from: `"YoYo Rooms" <${process.env.SENDER_EMAIL}>`,
        to:   toEmail,
        subject: `📅 Check-In Tomorrow — ${room?.hotel?.name || 'Your Booking'}`,
        html,
    }).catch(err => console.warn('[Cron/Lambda] Reminder email failed:', err.message));
};

// ── Job 2: Check-in reminders ─────────────────────────────────────
const reminderJob = async () => {
    const tomorrow      = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStart = new Date(tomorrow.setHours(0, 0, 0, 0));
    const tomorrowEnd   = new Date(tomorrow.setHours(23, 59, 59, 999));

    const bookings = await Booking.find({
        checkInDate:  { $gte: tomorrowStart, $lte: tomorrowEnd },
        status:       { $ne: 'cancelled' },
        reminderSent: { $ne: true },
    }).populate('user room');

    let sent = 0;
    for (const booking of bookings) {
        if (!booking.user?.email) continue;
        const room = await Room.findById(booking.room).populate('hotel');
        await sendReminderEmail(booking.user.email, booking.user.username, booking, room);
        await Booking.findByIdAndUpdate(booking._id, { reminderSent: true });
        sent++;
    }

    console.log(`[Cron/Lambda] Sent ${sent} check-in reminder(s)`);
    return { statusCode: 200, body: JSON.stringify({ reminded: sent }) };
};

export const reminderHandler = withDB(reminderJob);
