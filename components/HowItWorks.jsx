const steps = [
  {
    title: "Find",
    icon: "🔍",
    text: "Filter by sport, city, date, entry fee and skill level. Every listing shows the venue, format and rules up front — no calling five numbers to confirm details.",
  },
  {
    title: "Play",
    icon: "🎽",
    text: "Register solo or as a team, pay the entry fee online, and get your fixture, reporting time and bracket position on WhatsApp and in the app.",
  },
  {
    title: "Win",
    icon: "🏆",
    text: "Live scores update the bracket as you climb. Prize money is held in escrow and released to winners within 48 hours of the final whistle.",
  },
];

export default function HowItWorks() {
  return (
    <section className="section how" id="how">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="eyebrow">How it works</span>
            <h2 className="section-title">
              Three steps.
              <br />
              Same as our tagline.
            </h2>
          </div>
        </div>

        <div className="steps">
          {steps.map((s) => (
            <article className="step" key={s.title}>
              <span className="step-icon" aria-hidden="true">
                {s.icon}
              </span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
