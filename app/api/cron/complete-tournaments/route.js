import { NextResponse } from "next/server";
import { completeExpiredTournaments } from "@/lib/completeTournaments";

// Hit daily by the Vercel Cron Job defined in vercel.json. Vercel
// automatically attaches "Authorization: Bearer $CRON_SECRET" to the
// request when a CRON_SECRET env var is set on the project, which is what
// we check here — so this stays unauthenticated only if that env var is
// never configured.
export async function GET(request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const result = await completeExpiredTournaments();
  return NextResponse.json(result);
}
