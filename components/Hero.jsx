export default function Hero() {
  return (
    <section className="hero">
      <div className="container hero-grid">
        <div>
          <span className="hero-kicker">
            <span className="pulse-dot" aria-hidden="true" />
            2,300+ tournaments live across 40 Indian cities
          </span>

          <h1 className="hero-title" aria-label="Find. Play. Win.">
            <span className="word">Find.</span>
            <span className="word">Play.</span>
            <span className="word">Win.</span>
          </h1>

          <p className="hero-sub">
            TournamentWala is India&rsquo;s tournament marketplace. Discover
            <strong> cricket, badminton, football, kabaddi and esports </strong>
            events near you, register your team in minutes, and chase real
            prize pools — no phone calls, no paper forms.
          </p>

          <form
            className="finder"
            action="#tournaments"
            aria-label="Find tournaments"
          >
            <select aria-label="Choose a sport" defaultValue="">
              <option value="" disabled>
                Pick a sport
              </option>
              <option>Cricket</option>
              <option>Badminton</option>
              <option>Football</option>
              <option>Kabaddi</option>
              <option>Table Tennis</option>
              <option>Chess</option>
              <option>BGMI / Esports</option>
            </select>
            <span className="divider" aria-hidden="true" />
            <select aria-label="Choose a city" defaultValue="">
              <option value="" disabled>
                Pick a city
              </option>
              <option>Bengaluru</option>
              <option>Mumbai</option>
              <option>Delhi NCR</option>
              <option>Pune</option>
              <option>Hyderabad</option>
              <option>Chennai</option>
              <option>Kolkata</option>
            </select>
            <button type="submit" className="btn btn-primary">
              Find tournaments →
            </button>
          </form>

          <div className="hero-meta">
            <span>
              <b>48 hrs</b> avg. slot sell-out
            </span>
            <span>
              <b>₹4.2 Cr</b> prizes paid out
            </span>
            <span>
              <b>1.8 lakh</b> registered players
            </span>
          </div>
        </div>

        {/* Signature: live bracket that draws itself */}
        <aside
          className="bracket-panel"
          aria-label="Live bracket — Bengaluru Smash Open, semifinals"
        >
          <div className="bracket-head">
            <span>Bengaluru Smash Open · SF</span>
            <span className="badge-live">
              <span className="pulse-dot" aria-hidden="true" />
              LIVE
            </span>
          </div>

          <svg
            className="bracket-svg"
            viewBox="0 0 360 260"
            fill="none"
            role="img"
            aria-hidden="true"
          >
            {/* Round 1 connectors */}
            <path
              d="M10 30 H70 V60 H130 M10 90 H70 V60"
              stroke="rgba(255,255,255,0.45)"
              strokeWidth="2"
            />
            <path
              d="M10 170 H70 V200 H130 M10 230 H70 V200"
              stroke="rgba(255,255,255,0.45)"
              strokeWidth="2"
            />
            {/* Semis to final */}
            <path
              d="M130 60 H190 V130 H250 M130 200 H190 V130"
              stroke="#e8283c"
              strokeWidth="3"
            />
            {/* Final to trophy */}
            <line
              x1="250"
              y1="130"
              x2="300"
              y2="130"
              stroke="#ffc42e"
              strokeWidth="3"
            />

            {/* Player labels */}
            <g
              fontFamily="var(--font-fixture), monospace"
              fontSize="12"
              fill="rgba(255,255,255,0.9)"
            >
              <text x="10" y="22" style={{ animationDelay: "0.8s" }}>
                A. Rao
              </text>
              <text x="10" y="82" style={{ animationDelay: "0.95s" }}>
                S. Iyer
              </text>
              <text x="10" y="162" style={{ animationDelay: "1.1s" }}>
                P. Nair
              </text>
              <text x="10" y="222" style={{ animationDelay: "1.25s" }}>
                V. Gill
              </text>
              <text
                x="138"
                y="52"
                fill="#fff"
                fontWeight="700"
                style={{ animationDelay: "1.6s" }}
              >
                A. Rao 21–18
              </text>
              <text
                x="138"
                y="192"
                fill="#fff"
                fontWeight="700"
                style={{ animationDelay: "1.75s" }}
              >
                V. Gill 21–19
              </text>
              <text
                x="230"
                y="118"
                fill="#ffc42e"
                fontWeight="700"
                style={{ animationDelay: "2.4s" }}
              >
                FINAL · 7 PM
              </text>
            </g>

            {/* Trophy */}
            <g style={{ animationDelay: "2.6s" }} className="trophy">
              <text x="306" y="140" fontSize="26" opacity="0">
                🏆
                <animate
                  attributeName="opacity"
                  from="0"
                  to="1"
                  begin="2.8s"
                  dur="0.4s"
                  fill="freeze"
                />
              </text>
            </g>
          </svg>
        </aside>
      </div>
    </section>
  );
}
