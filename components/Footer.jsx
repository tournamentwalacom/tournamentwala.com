export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <span className="brand-word" style={{ color: "#fff" }}>
              tournament<em>wala</em>.com
            </span>
            <p className="footer-tagline">
              Find. Play. <em>Win.</em>
            </p>
            <p style={{ marginTop: 12, fontSize: "0.9rem", maxWidth: "34ch" }}>
              India&rsquo;s tournament marketplace — from gully cricket to LAN
              finals.
            </p>
          </div>

          <div>
            <h4>Players</h4>
            <ul>
              <li>
                <a href="#tournaments">Browse tournaments</a>
              </li>
              <li>
                <a href="#">Find a team</a>
              </li>
              <li>
                <a href="#">Live scores</a>
              </li>
              <li>
                <a href="#">Player rankings</a>
              </li>
            </ul>
          </div>

          <div>
            <h4>Organizers</h4>
            <ul>
              <li>
                <a href="#organizers">List a tournament</a>
              </li>
              <li>
                <a href="#">Fixture generator</a>
              </li>
              <li>
                <a href="#">Payments &amp; payouts</a>
              </li>
              <li>
                <a href="#">Organizer stories</a>
              </li>
            </ul>
          </div>

          <div>
            <h4>Company</h4>
            <ul>
              <li>
                <a href="#">About us</a>
              </li>
              <li>
                <a href="#">Contact</a>
              </li>
              <li>
                <a href="#">Terms &amp; refunds</a>
              </li>
              <li>
                <a href="#">Privacy</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 TournamentWala.com — Made in India 🇮🇳</span>
          <span>Instagram · YouTube · WhatsApp Channel</span>
        </div>
      </div>
    </footer>
  );
}
