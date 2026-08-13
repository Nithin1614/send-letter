import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const { reaction } = await req.json();

    if (!reaction || typeof reaction !== "string") {
      return NextResponse.json({ error: "Invalid reaction" }, { status: 400 });
    }

    // Fetch current reactions
    const { data: letter, error } = await supabase
      .from("ow_letters")
      .select("reactions")
      .eq("id", id)
      .single();

    if (error || !letter) {
      return NextResponse.json({ error: "Letter not found" }, { status: 404 });
    }

    const currentReactions: string[] = Array.isArray(letter.reactions) ? letter.reactions : [];

    // Replace reaction (one reaction per letter — replace if exists)
    const filtered = currentReactions.filter(r => r !== reaction);
    const newReactions = [...filtered, reaction];

    await Promise.all([
      supabase
        .from("ow_letters")
        .update({ reactions: newReactions })
        .eq("id", id),
      supabase.from("ow_letter_events").insert({
        letter_id: id,
        event_type: "reaction_added",
        metadata: { reaction },
      }),
    ]);

    return NextResponse.json({ ok: true, reactions: newReactions });
  } catch (e) {
    console.error("React error:", e);
    return NextResponse.json({ error: "Failed to record reaction" }, { status: 500 });
  }
}
