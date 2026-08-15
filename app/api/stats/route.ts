import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { letterStore } from "@/lib/store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    let dbTotal = 0;
    let dbUnsealed = 0;

    try {
      const [{ count: totalCount, error: err1 }, { count: unsealedCount, error: err2 }] = await Promise.all([
        supabase.from("ow_letters").select("*", { count: "exact", head: true }),
        supabase.from("ow_letters").select("*", { count: "exact", head: true }).eq("seal_status", "unsealed"),
      ]);

      if (!err1 && typeof totalCount === "number") {
        dbTotal = totalCount;
      }
      if (!err2 && typeof unsealedCount === "number") {
        dbUnsealed = unsealedCount;
      }
    } catch (dbErr) {
      console.warn("Stats Supabase query note:", dbErr);
    }

    // Also factor in in-memory letters if they exceed DB count (e.g. offline dev mode)
    const memTotal = letterStore.size;
    let memUnsealed = 0;
    for (const letter of letterStore.values()) {
      if (letter.openedAt) memUnsealed++;
    }

    const totalDelivered = Math.max(dbTotal, memTotal);
    const totalUnsealed = Math.max(dbUnsealed, memUnsealed);

    return NextResponse.json(
      {
        totalDelivered,
        totalUnsealed,
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("Stats API error:", error);
    return NextResponse.json({ totalDelivered: 0, totalUnsealed: 0 }, { status: 500 });
  }
}
