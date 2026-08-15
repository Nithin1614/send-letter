import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { letterStore } from "@/lib/store";
import { sendEmail, getReactionAlertTemplate } from "@/lib/email";

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

    let senderEmail: string | undefined;
    let letterTitle: string = "";
    let manageToken: string = "";
    let currentReactions: string[] = [];

    // Check memory store
    const memLetter = letterStore.get(id);
    if (memLetter) {
      senderEmail = memLetter.senderEmail;
      letterTitle = memLetter.title || "";
      manageToken = memLetter.token || "";
      const currentMem = memLetter.reactions || [];
      const filteredMem = currentMem.filter(r => r !== reaction);
      memLetter.reactions = [...filteredMem, reaction];
      if (!memLetter.events) memLetter.events = [];
      memLetter.events.push({
        id: String(memLetter.events.length + 1),
        type: "reaction_added",
        metadata: { reaction },
        createdAt: new Date().toISOString(),
      });
      letterStore.set(id, memLetter);
      currentReactions = memLetter.reactions;
    }

    // Fetch from Supabase
    try {
      const { data: letter } = await supabase
        .from("ow_letters")
        .select("reactions, sender_email, title, management_token")
        .eq("id", id)
        .single();

      if (letter) {
        currentReactions = Array.isArray(letter.reactions) ? letter.reactions : [];
        senderEmail = letter.sender_email || senderEmail;
        letterTitle = letter.title || letterTitle;
        manageToken = letter.management_token || manageToken;

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
        currentReactions = newReactions;
      }
    } catch (dbErr) {
      console.warn("Supabase react error:", dbErr);
    }

    // Dispatch reaction notification if sender provided email
    if (senderEmail) {
      const base = req.nextUrl.origin;
      const manageUrl = `${base}/manage/${id}?token=${manageToken}`;
      sendEmail({
        to: senderEmail,
        subject: `💌 New reaction on your letter: ${reaction}`,
        html: getReactionAlertTemplate(letterTitle, reaction, manageUrl),
      }).catch(err => console.error("Failed to send reaction email alert:", err));
    }

    return NextResponse.json({ ok: true, reactions: currentReactions });
  } catch (e) {
    console.error("React error:", e);
    return NextResponse.json({ error: "Failed to record reaction" }, { status: 500 });
  }
}
