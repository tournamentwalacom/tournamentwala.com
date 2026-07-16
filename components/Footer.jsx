import Image from "next/image";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">
              <span className="footer-logo-crop">
                <Image
                  className="brand-mark"
                  src="/images/logo.png"
                  alt=""
                  width={56}
                  height={56}
                />
              </span>
              <span className="brand-word" style={{ color: "#fff" }}>
                tournament<em>wala</em>.com
              </span>
            </div>
            <p className="footer-tagline">
              Find. Play. <em>Win.</em>
            </p>
            <p style={{ marginTop: 12, fontSize: "0.9rem", maxWidth: "34ch" }}>
              India&rsquo;s tournament marketplace — from gully cricket to LAN
              finals.
            </p>
          </div>

          <div>
            <h4>Explore</h4>
            <ul>
              <li>
                <a href="/">Home</a>
              </li>
              <li>
                <a href="/explore-tournaments">Explore tournaments</a>
              </li>
              <li>
                <a href="/about">About</a>
              </li>
              <li>
                <a href="/contact">Contact us</a>
              </li>
            </ul>
          </div>

          <div>
            <h4>Organizers</h4>
            <ul>
              <li>
                <a href="/post-tournament">Post a tournament</a>
              </li>
              <li>
                <a href="/profile">My profile</a>
              </li>
              <li>
                <a href="/contact">Organizer support</a>
              </li>
            </ul>
          </div>

          <div>
            <h4>Legal</h4>
            <ul>
              <li>
                <a href="/refund-policy">Refund policy</a>
              </li>
              <li>
                <a href="/privacy-policy">Privacy policy</a>
              </li>
              <li>
                <a href="/terms-and-conditions">Terms &amp; conditions</a>
              </li>
            </ul>
          </div>

          <div>
            <h4>Get in touch</h4>
            <ul>
              <li>
                <a href="mailto:tournamentwalacom@gmail.com">
                  tournamentwalacom@gmail.com
                </a>
              </li>
              <li>
                <a href="tel:+916374753084">+91 63747 53084</a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/tournamentwalacom/?hl=en"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 TournamentWala.com — Made in India 🇮🇳</span>
        </div>
      </div>
    </footer>
  );
}
