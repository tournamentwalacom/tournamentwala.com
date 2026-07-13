import {
  getLiveTournaments,
  formatDateRange,
  formatEntryFee,
  formatPrize,
} from "@/lib/tournaments";

export default async function Tournaments({ sport, city }) {
  const tournaments = await getLiveTournaments({ sport, city });
  const filterLabel = [sport, city].filter(Boolean).join(" · ");

  return (
    <section className="section container" id="tournaments">
      <div className="section-head">
        <div>
          <span className="eyebrow">This weekend &amp; beyond</span>
          <h2 className="section-title">
            Grab your ticket.
            <br />
            The bracket won&rsquo;t wait.
          </h2>
          {filterLabel && (
            <p className="active-filter">
              Showing <b>{filterLabel}</b> ·{" "}
              <a href="/#tournaments">Clear filter ×</a>
            </p>
          )}
        </div>
        <a href="#" className="btn btn-ghost">
          Browse all 2,300+ →
        </a>
      </div>

      {tournaments.length === 0 ? (
        <div className="tickets-empty">
          {filterLabel
            ? `No live tournaments for ${filterLabel} yet — check back soon.`
            : "No live tournaments yet — check back soon."}
        </div>
      ) : (
        <div className="tickets">
          {tournaments.map((t) => (
            <article className="ticket" key={t.id}>
              <div className="ticket-top">
                <div className="ticket-sport">
                  <span className="chip">{t.sport}</span>
                  {t.tag && (
                    <span className={`chip ${t.hot ? "chip-hot" : ""}`}>
                      {t.tag}
                    </span>
                  )}
                </div>
                <h3>{t.name}</h3>
                <div className="ticket-facts">
                  <span>
                    📍 <b>{t.venue}, {t.city}</b>
                  </span>
                  <span>
                    🗓️ <b>{formatDateRange(t)}</b>
                  </span>
                  <span>
                    ⚙️ {t.format ? `${t.format} · ` : ""}Entry{" "}
                    <b>{formatEntryFee(t)}</b>
                  </span>
                </div>
              </div>

              <div className="ticket-tear" aria-hidden="true" />

              <div className="ticket-stub">
                <div className="prize">
                  <small>Prize pool</small>
                  <span className="amt">{formatPrize(t)}</span>
                </div>
                <span className="barcode" aria-hidden="true" />
                <button className="btn btn-stub">Register</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
