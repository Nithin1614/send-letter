import { NextRequest, NextResponse } from "next/server";
import { letterStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // ── Try Supabase first ─────────────────────────────────────────────────────
  try {
    const { data: letter, error } = await supabase
      .from("ow_letters")
      .select("*")
      .eq("id", id)
      .single();

    if (!error && letter) {
      const now = new Date().toISOString();

      // Increment view count and update last_viewed_at
      await supabase
        .from("ow_letters")
        .update({
          view_count: letter.view_count + 1,
          last_viewed_at: now,
          // Mark opened_at on first view
          ...(letter.opened_at ? {} : { opened_at: now }),
        })
        .eq("id", id);

      // Log the letter_link_opened event
      await supabase.from("ow_letter_events").insert({
        letter_id: id,
        event_type: "letter_link_opened",
        metadata: {},
      });

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
        createdAt: letter.created_at,
        openedAt: letter.opened_at,
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

  // Mark as opened (only first time) in memory fallback
  if (!letter.openedAt) {
    letter.openedAt = new Date().toISOString();
    letterStore.set(id, letter);
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
    createdAt: letter.createdAt,
    openedAt: letter.openedAt,
    hasGuardian: letter.guardianType !== "none",
  });
}
