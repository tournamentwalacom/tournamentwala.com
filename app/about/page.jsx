import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "About us — TournamentWala.com",
  description:
    "TournamentWala.com is India's tournament marketplace, connecting players and organizers across cricket, badminton, football, kabaddi and esports.",
};

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="section container info-section">
          <div className="info-hero">
            <span className="eyebrow">Our story</span>
            <h1 className="section-title">
              Built for every
              <br />
              player &amp; organizer.
            </h1>
            <p className="post-intro">
              TournamentWala.com is India&rsquo;s tournament marketplace —
              helping players discover matches worth showing up for, and
              helping organizers reach them without the usual WhatsApp-group
              chaos.
            </p>
          </div>

          <div className="about-grid">
            <div className="about-card">
              <h4>What we do</h4>
              <p>
                From gully cricket to LAN esports finals, we list live and
                upcoming tournaments across cricket, badminton, football,
                kabaddi and more. Players can browse by sport or city and
                register in minutes. Organizers can list a tournament for
                free and manage registrations, fixtures and payouts in one
                place.
              </p>
            </div>

            <div className="about-card">
              <h4>Why we started</h4>
              <p>
                Most local tournaments never leave the group chat they were
                announced in. We built TournamentWala so any player,
                anywhere, can find a tournament near them — and any organizer
                can fill their brackets without chasing people down.
              </p>
            </div>

            <div className="about-card">
              <h4>Where we&rsquo;re headed</h4>
              <p>
                We&rsquo;re growing city by city and sport by sport, adding
                live scores, player rankings and a fixture generator for
                organizers along the way.
              </p>
            </div>
          </div>
        </section>

        <section className="section container pricing-section">
          <div className="info-hero">
            <span className="eyebrow">Promotion pricing</span>
            <h2 className="section-title">
              Get your tournament
              <br />
              seen, not just listed.
            </h2>
            <p className="post-intro">
              Listing on the website is free. Want more eyeballs? Pick any of
              the promotions below — on the website, on our Instagram, or
              both. Every submission, free or paid, is reviewed by our team
              before it goes live.
            </p>
          </div>

          <div className="pricing-grid">
            <div className="pricing-card">
              <div className="pricing-card-head">
                <span className="pricing-name">Website Listing</span>
                <span className="pricing-badge-free">Free</span>
              </div>
              <p className="pricing-desc">
                Your tournament goes live in search and browse across the
                site — the baseline for every organizer.
              </p>
              <span className="pricing-time">⏱ Reviewed &amp; live within 24 hrs</span>
            </div>

            <div className="pricing-card pricing-card-featured">
              <span className="pricing-tag">Most popular</span>
              <div className="pricing-card-head">
                <span className="pricing-name">Pin / Fast-Fill</span>
                <span className="pricing-price">₹499</span>
              </div>
              <p className="pricing-desc">
                Pinned to the top of website listings for 7 days so it fills
                faster.
              </p>
              <span className="pricing-time">⏱ Live within 3 hrs of payment</span>
            </div>

            <div className="pricing-card">
              <div className="pricing-card-head">
                <span className="pricing-name">Instagram Story</span>
                <span className="pricing-price">₹299</span>
              </div>
              <p className="pricing-desc">
                A dedicated story push to our Instagram audience.
              </p>
              <span className="pricing-time">⏱ Posted within 12 hrs</span>
            </div>

            <div className="pricing-card">
              <div className="pricing-card-head">
                <span className="pricing-name">Instagram Pinned Post</span>
                <span className="pricing-price">₹599</span>
              </div>
              <p className="pricing-desc">
                Feed post pinned to the top of our profile for 7 days.
              </p>
              <span className="pricing-time">⏱ Posted within 24 hrs</span>
            </div>

            <div className="pricing-card">
              <div className="pricing-card-head">
                <span className="pricing-name">Reel Shoot + Edit</span>
                <span className="pricing-price">₹1,999</span>
              </div>
              <p className="pricing-desc">
                On-ground shoot plus a fully edited reel for your
                tournament.
              </p>
              <span className="pricing-time">⏱ Delivered in 3–5 days</span>
            </div>

            <div className="pricing-card">
              <div className="pricing-card-head">
                <span className="pricing-name">Poster Design</span>
                <span className="pricing-price">₹399</span>
              </div>
              <p className="pricing-desc">
                A custom poster or graphic, ready to share anywhere.
              </p>
              <span className="pricing-time">⏱ Delivered in 24–48 hrs</span>
            </div>
          </div>

          <p className="pricing-note">
            <strong>Note:</strong> prices above are placeholders shown for
            layout purposes — final rates will be confirmed before this goes
            live. Every listing, free or paid, is manually reviewed and
            approved within 24 hrs; paid promotions are scheduled right
            after approval.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
