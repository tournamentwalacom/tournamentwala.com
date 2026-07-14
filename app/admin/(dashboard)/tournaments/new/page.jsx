import Link from "next/link";
import TournamentForm from "@/components/admin/TournamentForm";

export default function NewTournamentPage() {
  return (
    <div className="admin-form-page">
      <Link href="/admin/tournaments" className="admin-form-back">
        ← Back to tournaments
      </Link>
      <h1 className="admin-page-title">Add tournament</h1>
      <TournamentForm mode="create" />
    </div>
  );
}
