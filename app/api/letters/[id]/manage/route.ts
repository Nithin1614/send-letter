import { NextRequest, NextResponse } from "next/server";
import { letterStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Management token required" }, { status: 401 });
  }

  // ── Try Supabase first ─────────────────────────────────────────────────────
  try {
    // Fetch letter and validate management token
    const { data: letter, error } = await supabase
      .from("ow_letters")
      .select("*")
      .eq("id", id)
      .single();

    if (!error && letter) {
      // Validate management token
      if (letter.management_token !== token) {
        return NextResponse.json({ error: "Invalid management token" }, { status: 403 });
      }

      // Fetch events for the timeline
      const { data: events } = await supabase
        .from("ow_letter_events")
        .select("*")
        .eq("letter_id", id)
        .order("created_at", { ascending: true });

      // Fetch any replies created in response to this letter
      const { data: replies } = await supabase
        .from("ow_letters")
        .select("id, title, signature, font, theme, seal_status, created_at, opened_at")
        .eq("reply_to_id", id)
        .order("created_at", { ascending: false });

      // Clean and consolidate events for a clean, elegant timeline
      const rawEvents = events || [];
      const seenMilestones = new Set<string>();
      const cleanEvents: Array<{ id: string; type: string; metadata: any; createdAt: string }> = [];
      let revisitCount = 0;

      for (const e of rawEvents) {
        if (e.event_type === 'letter_revisited') {
          revisitCount++;
        }

        if (['letter_created', 'letter_link_opened', 'letter_unsealed'].includes(e.event_type)) {
          if (seenMilestones.has(e.event_type)) continue;
          seenMilestones.add(e.event_type);
        }
        cleanEvents.push({
          id: e.id,
          type: e.event_type,
          metadata: e.metadata,
          createdAt: e.created_at,
        });
      }

      return NextResponse.json({
        id: letter.id,
        title: letter.title,
        font: letter.font,
        theme: letter.theme,
        envelope: letter.envelope,
        song: letter.song,
        songArtist: letter.song_artist,
        songArtwork: letter.song_artwork,
        voiceMessage: letter.voice_message,
        voiceDuration: letter.voice_duration,
        photo: letter.photo,
        sealStatus: letter.seal_status,
        viewCount: letter.view_count || 0,
        revisitCount,
        attemptCount: letter.attempt_count || 0,
        reactions: letter.reactions || [],
        unlockAt: letter.unlock_at,
        ambientSoundscape: letter.ambient_soundscape,
        createdAt: letter.created_at,
        openedAt: letter.opened_at,
        lastViewedAt: letter.last_viewed_at,
        guardianType: letter.guardian_type,
        senderEmail: letter.sender_email || undefined,
        recipientEmail: letter.recipient_email || undefined,
        scheduledFor: letter.scheduled_for || undefined,
        deliveryStatus: letter.delivery_status || undefined,
        replies: (replies || []).map(r => ({
          id: r.id,
          title: r.title,
          signature: r.signature,
          font: r.font,
          theme: r.theme,
          sealStatus: r.seal_status,
          createdAt: r.created_at,
          openedAt: r.opened_at,
        })),
        events: cleanEvents,
      });
    }
  } catch (e) {
    console.error("Supabase manage fetch error:", e);
  }

  // ── Fallback: in-memory store ──────────────────────────────────────────────
  const letter = letterStore.get(id);
  if (!letter) {
    return NextResponse.json({ error: "Letter not found" }, { status: 404 });
  }

  // Validate token against in-memory store
  if (letter.token !== token) {
    return NextResponse.json({ error: "Invalid management token" }, { status: 403 });
  }

  // Find any in-memory replies
  const inMemoryReplies: any[] = [];
  for (const [rId, rLet] of letterStore.entries()) {
    if (rLet.replyToId === id) {
      inMemoryReplies.push({
        id: rId,
        title: rLet.title,
        signature: rLet.signature,
        font: rLet.font,
        theme: rLet.theme,
        sealStatus: rLet.openedAt ? "unsealed" : "unopened",
        createdAt: rLet.createdAt,
        openedAt: rLet.openedAt || null,
      });
    }
  }

  return NextResponse.json({
    id: letter.id,
    title: letter.title,
    font: letter.font,
    theme: letter.theme,
    envelope: letter.envelope,
    song: letter.song,
    songArtist: letter.songArtist,
    songArtwork: letter.songArtwork,
    voiceMessage: letter.voiceMessage,
    voiceDuration: letter.voiceDuration,
    photo: letter.photo,
    sealStatus: letter.openedAt ? "unsealed" : "unopened",
    viewCount: letter.viewCount || 0,
    attemptCount: letter.attemptCount || 0,
    reactions: letter.reactions || [],
    unlockAt: letter.unlockAt,
    ambientSoundscape: letter.ambientSoundscape,
    senderEmail: letter.senderEmail,
    recipientEmail: letter.recipientEmail,
    scheduledFor: letter.scheduledFor,
    deliveryStatus: letter.deliveryStatus,
    createdAt: letter.createdAt,
    openedAt: letter.openedAt || null,
    lastViewedAt: letter.lastViewedAt || letter.openedAt || null,
    guardianType: letter.guardianType,
    replies: inMemoryReplies,
    events: (() => {
      const raw = letter.events || [
        {
          id: "1",
          type: "letter_created",
          metadata: { title: letter.title },
          createdAt: letter.createdAt,
        },
        ...(letter.openedAt ? [{
          id: "2",
          type: "letter_unsealed",
          metadata: {},
          createdAt: letter.openedAt,
        }] : []),
      ];
      const seen = new Set<string>();
      return raw.filter(e => {
        if (['letter_created', 'letter_link_opened', 'letter_unsealed'].includes(e.type)) {
          if (seen.has(e.type)) return false;
          seen.add(e.type);
        }
        return true;
      });
    })(),
  });
}

// ── DELETE: Self-Destruct / Burn Letter to Ashes ──────────────────────────────
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Management token required" }, { status: 401 });
  }

  // 1. Try Supabase deletion
  try {
    // Validate token first
    const { data: letter, error: fetchErr } = await supabase
      .from("ow_letters")
      .select("id, management_token")
      .eq("id", id)
      .single();

    if (!fetchErr && letter) {
      if (letter.management_token !== token) {
        return NextResponse.json({ error: "Invalid management token" }, { status: 403 });
      }

      // Delete events first
      await supabase
        .from("ow_letter_events")
        .delete()
        .eq("letter_id", id);

      // Delete replies that belonged to this letter
      await supabase
        .from("ow_letters")
        .delete()
        .eq("reply_to_id", id);

      // Delete the letter itself
      const { error: deleteErr } = await supabase
        .from("ow_letters")
        .delete()
        .eq("id", id);

      if (deleteErr) {
        console.error("Supabase letter delete error:", deleteErr);
      }
    }
  } catch (e) {
    console.error("Supabase burn letter error:", e);
  }

  // 2. In-Memory fallback deletion
  const memLetter = letterStore.get(id);
  if (memLetter) {
    if (memLetter.token === token) {
      letterStore.delete(id);
      // Clean up in-memory replies
      for (const [rId, rLet] of letterStore.entries()) {
        if (rLet.replyToId === id) {
          letterStore.delete(rId);
        }
      }
    } else if (!token) {
      return NextResponse.json({ error: "Invalid management token" }, { status: 403 });
    }
  }

  return NextResponse.json({
    success: true,
    message: "Letter burned and permanently destroyed.",
  });
}

