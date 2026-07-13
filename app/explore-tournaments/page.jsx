import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ExploreTournaments from "@/components/ExploreTournaments";
import {
  getLiveTournaments,
  formatDateRange,
  formatEntryFee,
  formatPrize,
  FALLBACK_TOURNAMENTS,
} from "@/lib/tournaments";

export const metadata = {
  title: "Explore tournaments — TournamentWala.com",
  description:
    "Search and filter live tournaments across cricket, football, badminton, volleyball, basketball and more — by sport, venue, city or organizer.",
};

export default async function ExploreTournamentsPage() {
  const liveTournaments = await getLiveTournaments();
  const tournaments = liveTournaments.length
    ? liveTournaments
    : FALLBACK_TOURNAMENTS;

  const tickets = tournaments.map((t) => ({
    id: t.id,
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
  }));

  const sportCounts = new Map();
  for (const ticket of tickets) {
    if (!ticket.sport) continue;
    sportCounts.set(ticket.sport, (sportCounts.get(ticket.sport) || 0) + 1);
  }
  const sportFacets = [...sportCounts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  return (
    <>
      <Navbar />
      <main>
        <ExploreTournaments tickets={tickets} sportFacets={sportFacets} />
      </main>
      <Footer />
    </>
  );
}
