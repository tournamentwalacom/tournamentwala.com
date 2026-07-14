import {
  getLiveTournaments,
  formatDateRange,
  formatEntryFee,
  formatPrize,
  getTournamentSlug,
} from "@/lib/tournaments";
import TicketSlider from "@/components/TicketSlider";

export default async function Tournaments({
  sport,
  city,
  eyebrow = "Cricket Tournaments",
  title = "Grab your Spot.",
  sectionId = "tournaments",
  showActiveFilter = true,
  theme = "gray",
}) {
  const tournaments = await getLiveTournaments({ sport, city });
  const filterLabel = [sport, city].filter(Boolean).join(" · ");
  const browseAllHref = sport
    ? `/explore-tournaments?sport=${encodeURIComponent(sport)}`
    : "/explore-tournaments";

  const tickets = tournaments.slice(0, 5).map((t) => ({
    id: t.id,
    slug: getTournamentSlug(t),
    sport: t.sport,
    tag: t.tag,
    hot: t.hot,
    name: t.name,
    venue: t.venue,
    city: t.city,
    format: t.format,
    dateRange: formatDateRange(t),
    entryFee: formatEntryFee(t),
    prize: formatPrize(t),
  }));

  return (
    <section
      className={`section tournaments-section tournaments-section--${theme}`}
      id={sectionId}
    >
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">{eyebrow}</span>
          <div className="section-title-row">
            <h2 className="section-title">{title}</h2>
            <a href={browseAllHref} className="btn btn-ghost browse-all">
              Browse all
            </a>
          </div>
          {showActiveFilter && filterLabel && (
            <p className="active-filter">
              Showing <b>{filterLabel}</b> ·{" "}
              <a href="/#tournaments">Clear filter ×</a>
            </p>
          )}
        </div>

        {tickets.length === 0 ? (
          <div className="tickets-empty">
            {filterLabel
              ? `No live tournaments for ${filterLabel} yet — check back soon.`
              : "No live tournaments yet — check back soon."}
          </div>
        ) : (
          <TicketSlider tickets={tickets} browseAllHref={browseAllHref} />
        )}
      </div>
    </section>
  );
}
