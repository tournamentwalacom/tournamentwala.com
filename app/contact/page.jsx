import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";

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
        <section className="section container info-section">
          <div className="info-hero">
            <span className="eyebrow">Get in touch</span>
            <h1 className="section-title">
              Questions? We&rsquo;re
              <br />
              happy to help.
            </h1>
            <p className="post-intro">
              Whether you&rsquo;re a player with a query about registration
              or an organizer looking to list or promote a tournament, reach
              out — we typically respond within 24 hrs.
            </p>
          </div>

          <div className="contact-layout">
            <div className="contact-grid">
              <div className="contact-card">
                <h4>Email</h4>
                <p>Registration, fixtures, refunds, listings, payouts — anything.</p>
                <a href="mailto:tournamentwalacom@gmail.com">
                  tournamentwalacom@gmail.com
                </a>
              </div>

              <div className="contact-card">
                <h4>Call / WhatsApp</h4>
                <p>Prefer to talk? Reach us directly.</p>
                <a href="tel:+916374753084">+91 63747 53084</a>
              </div>

              <div className="contact-card">
                <h4>Follow along</h4>
                <p>Instagram</p>
                <a
                  href="https://www.instagram.com/tournamentwalacom/?hl=en"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  @tournamentwalacom
                </a>
              </div>
            </div>

            <div className="contact-form-card">
              <h3>Send us a message</h3>
              <p>Fill this in and we&rsquo;ll get back to you within 24 hrs.</p>
              <ContactForm />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
