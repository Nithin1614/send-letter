import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const now = new Date().toISOString();

    await Promise.all([
      supabase
        .from("ow_letters")
        .update({ seal_status: "unsealed", opened_at: now })
        .eq("id", id),
      supabase.from("ow_letter_events").insert({
        letter_id: id,
        event_type: "letter_unsealed",
        metadata: { method: "wax_seal_hold" },
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Unseal error:", e);
    return NextResponse.json({ error: "Failed to record unseal" }, { status: 500 });
  }
}
