import Image from "next/image";

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="m4 7 8 6 8-6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 3h3l2 5-2.5 1.5a11 11 0 0 0 5 5L16 12l5 2v3a2 2 0 0 1-2 2c-8.28 0-15-6.72-15-15a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" />
    </svg>
  );
}

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
                <a href="/blogs">Blogs</a>
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
            <div className="footer-social-row">
              <a
                href="mailto:tournamentwalacom@gmail.com"
                className="footer-social-icon"
                aria-label="Email us"
                title="Email us"
              >
                <MailIcon />
              </a>
              <a
                href="tel:+916374753084"
                className="footer-social-icon"
                aria-label="Call us"
                title="Call us"
              >
                <PhoneIcon />
              </a>
              <a
                href="https://www.instagram.com/tournamentwalacom/?hl=en"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-icon"
                aria-label="Follow us on Instagram"
                title="Instagram"
              >
                <InstagramIcon />
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 TournamentWala.com — Made in India 🇮🇳</span>
        </div>
      </div>
    </footer>
  );
}
