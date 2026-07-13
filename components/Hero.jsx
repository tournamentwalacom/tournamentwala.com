export default function Hero() {
  return (
    <section className="hero">
      <div className="container hero-grid">
        <div className="hero-columns">
          <div className="hero-col-left">
            <span className="hero-kicker">
              <span className="pulse-dot" aria-hidden="true" />
              <span className="hero-kicker-text">
                2,300+ tournaments live across 40 Indian cities
              </span>
            </span>

            <h1 className="hero-title" aria-label="Find. Play. Win.">
              <span className="hero-title-line">
                <span className="word word-find">Find.</span>{" "}
                <span className="word word-play">Play.</span>
              </span>{" "}
              <span className="word word-win">Win.</span>
            </h1>
          </div>

          <div className="hero-col-right">
            <p className="hero-sub">
              TournamentWala is India&rsquo;s tournament marketplace. Discover
              <strong> cricket, badminton, football, kabaddi and esports </strong>
              events near you, register your team in minutes, and chase real
              prize pools — no phone calls, no paper forms.
            </p>

            <div className="hero-actions">
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
                <button type="submit" className="btn btn-primary">
                  Find nearby tournament →
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
                  <b>1.8 lakh</b> Players
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
