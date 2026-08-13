import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const id = uuidv4();

    const notes = (body.notes || []).map((n: any, i: number) => ({
      id: uuidv4(),
      content: n.content || "",
      unlocked_at: null,
      opened: false,
      order: i,
    }));

    const { error } = await supabase.from("jars").insert({
      id,
      title: body.title || "A Jar of Notes",
      notes,
      unlock_mode: body.unlock_mode || "daily",
    });

    if (error) throw error;
    return NextResponse.json({ id, shareUrl: `/jar/${id}` }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
