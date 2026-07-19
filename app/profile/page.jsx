import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getCurrentUser, createServerSupabaseClient } from "@/lib/supabaseServer";
import {
  formatEntryFee,
  formatPrize,
  formatDateRange,
  getTournamentSlug,
} from "@/lib/tournaments";

export const metadata = {
  title: "Your profile — TournamentWala.com",
};

const STATUS_LABELS = {
  pending: "Pending review",
  live: "Live",
  rejected: "Rejected",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default async function ProfilePage() {
  const session = await getCurrentUser();
  if (!session) {
    redirect("/post-tournament");
  }

  const supabase = createServerSupabaseClient();
  const { data: tournaments } = await supabase
    .from("tournaments")
    .select(
      "id, seq, name, organizer_name, sport, city, venue, status, start_date, end_date, date_note, entry_fee_amount, entry_fee_unit, prize_pool, prize_pool_is_trophy, created_at"
    )
    .eq("organizer_user_id", session.user.id)
    .order("created_at", { ascending: false });

  const { profile, user } = session;

  return (
    <>
      <Navbar />
      <main>
        <section className="section container post-section profile-section">
          <span className="eyebrow">Your account</span>
          <h1 className="section-title">
            {profile?.full_name || "Your profile"}
          </h1>
          <p className="post-intro">{profile?.email || user.email}</p>

          <h2 className="post-form-section profile-section-title">
            Tournaments you&rsquo;ve posted
          </h2>

          {!tournaments?.length ? (
            <div className="profile-empty">
              You haven&rsquo;t posted a tournament yet.{" "}
              <a href="/post-tournament">Post one now</a>.
            </div>
          ) : (
            <ul className="profile-tournament-list">
              {tournaments.map((t) => (
                <li key={t.id} className="profile-tournament-card">
                  <div className="profile-tournament-head">
                    <h3>
                      {t.status === "live" ? (
                        <a href={`/explore/${getTournamentSlug(t)}`}>{t.name}</a>
                      ) : (
                        t.name
                      )}
                    </h3>
                    <span className={`profile-status profile-status-${t.status}`}>
                      {STATUS_LABELS[t.status] || t.status}
                    </span>
                  </div>
                  <p className="profile-tournament-meta">
                    {t.sport} · {t.city} · {formatDateRange(t)}
                  </p>
                  <p className="profile-tournament-meta">
                    Entry {formatEntryFee(t)} · Prize {formatPrize(t)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
