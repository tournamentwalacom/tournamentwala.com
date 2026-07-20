import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthForm from "@/components/AuthForm";
import CompleteProfileForm from "@/components/CompleteProfileForm";
import ProfileTournamentPlayers from "@/components/ProfileTournamentPlayers";
import { getCurrentUser, createServerSupabaseClient } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabase";
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

function formatRegisteredOn(iso) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function ProfilePage() {
  const session = await getCurrentUser();

  if (!session) {
    return (
      <>
        <Navbar />
        <main>
          <section className="section container post-section profile-section">
            <span className="eyebrow">Your account</span>
            <h1 className="section-title">Sign in to view your profile</h1>
            <AuthForm next="/profile" />
          </section>
        </main>
        <Footer />
      </>
    );
  }

  const supabase = createServerSupabaseClient();
  const [{ data: tournaments }, { data: registrations }] = await Promise.all([
    supabase
      .from("tournaments")
      .select(
        "id, seq, name, organizer_name, sport, city, venue, status, start_date, end_date, date_note, entry_fee_amount, entry_fee_unit, prize_pool, prize_pool_is_trophy, created_at"
      )
      .eq("organizer_user_id", session.user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("registrations")
      .select("id, tournament_name, sport, city, created_at")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false }),
  ]);

  const tournamentIds = (tournaments || []).map((t) => t.id);
  const registrationCounts = {};
  if (tournamentIds.length) {
    const { data: allRegistrations } = await supabaseAdmin()
      .from("registrations")
      .select("tournament_id")
      .in("tournament_id", tournamentIds);
    for (const r of allRegistrations || []) {
      registrationCounts[r.tournament_id] = (registrationCounts[r.tournament_id] || 0) + 1;
    }
  }

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
            Tournaments you&rsquo;ve registered for
          </h2>

          {!registrations?.length ? (
            <div className="profile-empty">
              You haven&rsquo;t registered for a tournament yet.{" "}
              <a href="/explore-tournaments">Explore tournaments</a>.
            </div>
          ) : (
            <ul className="profile-tournament-list">
              {registrations.map((r) => (
                <li key={r.id} className="profile-tournament-card">
                  <div className="profile-tournament-head">
                    <h3>{r.tournament_name}</h3>
                  </div>
                  <p className="profile-tournament-meta">
                    {r.sport} · {r.city} · Registered {formatRegisteredOn(r.created_at)}
                  </p>
                </li>
              ))}
            </ul>
          )}

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
                  <ProfileTournamentPlayers
                    tournamentId={t.id}
                    tournamentName={t.name}
                    count={registrationCounts[t.id] || 0}
                  />
                </li>
              ))}
            </ul>
          )}

          <h2 className="post-form-section profile-section-title">
            Your details
          </h2>
          <CompleteProfileForm
            mode="edit"
            initialName={profile?.full_name || ""}
            initialPhone={profile?.phone || ""}
          />
        </section>
      </main>
      <Footer />
    </>
  );
}
