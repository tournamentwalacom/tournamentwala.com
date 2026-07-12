const sports = [
  "Cricket",
  "Badminton",
  "Football",
  "Kabaddi",
  "Table Tennis",
  "Chess",
  "Volleyball",
  "BGMI",
  "Carrom",
  "Pickleball",
];

export default function SportsMarquee() {
  const track = [...sports, ...sports];
  return (
    <div className="sports-strip" aria-hidden="true">
      <div className="sports-track">
        {track.map((s, i) => (
          <span key={i} className={i % 2 ? "ghost" : ""}>
            {s} <span className="sep"> ◆ </span>
          </span>
        ))}
      </div>
    </div>
  );
}
