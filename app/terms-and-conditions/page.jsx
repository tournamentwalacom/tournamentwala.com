import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Terms & Conditions — TournamentWala.com",
  description:
    "The terms and conditions governing use of TournamentWala.com by players and tournament organizers.",
};

const sections = [
  { id: "acceptance", label: "Acceptance of terms" },
  { id: "who-can-use", label: "Who can use TournamentWala" },
  { id: "player-accounts", label: "Player accounts & registrations" },
  { id: "organizer-accounts", label: "Organizer accounts & listings" },
  { id: "payments", label: "Payments & promotion packages" },
  { id: "conduct", label: "Content & conduct" },
  { id: "ip", label: "Intellectual property" },
  { id: "liability", label: "Limitation of liability" },
  { id: "termination", label: "Termination" },
  { id: "law", label: "Governing law" },
  { id: "changes", label: "Changes to these terms" },
  { id: "contact", label: "Contact us" },
];

export default function TermsAndConditionsPage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="section container legal-section">
          <div className="legal-hero">
            <span className="eyebrow">Terms &amp; Conditions</span>
            <h1 className="section-title">
              The rules of
              <br />
              the game.
            </h1>
            <p className="post-intro">
              These terms govern your use of TournamentWala.com. By
              accessing the site or creating an account, you agree to them —
              please read them carefully.
            </p>
            <span className="legal-updated">Last updated: 16 July 2026</span>
          </div>

          <div className="legal-layout">
            <nav className="legal-toc" aria-label="Terms and conditions sections">
              <h5>On this page</h5>
              <ul>
                {sections.map((s) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`}>{s.label}</a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="legal-body">
              <section id="acceptance">
                <h2>1. Acceptance of terms</h2>
                <p>
                  TournamentWala.com (&ldquo;TournamentWala&rdquo;,
                  &ldquo;we&rdquo;, &ldquo;us&rdquo;) is a marketplace that
                  lists tournaments submitted by independent organizers and
                  helps players discover and register for them. By using the
                  site, creating an account, submitting a tournament, or
                  registering interest in one, you agree to be bound by these
                  terms and our{" "}
                  <a href="/privacy-policy">Privacy Policy</a> and{" "}
                  <a href="/refund-policy">Refund Policy</a>. If you do not
                  agree, please do not use TournamentWala.
                </p>
              </section>

              <section id="who-can-use">
                <h2>2. Who can use TournamentWala</h2>
                <p>
                  You must be at least 13 years old to create an account. If
                  you are under 18, you confirm you have a parent or
                  guardian&rsquo;s permission to use the platform and, where
                  relevant, to register for tournaments. You are responsible
                  for providing accurate information and keeping your account
                  credentials secure.
                </p>
              </section>

              <section id="player-accounts">
                <h2>3. Player accounts & registrations</h2>
                <p>
                  As a player, you can browse tournaments and register
                  interest in ones you&rsquo;d like to play. TournamentWala
                  displays information provided by organizers &mdash; sport,
                  city, dates, entry fees, and rules &mdash; but does not
                  organize, referee, or guarantee the conduct of any
                  tournament. Your relationship for participation, entry fee
                  payment, and any dispute about the tournament itself is
                  with the organizer, not TournamentWala.
                </p>
              </section>

              <section id="organizer-accounts">
                <h2>4. Organizer accounts & listings</h2>
                <p>
                  As an organizer, you can submit tournaments for listing.
                  Every submission, free or paid, is manually reviewed before
                  it goes live, and we may reject or remove a listing at our
                  discretion &mdash; for example, if it is incomplete,
                  misleading, or violates these terms. You confirm that the
                  information you submit is accurate and that you have the
                  right to organize the tournament described.
                </p>
                <p>
                  You are solely responsible for running the tournament you
                  list, including registrations, fixtures, entry fee
                  collection, prize distribution, and player disputes.
                </p>
              </section>

              <section id="payments">
                <h2>5. Payments & promotion packages</h2>
                <p>
                  Basic website listing is free. Organizers may optionally
                  purchase promotion packages (for example, featured
                  placement or Instagram promotion) at the prices shown at
                  the time of purchase. Paid promotions are scheduled after
                  listing approval. See our{" "}
                  <a href="/refund-policy">Refund Policy</a> for how refunds
                  are handled for entry fees and promotion packages.
                </p>
              </section>

              <section id="conduct">
                <h2>6. Content & conduct</h2>
                <p>You agree not to:</p>
                <ul>
                  <li>Submit false, misleading, or fraudulent tournament listings</li>
                  <li>Use the platform to spam, harass, or scam players or organizers</li>
                  <li>Upload content you don&rsquo;t have the rights to use</li>
                  <li>Attempt to interfere with or disrupt the platform&rsquo;s security or performance</li>
                  <li>Use automated means to scrape or extract data from the site without permission</li>
                </ul>
                <p>
                  We may remove content or suspend accounts that violate
                  these rules.
                </p>
              </section>

              <section id="ip">
                <h2>7. Intellectual property</h2>
                <p>
                  The TournamentWala name, logo, and website design are our
                  property and may not be used without permission. Content
                  you submit (such as tournament posters and descriptions)
                  remains yours, but by submitting it you grant us a
                  non-exclusive licence to display it on TournamentWala and
                  our social channels for the purpose of listing and
                  promoting the tournament.
                </p>
              </section>

              <section id="liability">
                <h2>8. Limitation of liability</h2>
                <p>
                  TournamentWala is provided &ldquo;as is.&rdquo; We do not
                  guarantee that any listed tournament will take place as
                  described, and we are not liable for losses arising from a
                  tournament&rsquo;s cancellation, postponement, conduct, or
                  any dispute between a player and an organizer. To the
                  fullest extent permitted by law, TournamentWala is not
                  liable for indirect, incidental, or consequential damages
                  arising from your use of the platform.
                </p>
              </section>

              <section id="termination">
                <h2>9. Termination</h2>
                <p>
                  We may suspend or terminate your account if you violate
                  these terms, or if we reasonably believe your use of the
                  platform poses a risk to us, other users, or the public.
                  You may stop using TournamentWala and request account
                  deletion at any time by contacting us.
                </p>
              </section>

              <section id="law">
                <h2>10. Governing law</h2>
                <p>
                  These terms are governed by the laws of India, and any
                  disputes arising from them will be subject to the
                  jurisdiction of the courts of India.
                </p>
              </section>

              <section id="changes">
                <h2>11. Changes to these terms</h2>
                <p>
                  We may update these terms from time to time. Material
                  changes will be reflected by an updated &ldquo;last
                  updated&rdquo; date on this page. Continued use of
                  TournamentWala after a change means you accept the revised
                  terms.
                </p>
              </section>

              <section id="contact">
                <h2>12. Contact us</h2>
                <p>
                  Questions about these terms? Reach out through our{" "}
                  <a href="/contact">contact page</a>, email{" "}
                  <a href="mailto:tournamentwalacom@gmail.com">
                    tournamentwalacom@gmail.com
                  </a>
                  , or call{" "}
                  <a href="tel:+916374753084">+91 63747 53084</a>.
                </p>
              </section>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
