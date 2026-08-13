import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { data, error } = await supabase.from("jars").select("*").eq("id", id).single();
  if (error || !data) return NextResponse.json({ error: "Jar not found" }, { status: 404 });

  const now = new Date();
  const created = new Date(data.created_at);
  const daysSince = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
  const weeksSince = Math.floor(daysSince / 7);

  const notes = (data.notes || []).map((note: any, i: number) => {
    let unlocked = false;
    if (data.unlock_mode === "all") unlocked = true;
    else if (data.unlock_mode === "daily") unlocked = i <= daysSince;
    else if (data.unlock_mode === "weekly") unlocked = i <= weeksSince;

    if (unlocked) return note;
    // sealed note - hide content
    return { id: note.id, content: null, opened: false, sealed: true, order: note.order ?? i };
  });

  return NextResponse.json({ ...data, notes });
}
