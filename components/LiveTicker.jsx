import { getAnnouncedTournaments, formatDaysLeft } from "@/lib/tournaments";

function buildItem(tournament) {
  const slotsBit =
    tournament.slots_left !== null && tournament.slots_left !== undefined
      ? ` · ${tournament.slots_left} slots left`
      : "";
  return `${tournament.sport.toUpperCase()} · ${tournament.name} — ${formatDaysLeft(
    tournament
  )}${slotsBit}`;
}

export default async function LiveTicker() {
  const announced = await getAnnouncedTournaments();
  if (announced.length === 0) return null;

  const items = announced.map(buildItem);
  const track = [...items, ...items]; // duplicated for seamless loop

  return (
    <div className="ticker" role="marquee" aria-label="Live tournament updates">
      <div className="ticker-track">
        {track.map((t, i) => (
          <span key={i}>
            <span className="dot" aria-hidden="true">
              ●{" "}
            </span>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
