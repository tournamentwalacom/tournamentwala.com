import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import TournamentForm from "@/components/admin/TournamentForm";

export default async function EditTournamentPage({ params }) {
  const { id } = params;
  const { data: tournament } = await supabaseAdmin()
    .from("tournaments")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!tournament) {
    notFound();
  }

  return (
    <div className="admin-form-page">
      <Link href="/admin/tournaments" className="admin-form-back">
        ← Back to tournaments
      </Link>
      <h1 className="admin-page-title">Edit tournament</h1>
      <TournamentForm mode="edit" initial={tournament} />
    </div>
  );
}
