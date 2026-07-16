import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Refund Policy — TournamentWala.com",
  description:
    "TournamentWala.com's refund policy for tournament entry fees and organizer promotion packages.",
};

const sections = [
  { id: "overview", label: "Overview" },
  { id: "entry-fees", label: "Tournament entry fees" },
  { id: "promotion-packages", label: "Promotion packages" },
  { id: "how-to-request", label: "How to request a refund" },
  { id: "timelines", label: "Refund timelines" },
  { id: "non-refundable", label: "Non-refundable situations" },
  { id: "contact", label: "Contact us" },
];

export default function RefundPolicyPage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="section container legal-section">
          <div className="legal-hero">
            <span className="eyebrow">Refund Policy</span>
            <h1 className="section-title">
              How refunds work
              <br />
              on TournamentWala.
            </h1>
            <p className="post-intro">
              We keep this simple: TournamentWala.com is a marketplace that
              connects players with tournament organizers. Depending on
              whether a payment was for a tournament entry or for an
              organizer promotion package, a different refund process
              applies — read on for details.
            </p>
            <span className="legal-updated">Last updated: 16 July 2026</span>
          </div>

          <div className="legal-layout">
            <nav className="legal-toc" aria-label="Refund policy sections">
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
              <section id="overview">
                <h2>1. Overview</h2>
                <p>
                  TournamentWala.com (&ldquo;TournamentWala&rdquo;,
                  &ldquo;we&rdquo;, &ldquo;us&rdquo;) lists tournaments
                  submitted by independent organizers and helps players
                  discover and register for them. We are not the organizer
                  of the tournaments listed on the platform unless explicitly
                  stated. This policy explains how refunds are handled for
                  the two kinds of payments made in connection with
                  TournamentWala: tournament entry fees paid by players, and
                  promotion package payments made by organizers.
                </p>
              </section>

              <section id="entry-fees">
                <h2>2. Tournament entry fees</h2>
                <p>
                  Entry fees shown on a tournament listing are set and
                  collected by the organizer of that tournament, not by
                  TournamentWala. Unless a tournament&rsquo;s listing states
                  otherwise, entry fee payments are made directly to the
                  organizer, and any refund for a cancelled registration,
                  withdrawal, or cancelled/postponed tournament is governed
                  by that organizer&rsquo;s own refund terms.
                </p>
                <p>
                  If an organizer cancels a tournament and does not honour a
                  reasonable refund request, or if you believe a listing was
                  fraudulent or misrepresented, contact our support team with
                  your registration details and we will investigate and, where
                  appropriate, remove the organizer from the platform.
                </p>
              </section>

              <section id="promotion-packages">
                <h2>3. Promotion packages</h2>
                <p>
                  Organizers can pay TournamentWala directly for optional
                  promotion packages (for example, featured placement on the
                  website or a promotional post on our Instagram). Basic
                  website listing is free and is not covered by this section.
                </p>
                <p>
                  Once a paid promotion package has been fulfilled — meaning
                  the tournament has been published on the website and, where
                  applicable, promoted on our social channels — the payment
                  is final and non-refundable. If we are unable to fulfil a
                  paid promotion (for example, because the listing was
                  rejected during review, or the promotion was not delivered
                  as described), you are entitled to a full refund of that
                  payment.
                </p>
              </section>

              <section id="how-to-request">
                <h2>4. How to request a refund</h2>
                <p>To request a refund, email us with the following details:</p>
                <ul>
                  <li>Your name and the email or phone number used to register or submit the listing</li>
                  <li>The tournament name and organizer (for entry fee issues)</li>
                  <li>The promotion package purchased and payment screenshot/reference (for promotion package issues)</li>
                  <li>A short description of the reason for the refund request</li>
                </ul>
                <p>
                  Send this to{" "}
                  <a href="mailto:tournamentwalacom@gmail.com">
                    tournamentwalacom@gmail.com
                  </a>{" "}
                  or call{" "}
                  <a href="tel:+916374753084">+91 63747 53084</a>.
                </p>
              </section>

              <section id="timelines">
                <h2>5. Refund timelines</h2>
                <p>
                  We acknowledge refund requests within 2 business days. Where
                  a refund is approved for a promotion package paid to
                  TournamentWala, the amount is returned to the original
                  payment method within 7–10 business days. Refunds for
                  tournament entry fees are processed by the organizer
                  directly and their timelines may vary; we will follow up on
                  your behalf if an organizer is unresponsive.
                </p>
              </section>

              <section id="non-refundable">
                <h2>6. Non-refundable situations</h2>
                <ul>
                  <li>A promotion package that has already been fully delivered as described</li>
                  <li>Change of mind after a tournament listing has gone live at the organizer&rsquo;s request</li>
                  <li>Player no-shows or late withdrawals where the organizer&rsquo;s own terms state entry fees are non-refundable</li>
                  <li>Requests made outside a reasonable time (90 days) from the date of payment</li>
                </ul>
              </section>

              <section id="contact">
                <h2>7. Contact us</h2>
                <p>
                  Questions about this policy or a specific refund? Reach out
                  through our{" "}
                  <a href="/contact">contact page</a>, email{" "}
                  <a href="mailto:tournamentwalacom@gmail.com">
                    tournamentwalacom@gmail.com
                  </a>
                  , or call{" "}
                  <a href="tel:+916374753084">+91 63747 53084</a>. We
                  typically respond within 24 hours.
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
