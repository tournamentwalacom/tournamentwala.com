import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TournamentPoster from "@/components/TournamentPoster";
import {
  getTournamentBySeq,
  getSeqFromSlug,
  formatDateRange,
  formatEntryFee,
  formatPrize,
  formatAdvance,
  formatFirstPrize,
  formatSecondPrize,
  formatStartTime,
  getRulesList,
  getTournamentDescription,
  getRegisterPhoneHref,
  getSportIcon,
  PLACEHOLDER_TOURNAMENT_IMAGE,
} from "@/lib/tournaments";

async function loadTournament(slug) {
  const seq = getSeqFromSlug(slug);
  if (seq === null) return null;
  return getTournamentBySeq(seq);
}

export async function generateMetadata({ params }) {
  const tournament = await loadTournament(params.slug);
  if (!tournament) {
    return { title: "Tournament not found — TournamentWala.com" };
  }
  return {
    title: `${tournament.name} — TournamentWala.com`,
    description: getTournamentDescription(tournament).slice(0, 160),
  };
}

export default async function TournamentDetailPage({ params }) {
  const tournament = await loadTournament(params.slug);
  if (!tournament) notFound();

  const dateRange = formatDateRange(tournament);
  const entryFee = formatEntryFee(tournament);
  const prize = formatPrize(tournament);
  const advance = formatAdvance(tournament);
  const firstPrize = formatFirstPrize(tournament);
  const secondPrize = formatSecondPrize(tournament);
  const startTime = formatStartTime(tournament);
  const rules = getRulesList(tournament);
  const description = getTournamentDescription(tournament);
  const registerHref = getRegisterPhoneHref(tournament);
  const icon = getSportIcon(tournament.sport);
  const portraitSrc = tournament.image_url || PLACEHOLDER_TOURNAMENT_IMAGE;

  return (
    <>
      <Navbar />
      <main className="tdp">
        <section className="tdp-hero tdp-hero--generated">
          <span className="tdp-hero-icon" aria-hidden="true">
            {icon}
          </span>
          <div className="tdp-hero-scrim" aria-hidden="true" />

          <div className="container tdp-hero-inner">
            <a href="/explore-tournaments" className="tdp-back">
              ← Back to tournaments
            </a>

            <div className="tdp-hero-chips">
              <span className="chip">{tournament.sport}</span>
              {tournament.tag && (
                <span className={`chip ${tournament.hot ? "chip-hot" : ""}`}>
                  {tournament.tag}
                </span>
              )}
            </div>

            <h1 className="tdp-title">{tournament.name}</h1>

            <div className="tdp-hero-facts">
              <span>
                📍 <b>{tournament.venue}, {tournament.city}</b>
              </span>
              <span>
                🗓️ <b>{dateRange}</b>
              </span>
              {tournament.format && (
                <span>
                  ⚙️ <b>{tournament.format}</b>
                </span>
              )}
            </div>
          </div>
        </section>

        <section className="container tdp-body">
          <div className="tdp-grid">
            <div className="tdp-main">
              <h2 className="tdp-section-title">About this tournament</h2>
              <p className="tdp-description">{description}</p>

              <h2 className="tdp-section-title">Tournament details</h2>
              <div className="tdp-facts-grid">
                <div className="tdp-fact">
                  <small>Sport</small>
                  <span>{icon} {tournament.sport}</span>
                </div>
                <div className="tdp-fact">
                  <small>Format</small>
                  <span>{tournament.format || "To be announced"}</span>
                </div>
                <div className="tdp-fact">
                  <small>Date</small>
                  <span>{dateRange}</span>
                </div>
                {startTime && (
                  <div className="tdp-fact">
                    <small>Time</small>
                    <span>{startTime}</span>
                  </div>
                )}
                <div className="tdp-fact">
                  <small>Venue</small>
                  <span>{tournament.venue}</span>
                </div>
                <div className="tdp-fact">
                  <small>City</small>
                  <span>{tournament.city}</span>
                </div>
                <div className="tdp-fact">
                  <small>Entry fee</small>
                  <span>{entryFee}</span>
                </div>
                {advance && (
                  <div className="tdp-fact">
                    <small>Advance</small>
                    <span>{advance}</span>
                  </div>
                )}
                {firstPrize && (
                  <div className="tdp-fact">
                    <small>1st prize</small>
                    <span>{firstPrize}</span>
                  </div>
                )}
                {secondPrize && (
                  <div className="tdp-fact">
                    <small>2nd prize</small>
                    <span>{secondPrize}</span>
                  </div>
                )}
              </div>

              {rules.length > 0 && (
                <>
                  <h2 className="tdp-section-title">Rules</h2>
                  <ul className="tdp-rules-list">
                    {rules.map((rule, i) => (
                      <li key={i}>{rule}</li>
                    ))}
                  </ul>
                </>
              )}

              {tournament.trophy_details && (
                <>
                  <h2 className="tdp-section-title">Trophy &amp; prizes</h2>
                  <p className="tdp-prose">{tournament.trophy_details}</p>
                </>
              )}

              {tournament.other_contact && (
                <>
                  <h2 className="tdp-section-title">Other contact details</h2>
                  <p className="tdp-prose">{tournament.other_contact}</p>
                </>
              )}

              {tournament.organizer_name && (
                <>
                  <h2 className="tdp-section-title">Organized by</h2>
                  <p className="tdp-organizer">{tournament.organizer_name}</p>
                </>
              )}
            </div>

            <div className="tdp-media">
              <TournamentPoster src={portraitSrc} alt={tournament.name} />
            </div>
          </div>

          <div className="tdp-banner">
            <div className="tdp-banner-prize">
              <small>Prize pool</small>
              <span className="amt">{prize}</span>
            </div>

            <div className="tdp-banner-facts">
              <div className="tdp-banner-fact">
                <small>Entry fee</small>
                <b>{entryFee}</b>
              </div>
              <div className="tdp-banner-fact">
                <small>Dates</small>
                <b>{dateRange}</b>
              </div>
              <div className="tdp-banner-fact">
                <small>Venue</small>
                <b>{tournament.venue}, {tournament.city}</b>
              </div>
            </div>

            <div className="tdp-banner-register">
              <a href={registerHref} className="btn btn-primary tdp-register">
                📞 Register — Call to book your spot
              </a>
              <p className="tdp-register-note">
                Tapping Register calls the organizer directly to confirm
                your slot.
              </p>
            </div>
          </div>
        </section>

        <div className="tdp-sticky-bar">
          <div className="tdp-sticky-info">
            <small>Prize pool</small>
            <span className="amt">{prize}</span>
          </div>
          <a href={registerHref} className="btn btn-primary tdp-register">
            Register
          </a>
        </div>
      </main>
      <Footer />
    </>
  );
}
