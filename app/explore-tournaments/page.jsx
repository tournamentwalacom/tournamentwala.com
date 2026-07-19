import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ExploreTournaments from "@/components/ExploreTournaments";
import {
  getLiveTournaments,
  formatDateRange,
  formatEntryFee,
  formatPrize,
  getTournamentSlug,
} from "@/lib/tournaments";

export const metadata = {
  title: "Explore tournaments — TournamentWala.com",
  description:
    "Search and filter live tournaments across cricket, football, badminton, volleyball, basketball and more — by sport, venue, city or organizer.",
};

export default async function ExploreTournamentsPage({ searchParams }) {
  const params = await searchParams;
  const tournaments = await getLiveTournaments();

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
    organizer: t.organizer_name || "",
    dateRange: formatDateRange(t),
    entryFee: formatEntryFee(t),
    prize: formatPrize(t),
    latitude: t.latitude,
    longitude: t.longitude,
  }));

  const sportCounts = new Map();
  const cityCounts = new Map();
  for (const ticket of tickets) {
    if (ticket.sport) {
      sportCounts.set(ticket.sport, (sportCounts.get(ticket.sport) || 0) + 1);
    }
    if (ticket.city) {
      cityCounts.set(ticket.city, (cityCounts.get(ticket.city) || 0) + 1);
    }
  }
  const sportFacets = [...sportCounts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  const cityFacets = [...cityCounts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  return (
    <>
      <Navbar showTicker={false} />
      <main>
        <ExploreTournaments
          tickets={tickets}
          sportFacets={sportFacets}
          cityFacets={cityFacets}
          initialSport={params?.sport}
          initialCity={params?.city}
        />
      </main>
      <Footer />
    </>
  );
}
