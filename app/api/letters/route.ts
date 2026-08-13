import { NextRequest, NextResponse } from "next/server";
import { letterStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";

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
    } = body;

    // Generate short recipient ID (6 chars, alphanumeric)
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    const id = Array.from(crypto.getRandomValues(new Uint8Array(6)))
      .map(b => chars[b % chars.length]).join("");

    // Generate cryptographically secure management token (32-char hex)
    const token = crypto.randomUUID().replace(/-/g, "");

    const letterData = {
      id,
      management_token: token,
      title,
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
      seal_status: "unopened",
      view_count: 0,
      attempt_count: 0,
      reactions: [],
      created_at: new Date().toISOString(),
      opened_at: null,
      last_viewed_at: null,
    };

    // ── Persist to Supabase ──────────────────────────────────────────────────
    let supabaseError = null;
    try {
      const { error: insertError } = await supabase
        .from("ow_letters")
        .insert(letterData);
      if (insertError) {
        supabaseError = insertError;
        console.error("Supabase insert error:", insertError);
      } else {
        // Log the letter_created event
        await supabase.from("ow_letter_events").insert({
          letter_id: id,
          event_type: "letter_created",
          metadata: { title },
        });
      }
    } catch (e) {
      supabaseError = e;
      console.error("Supabase save failed:", e);
    }

    // ── In-memory store fallback (dev / if Supabase is unreachable) ──────────
    const inMemoryLetter = {
      id,
      token,
      title,
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
      createdAt: new Date().toISOString(),
      openedAt: undefined,
    };
    letterStore.set(id, inMemoryLetter);

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
