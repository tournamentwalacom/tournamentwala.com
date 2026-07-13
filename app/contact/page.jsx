import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Contact us — TournamentWala.com",
  description:
    "Get in touch with the TournamentWala.com team — for player support, organizer queries, or general questions.",
};

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="section container post-section">
          <span className="eyebrow">Get in touch</span>
          <h1 className="section-title">
            Questions? We&rsquo;re
            <br />
            happy to help.
          </h1>
          <p className="post-intro">
            Whether you&rsquo;re a player with a query about registration or
            an organizer looking to list a tournament, reach out — we
            typically respond within 24 hrs.
          </p>

          <div className="contact-grid">
            <div className="contact-card">
              <h4>Players</h4>
              <p>Registration, fixtures, refunds or anything else.</p>
              <a href="mailto:hello@tournamentwala.com">
                hello@tournamentwala.com
              </a>
            </div>

            <div className="contact-card">
              <h4>Organizers</h4>
              <p>Listing a tournament, payouts, or account support.</p>
              <a href="mailto:organizers@tournamentwala.com">
                organizers@tournamentwala.com
              </a>
            </div>

            <div className="contact-card">
              <h4>Follow along</h4>
              <p>Instagram · YouTube · WhatsApp Channel</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
