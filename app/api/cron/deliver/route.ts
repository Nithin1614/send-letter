import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { letterStore } from "@/lib/store";
import { sendEmail, getScheduledDeliveryTemplate } from "@/lib/email";

export async function GET(req: NextRequest) {
  try {
    const nowIso = new Date().toISOString();
    let deliveredCount = 0;

    // 1. Process from Supabase
    try {
      const { data: dueLetters, error } = await supabase
        .from("ow_letters")
        .select("id, title, signature, recipient_email, scheduled_for, delivery_status")
        .eq("delivery_status", "scheduled")
        .lte("scheduled_for", nowIso);

      if (!error && dueLetters && dueLetters.length > 0) {
        const base = req.nextUrl.origin;

        for (const letter of dueLetters) {
          if (letter.recipient_email) {
            const recipientUrl = `${base}/r/${letter.id}`;
            await sendEmail({
              to: letter.recipient_email,
              subject: `💌 You have a sealed letter waiting for you: "${letter.title || 'A Secret Letter'}"`,
              html: getScheduledDeliveryTemplate(letter.title, recipientUrl, letter.signature),
            });

            await supabase
              .from("ow_letters")
              .update({ delivery_status: "delivered" })
              .eq("id", letter.id);

            deliveredCount++;
          }
        }
      }
    } catch (dbErr) {
      console.warn("Supabase cron error:", dbErr);
    }

    // 2. Process in-memory store fallback
    const base = req.nextUrl.origin;
    for (const [id, letter] of letterStore.entries()) {
      if (
        letter.deliveryStatus === "scheduled" &&
        letter.scheduledFor &&
        new Date(letter.scheduledFor).getTime() <= Date.now() &&
        letter.recipientEmail
      ) {
        const recipientUrl = `${base}/r/${id}`;
        await sendEmail({
          to: letter.recipientEmail,
          subject: `💌 You have a sealed letter waiting for you: "${letter.title || 'A Secret Letter'}"`,
          html: getScheduledDeliveryTemplate(letter.title, recipientUrl, letter.signature),
        });

        letter.deliveryStatus = "delivered";
        letterStore.set(id, letter);
        deliveredCount++;
      }
    }

    return NextResponse.json({ ok: true, delivered: deliveredCount, time: nowIso });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
