import { NextRequest, NextResponse } from "next/server";
import { letterStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { sendEmail, getScheduledDeliveryTemplate, getReplyAlertTemplate } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title = "",
      message = "",
      signature = "",
      font = "Classic",
      theme = "Classic Burgundy",
      envelope = "Classic Wax",
      sticker = "",
      song = "",
      songArtist = "",
      songArtwork = "",
      songPreviewUrl = "",
      photo = "",
      voiceMessage = "",
      voiceDuration = 0,
      difficulty = "easy",
      guardianType = "none",
      question = "",
      answer = "",
      unlockAt = "",
      replyToId = "",
      senderEmail = "",
      recipientEmail = "",
      scheduledFor = "",
      ambientSoundscape = "",
      openingStyle = "wax-seal",
      letterTheme = "real-paper",
    } = body;

    function sanitizeEmail(email: string): string {
      if (!email) return '';
      let e = email.trim().toLowerCase();
      e = e.replace(/@gma(?:i|il|ill|ial|mil)\.com$/i, '@gmail.com');
      e = e.replace(/@yaho+\.com$/i, '@yahoo.com');
      e = e.replace(/@hotm(?:ial|ail)\.com$/i, '@hotmail.com');
      e = e.replace(/@outlo?k\.com$/i, '@outlook.com');
      return e;
    }

    const cleanSenderEmail = sanitizeEmail(senderEmail);
    const cleanRecipientEmail = sanitizeEmail(recipientEmail);

    // Generate short recipient ID (6 chars, alphanumeric)
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    const id = Array.from(crypto.getRandomValues(new Uint8Array(6)))
      .map(b => chars[b % chars.length]).join("");

    // Generate cryptographically secure management token (32-char hex)
    const token = crypto.randomUUID().replace(/-/g, "");

    const deliveryStatus = scheduledFor && cleanRecipientEmail ? "scheduled" : "delivered";
    const finalTitle = title?.trim() || "Sealed letter for you";

    const letterData = {
      id,
      management_token: token,
      title: finalTitle,
      message,
      signature,
      font,
      theme,
      envelope,
      sticker,
      photo,
      song,
      song_artist: songArtist,
      song_artwork: songArtwork,
      song_preview_url: songPreviewUrl,
      voice_message: voiceMessage,
      voice_duration: voiceDuration,
      difficulty,
      guardian_type: guardianType,
      question,
      answer: answer ? answer.trim().toLowerCase() : "",
      unlock_at: unlockAt || null,
      reply_to_id: replyToId || null,
      sender_email: cleanSenderEmail || null,
      recipient_email: cleanRecipientEmail || null,
      scheduled_for: scheduledFor || null,
      delivery_status: deliveryStatus,
      ambient_soundscape: ambientSoundscape || null,
      opening_style: openingStyle,
      letter_theme: letterTheme,
      seal_status: "unopened",
      view_count: 0,
      attempt_count: 0,
      reactions: [],
      created_at: new Date().toISOString(),
      opened_at: null,
      last_viewed_at: null,
    };

    // ── Persist to Supabase ──────────────────────────────────────────────────
    try {
      const { error: insertError } = await supabase
        .from("ow_letters")
        .insert(letterData);

      if (insertError) {
        console.warn("Supabase insert note:", insertError.message);
      }

      // Log the letter_created event
      try {
        await supabase.from("ow_letter_events").insert({
          letter_id: id,
          event_type: "letter_created",
          metadata: { title: finalTitle, replyToId: replyToId || undefined },
        });

        if (replyToId) {
          const { data: parentLetter } = await supabase
            .from("ow_letters")
            .select("id, title, sender_email, management_token")
            .eq("id", replyToId)
            .single();

          await supabase
            .from("ow_letters")
            .update({ reply_letter_id: id })
            .eq("id", replyToId);

          await supabase.from("ow_letter_events").insert({
            letter_id: replyToId,
            event_type: "reply_received",
            metadata: { replyLetterId: id, replyTitle: finalTitle, signature },
          });

          if (parentLetter?.sender_email) {
            const base = req.nextUrl.origin;
            const manageUrl = `${base}/manage/${parentLetter.id}?token=${parentLetter.management_token}`;
            sendEmail({
              to: parentLetter.sender_email,
              subject: `📬 New reply to your letter: "${parentLetter.title || 'A Secret Letter'}"`,
              html: getReplyAlertTemplate(parentLetter.title, signature, manageUrl),
            }).catch(err => console.error("Failed to send reply alert email:", err));
          }
        }
      } catch {}
    } catch (dbErr) {
      console.warn("Supabase unavailable, using in-memory store only:", dbErr);
    }

    // ── Immediate Email Delivery (if recipient email provided without future schedule) ──
    const isFutureSchedule = scheduledFor && new Date(scheduledFor).getTime() > Date.now();
    if (cleanRecipientEmail && !isFutureSchedule) {
      const base = req.nextUrl.origin;
      const recipientUrl = `${base}/r/${id}`;
      sendEmail({
        to: cleanRecipientEmail,
        subject: `💌 You have a sealed letter waiting for you: "${finalTitle}"`,
        html: getScheduledDeliveryTemplate(finalTitle, recipientUrl, signature),
      }).catch(err => console.error("Failed to send immediate recipient email:", err));
    }

    // ── Always save to in-memory store as fallback ────────────────────────────
    const inMemoryLetter = {
      id,
      token,
      title: finalTitle,
      message,
      signature,
      font,
      theme,
      envelope,
      sticker,
      song,
      songArtist,
      songArtwork,
      songPreviewUrl,
      photo,
      voiceMessage,
      voiceDuration,
      difficulty: difficulty as "easy" | "wait",
      guardianType: guardianType as "none" | "question" | "timelock",
      question,
      answer: answer ? answer.trim().toLowerCase() : "",
      unlockAt,
      replyToId,
      senderEmail: cleanSenderEmail,
      recipientEmail: cleanRecipientEmail,
      scheduledFor,
      deliveryStatus: deliveryStatus as "draft" | "scheduled" | "delivered",
      ambientSoundscape,
      letterTheme,
      reactions: [],
      viewCount: 0,
      attemptCount: 0,
      events: [
        {
          id: "1",
          type: "letter_created",
          metadata: { title: finalTitle },
          createdAt: new Date().toISOString(),
        }
      ],
      createdAt: new Date().toISOString(),
      openedAt: undefined,
    };
    letterStore.set(id, inMemoryLetter);

    // If reply, also update parent in inMemoryLetter store and send email
    if (replyToId && letterStore.has(replyToId)) {
      const parent = letterStore.get(replyToId)!;
      parent.replyLetterId = id;
      letterStore.set(replyToId, parent);

      if (parent.senderEmail) {
        const base = req.nextUrl.origin;
        const manageUrl = `${base}/manage/${parent.id}?token=${parent.token}`;
        sendEmail({
          to: parent.senderEmail,
          subject: `📬 New reply to your letter: "${parent.title || 'A Secret Letter'}"`,
          html: getReplyAlertTemplate(parent.title, signature, manageUrl),
        }).catch(err => console.error("Failed to send in-memory reply alert email:", err));
      }
    }

    const base = req.nextUrl.origin;
    return NextResponse.json({
      id,
      token,
      shareUrl: `${base}/r/${id}`,
      manageUrl: `${base}/manage/${id}?token=${token}`,
    }, { status: 201 });
  } catch (err) {
    console.error("Letter creation error:", err);
    return NextResponse.json({ error: "Failed to create letter" }, { status: 500 });
  }
}
