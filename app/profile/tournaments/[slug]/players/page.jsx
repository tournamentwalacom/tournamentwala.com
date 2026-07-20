import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthForm from "@/components/AuthForm";
import { getCurrentUser, createServerSupabaseClient } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabase";
import { getSeqFromSlug } from "@/lib/tournaments";

export const metadata = {
  title: "Registered players — TournamentWala.com",
};

function formatRegisteredOn(iso) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function TournamentPlayersPage({ params }) {
  const session = await getCurrentUser();
  const backHref = `/profile/tournaments/${params.slug}/players`;
  const seq = getSeqFromSlug(params.slug);

  if (!session) {
    return (
      <>
        <Navbar />
        <main>
          <section className="section container post-section profile-section">
            <span className="eyebrow">Your account</span>
            <h1 className="section-title">Sign in to view registered players</h1>
            <AuthForm next={backHref} />
          </section>
        </main>
        <Footer />
      </>
    );
  }

  const supabase = createServerSupabaseClient();
  const { data: tournament } =
    seq === null
      ? { data: null }
      : await supabase
          .from("tournaments")
          .select("id, name, sport, city")
          .eq("seq", seq)
          .eq("organizer_user_id", session.user.id)
          .maybeSingle();

  if (!tournament) {
    return (
      <>
        <Navbar />
        <main>
          <section className="section container post-section profile-section">
            <span className="eyebrow">Your account</span>
            <h1 className="section-title">Tournament not found</h1>
            <p className="post-intro">
              This tournament doesn&rsquo;t exist or doesn&rsquo;t belong to your account.
            </p>
            <Link href="/profile">Back to your profile</Link>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  const { data: registrations } = await supabaseAdmin()
    .from("registrations")
    .select("id, player_name, player_phone, city, created_at")
    .eq("tournament_id", tournament.id)
    .order("created_at", { ascending: false });

  return (
    <>
      <Navbar />
      <main>
        <section className="section container post-section profile-section">
          <Link href="/profile" className="players-back-link">
            &larr; Back to your profile
          </Link>
          <span className="eyebrow">Registered players</span>
          <h1 className="section-title">{tournament.name}</h1>

          {!registrations?.length ? (
            <div className="profile-empty">No players have registered yet.</div>
          ) : (
            <ul className="players-list">
              {registrations.map((p) => (
                <li key={p.id} className="players-list-card">
                  <div className="players-list-info">
                    <h3>{p.player_name}</h3>
                    <p className="profile-tournament-meta">
                      {p.city} · Registered {formatRegisteredOn(p.created_at)}
                    </p>
                  </div>
                  <a href={`tel:${p.player_phone}`} className="players-call-btn">
                    Call {p.player_phone}
                  </a>
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
