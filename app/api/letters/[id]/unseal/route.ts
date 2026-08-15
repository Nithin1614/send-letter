import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { letterStore } from "@/lib/store";
import { sendEmail, getUnsealedAlertTemplate } from "@/lib/email";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const now = new Date().toISOString();

    // 1. Update in-memory store
    const memLetter = letterStore.get(id);
    const isFirstMemUnseal = memLetter && !memLetter.openedAt;
    if (memLetter && isFirstMemUnseal) {
      memLetter.openedAt = now;
      if (!memLetter.events) memLetter.events = [];
      memLetter.events.push({
        id: String(memLetter.events.length + 1),
        type: "letter_unsealed",
        metadata: { method: "envelope_unseal" },
        createdAt: now,
      });
      letterStore.set(id, memLetter);
    }

    // 2. Fetch sender email & management token from Supabase or memory
    let senderEmail = memLetter?.senderEmail;
    let letterTitle = memLetter?.title || "";
    let manageToken = memLetter?.token || "";
    let shouldSendAlert = Boolean(isFirstMemUnseal);

    try {
      const { data: dbLetter } = await supabase
        .from("ow_letters")
        .select("sender_email, title, management_token, seal_status, opened_at")
        .eq("id", id)
        .single();

      if (dbLetter) {
        senderEmail = dbLetter.sender_email || senderEmail;
        letterTitle = dbLetter.title || letterTitle;
        manageToken = dbLetter.management_token || manageToken;
        const isDbFirstUnseal = !dbLetter.opened_at || dbLetter.seal_status !== "unsealed";
        shouldSendAlert = isDbFirstUnseal;

        if (isDbFirstUnseal) {
          await Promise.all([
            supabase
              .from("ow_letters")
              .update({ seal_status: "unsealed", opened_at: now })
              .eq("id", id),
            supabase.from("ow_letter_events").insert({
              letter_id: id,
              event_type: "letter_unsealed",
              metadata: { method: "envelope_unseal" },
            }),
          ]);
        }
      }
    } catch (dbErr) {
      console.warn("Supabase unseal update error:", dbErr);
    }

    // 3. Dispatch sender notification only on first unseal if email is configured
    if (senderEmail && shouldSendAlert) {
      const base = req.nextUrl.origin;
      const manageUrl = `${base}/manage/${id}?token=${manageToken}`;
      sendEmail({
        to: senderEmail,
        subject: `💌 Your letter "${letterTitle || 'Open When'}" was just opened!`,
        html: getUnsealedAlertTemplate(letterTitle, manageUrl),
      }).catch(err => console.error("Failed to send unseal email alert:", err));
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Unseal error:", e);
    return NextResponse.json({ error: "Failed to record unseal" }, { status: 500 });
  }
}
