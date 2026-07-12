const tournaments = [
  {
    sport: "Cricket",
    tag: "Filling fast",
    hot: true,
    name: "Bengaluru Corporate T20 Bash",
    venue: "Just Cricket Academy, Hennur",
    date: "Sat–Sun · 25–26 Jul",
    format: "16 teams · Tennis ball · T20",
    entry: "₹4,999 / team",
    prize: "₹1,00,000",
  },
  {
    sport: "Badminton",
    tag: "Doubles",
    hot: false,
    name: "Smash Open — Monsoon Edition",
    venue: "Prakash Padukone Academy, BLR",
    date: "Sun · 2 Aug",
    format: "Knockout · BWF scoring",
    entry: "₹799 / pair",
    prize: "₹50,000",
  },
  {
    sport: "Football",
    tag: "5-a-side",
    hot: true,
    name: "Midnight Turf League",
    venue: "Tiento Sports, Sarjapur",
    date: "Fri nights · Aug",
    format: "League + playoffs · 12 teams",
    entry: "₹3,500 / team",
    prize: "₹75,000",
  },
  {
    sport: "Kabaddi",
    tag: "Open",
    hot: false,
    name: "Karnataka Gramin Kabaddi Cup",
    venue: "Sree Kanteerava Outdoor",
    date: "15 Aug",
    format: "Knockout · Mat play",
    entry: "₹2,000 / team",
    prize: "₹1,25,000",
  },
  {
    sport: "BGMI",
    tag: "LAN",
    hot: true,
    name: "Silicon City Esports Clash",
    venue: "Phoenix Mall Arena, Whitefield",
    date: "9 Aug",
    format: "64 squads · Erangel + Miramar",
    entry: "₹1,200 / squad",
    prize: "₹2,00,000",
  },
  {
    sport: "Table Tennis",
    tag: "U-17 + Open",
    hot: false,
    name: "Spin City Championship",
    venue: "Padukone–Dravid CSE",
    date: "Sun · 17 Aug",
    format: "Groups → knockout · Best of 5",
    entry: "₹499 / player",
    prize: "₹30,000",
  },
];

export default function Tournaments() {
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
        </div>
        <a href="#" className="btn btn-ghost">
          Browse all 2,300+ →
        </a>
      </div>

      <div className="tickets">
        {tournaments.map((t) => (
          <article className="ticket" key={t.name}>
            <div className="ticket-top">
              <div className="ticket-sport">
                <span className="chip">{t.sport}</span>
                <span className={`chip ${t.hot ? "chip-hot" : ""}`}>
                  {t.tag}
                </span>
              </div>
              <h3>{t.name}</h3>
              <div className="ticket-facts">
                <span>
                  📍 <b>{t.venue}</b>
                </span>
                <span>
                  🗓️ <b>{t.date}</b>
                </span>
                <span>
                  ⚙️ {t.format} · Entry <b>{t.entry}</b>
                </span>
              </div>
            </div>

            <div className="ticket-tear" aria-hidden="true" />

            <div className="ticket-stub">
              <div className="prize">
                <small>Prize pool</small>
                <span className="amt">{t.prize}</span>
              </div>
              <span className="barcode" aria-hidden="true" />
              <button className="btn btn-stub">Register</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
