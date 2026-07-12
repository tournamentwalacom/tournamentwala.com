const items = [
  "CRICKET · Indiranagar Titans 142/4 vs HSR Strikers — 16.2 ov",
  "BADMINTON · Bengaluru Smash Open — Semifinals underway",
  "FOOTBALL · Pune Monsoon Cup — Final: Deccan FC 2 : 1 Shivaji XI",
  "KABADDI · Delhi Dangal League — Raid points record: 19",
  "BGMI · Hyderabad LAN Qualifiers — 64 squads, 8 slots left",
  "CHESS · Mumbai Rapid Sunday — Round 5 pairings out",
];

export default function LiveTicker() {
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
