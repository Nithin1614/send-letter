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
        viewCount: letter.view_count,
        attemptCount: letter.attempt_count,
        reactions: letter.reactions || [],
        createdAt: letter.created_at,
        openedAt: letter.opened_at,
        lastViewedAt: letter.last_viewed_at,
        guardianType: letter.guardian_type,
        events: (events || []).map(e => ({
          id: e.id,
          type: e.event_type,
          metadata: e.metadata,
          createdAt: e.created_at,
        })),
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
    viewCount: 0,
    attemptCount: 0,
    reactions: [],
    createdAt: letter.createdAt,
    openedAt: letter.openedAt || null,
    lastViewedAt: letter.openedAt || null,
    guardianType: letter.guardianType,
    events: [
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
    ],
  });
}
