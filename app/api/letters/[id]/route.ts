import { NextRequest, NextResponse } from "next/server";
import { letterStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { sendEmail, getUnsealedAlertTemplate, getNewDeviceAlertTemplate } from "@/lib/email";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const now = new Date().toISOString();

  const devId = req.nextUrl.searchParams.get("devId") || "dev_anonymous";
  const devType = req.nextUrl.searchParams.get("devType") || "Device";

  // ── Try Supabase first ─────────────────────────────────────────────────────
  try {
    const { data: letter, error } = await supabase
      .from("ow_letters")
      .select("*")
      .eq("id", id)
      .single();

    if (!error && letter) {
      // Check existing device visits from ow_letter_events
      try {
        const { data: existingEvents } = await supabase
          .from("ow_letter_events")
          .select("event_type, metadata, created_at")
          .eq("letter_id", id)
          .in("event_type", ["device_opened", "letter_revisited", "letter_link_opened"])
          .order("created_at", { ascending: false });

        const deviceEvents = (existingEvents || []).filter(e => e.metadata?.deviceId === devId);
        const allDeviceOpenEvents = (existingEvents || []).filter(e => e.event_type === "device_opened");
        const isKnownDevice = deviceEvents.length > 0;

        if (!isKnownDevice) {
          // BRAND NEW DEVICE ➔ Increment unique device view count
          const currentCount = letter.view_count || 0;
          const isFirstEver = currentCount === 0;

          await supabase
            .from("ow_letters")
            .update({
              view_count: currentCount + 1,
              last_viewed_at: now,
            })
            .eq("id", id);

          await supabase.from("ow_letter_events").insert({
            letter_id: id,
            event_type: "device_opened",
            metadata: {
              deviceId: devId,
              deviceType: devType,
              isFirstDevice: isFirstEver,
              deviceIndex: allDeviceOpenEvents.length + 1,
            },
          });

          // If a 2nd+ device opens the link (shared link), alert sender by email
          if (!isFirstEver && letter.sender_email) {
            const base = req.nextUrl.origin;
            const manageUrl = `${base}/manage/${letter.id}?token=${letter.management_token}`;
            sendEmail({
              to: letter.sender_email,
              subject: `🔗 Your letter was opened on a new device (${devType})`,
              html: getNewDeviceAlertTemplate(letter.title, devType, manageUrl),
            }).catch(err => console.error("Failed to send new device alert email:", err));
          }
        } else {
          // SAME DEVICE RETURNING / REFRESHING ➔ Do NOT increment unique view count
          // Only log a revisit if it's been more than 3 minutes since the last visit on this device
          const lastEventTime = deviceEvents[0]?.created_at ? new Date(deviceEvents[0].created_at).getTime() : 0;
          const isRevisitAfterCooldown = (Date.now() - lastEventTime) > (3 * 60 * 1000);

          if (isRevisitAfterCooldown) {
            await supabase.from("ow_letter_events").insert({
              letter_id: id,
              event_type: "letter_revisited",
              metadata: {
                deviceId: devId,
                deviceType: devType,
              },
            });
            await supabase
              .from("ow_letters")
              .update({ last_viewed_at: now })
              .eq("id", id);
          }
        }
      } catch (evtErr) {
        console.warn("Device tracking event error:", evtErr);
      }

      // Return public display data — answer and management_token are NOT exposed
      return NextResponse.json({
        id: letter.id,
        title: letter.title,
        message: letter.message,
        signature: letter.signature,
        font: letter.font,
        theme: letter.theme,
        envelope: letter.envelope,
        sticker: letter.sticker,
        photo: letter.photo,
        song: letter.song,
        songArtist: letter.song_artist,
        songArtwork: letter.song_artwork,
        songPreviewUrl: letter.song_preview_url,
        voiceMessage: letter.voice_message,
        voiceDuration: letter.voice_duration,
        difficulty: letter.difficulty,
        guardianType: letter.guardian_type,
        question: letter.guardian_type === "question" ? letter.question : undefined,
        unlockAt: letter.unlock_at,
        ambientSoundscape: letter.ambient_soundscape || undefined,
        replyToId: letter.reply_to_id || undefined,
        replyLetterId: letter.reply_letter_id || undefined,
        openingStyle: letter.opening_style || 'wax-seal',
        letterTheme: letter.letter_theme || 'real-paper',
        createdAt: letter.created_at,
        openedAt: letter.opened_at || now,
        hasGuardian: letter.guardian_type !== "none",
      });
    }
  } catch (e) {
    console.error("Supabase fetch error:", e);
  }

  // ── Fallback: in-memory store ──────────────────────────────────────────────
  const letter = letterStore.get(id);
  if (!letter) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!letter.events) letter.events = [];
  const memDeviceEvents = letter.events.filter((e: any) => e.metadata?.deviceId === devId);
  const isKnownMemDevice = memDeviceEvents.length > 0;

  if (!isKnownMemDevice) {
    letter.viewCount = (letter.viewCount || 0) + 1;
    letter.lastViewedAt = now;
    letter.events.push({
      id: String(letter.events.length + 1),
      type: "device_opened",
      metadata: {
        deviceId: devId,
        deviceType: devType,
        isFirstDevice: letter.viewCount === 1,
      },
      createdAt: now,
    });
  } else {
    const lastMemTime = memDeviceEvents[memDeviceEvents.length - 1]?.createdAt ? new Date(memDeviceEvents[memDeviceEvents.length - 1].createdAt).getTime() : 0;
    if ((Date.now() - lastMemTime) > (3 * 60 * 1000)) {
      letter.events.push({
        id: String(letter.events.length + 1),
        type: "letter_revisited",
        metadata: {
          deviceId: devId,
          deviceType: devType,
        },
        createdAt: now,
      });
      letter.lastViewedAt = now;
    }
  }

  return NextResponse.json({
    id: letter.id,
    title: letter.title,
    message: letter.message,
    signature: letter.signature,
    font: letter.font,
    theme: letter.theme,
    envelope: letter.envelope,
    sticker: letter.sticker,
    photo: letter.photo,
    song: letter.song,
    songArtist: letter.songArtist,
    songArtwork: letter.songArtwork,
    songPreviewUrl: letter.songPreviewUrl,
    voiceMessage: letter.voiceMessage,
    voiceDuration: letter.voiceDuration,
    difficulty: letter.difficulty,
    guardianType: letter.guardianType,
    question: letter.guardianType === "question" ? letter.question : undefined,
    unlockAt: letter.unlockAt,
    ambientSoundscape: letter.ambientSoundscape,
    replyToId: letter.replyToId,
    replyLetterId: letter.replyLetterId,
    openingStyle: letter.openingStyle || 'wax-seal',
    letterTheme: letter.letterTheme || 'real-paper',
    createdAt: letter.createdAt,
    openedAt: letter.openedAt || now,
    hasGuardian: letter.guardianType !== "none",
  });
}
