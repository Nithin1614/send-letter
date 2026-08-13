import { NextRequest, NextResponse } from "next/server";
import { letterStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { answer } = await req.json();

  // ── Try Supabase first ─────────────────────────────────────────────────────
  try {
    const { data: letter, error } = await supabase
      .from("ow_letters")
      .select("answer, attempt_count")
      .eq("id", id)
      .single();

    if (!error && letter) {
      const normalizedInput = (answer ?? "").trim().toLowerCase();
      const correct = normalizedInput === (letter.answer ?? "").trim().toLowerCase();

      if (correct) {
        // Log unlock success + update seal status
        await Promise.all([
          supabase.from("ow_letters").update({ seal_status: "unsealed", opened_at: new Date().toISOString() }).eq("id", id),
          supabase.from("ow_letter_events").insert({ letter_id: id, event_type: "letter_unsealed", metadata: { method: "question" } }),
        ]);
      } else {
        // Log failed attempt + increment counter
        await Promise.all([
          supabase.from("ow_letters").update({ attempt_count: letter.attempt_count + 1 }).eq("id", id),
          supabase.from("ow_letter_events").insert({ letter_id: id, event_type: "unlock_failed", metadata: { attempt: letter.attempt_count + 1 } }),
        ]);
      }

      return NextResponse.json({ correct });
    }
  } catch (e) {
    console.error("Supabase verify error:", e);
  }

  // ── Fallback: in-memory store ──────────────────────────────────────────────
  const letter = letterStore.get(id);
  if (!letter) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const correct = (answer ?? "").trim().toLowerCase() === (letter.answer ?? "").trim().toLowerCase();
  return NextResponse.json({ correct });
}
