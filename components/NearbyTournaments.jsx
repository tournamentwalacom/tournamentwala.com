import {
  getLiveTournaments,
  formatDateRange,
  formatEntryFee,
  formatPrize,
  getTournamentSlug,
} from "@/lib/tournaments";
import NearbyTournamentsSlider from "@/components/NearbyTournamentsSlider";

export default async function NearbyTournaments() {
  const tournaments = await getLiveTournaments({});

  const tickets = tournaments.map((t) => ({
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
    latitude: t.latitude,
    longitude: t.longitude,
  }));

  return <NearbyTournamentsSlider tickets={tickets} />;
}
