import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Privacy Policy — TournamentWala.com",
  description:
    "How TournamentWala.com collects, uses, and protects your personal information.",
};

const sections = [
  { id: "overview", label: "Overview" },
  { id: "information-we-collect", label: "Information we collect" },
  { id: "how-we-use-it", label: "How we use your information" },
  { id: "cookies", label: "Cookies & tracking" },
  { id: "sharing", label: "Sharing of information" },
  { id: "security", label: "Data storage & security" },
  { id: "your-rights", label: "Your rights & choices" },
  { id: "children", label: "Children's privacy" },
  { id: "changes", label: "Changes to this policy" },
  { id: "contact", label: "Contact us" },
];

export default function PrivacyPolicyPage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="section container legal-section">
          <div className="legal-hero">
            <span className="eyebrow">Privacy Policy</span>
            <h1 className="section-title">
              Your data,
              <br />
              handled responsibly.
            </h1>
            <p className="post-intro">
              This policy explains what information TournamentWala.com
              collects when you use our platform as a player or an
              organizer, how we use it, and the choices you have.
            </p>
            <span className="legal-updated">Last updated: 16 July 2026</span>
          </div>

          <div className="legal-layout">
            <nav className="legal-toc" aria-label="Privacy policy sections">
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
                  &ldquo;we&rdquo;, &ldquo;us&rdquo;) is India&rsquo;s
                  tournament marketplace, connecting players and organizers
                  across cricket, badminton, football, kabaddi, esports and
                  more. This policy applies to the website and any related
                  services, and describes our privacy practices. By using
                  TournamentWala, you agree to the collection and use of
                  information as described here.
                </p>
              </section>

              <section id="information-we-collect">
                <h2>2. Information we collect</h2>
                <p>We collect information in a few different ways:</p>
                <ul>
                  <li>
                    <strong>Account information</strong> — name, email
                    address, phone number, and password (stored securely,
                    hashed) when you sign up or log in, including via Google
                    sign-in.
                  </li>
                  <li>
                    <strong>Profile information</strong> — details you add to
                    your organizer or player profile.
                  </li>
                  <li>
                    <strong>Tournament & registration data</strong> —
                    tournaments you submit as an organizer (name, sport,
                    city, dates, poster, fees, contact details) and
                    tournaments you register interest in as a player.
                  </li>
                  <li>
                    <strong>Payment-related information</strong> — for paid
                    promotion packages, we may collect a payment reference or
                    screenshot to verify payment; we do not store full card
                    or bank details on our servers.
                  </li>
                  <li>
                    <strong>Communications</strong> — messages you send us
                    through the contact form or email.
                  </li>
                  <li>
                    <strong>Usage data</strong> — pages visited, device and
                    browser type, and similar technical data collected
                    automatically to keep the platform reliable and secure.
                  </li>
                </ul>
              </section>

              <section id="how-we-use-it">
                <h2>3. How we use your information</h2>
                <ul>
                  <li>To create and manage your account and profile</li>
                  <li>To publish and display tournament listings you submit</li>
                  <li>To connect players with organizers and their tournaments</li>
                  <li>To process and verify promotion package payments</li>
                  <li>To respond to support requests and enquiries</li>
                  <li>To send important updates about your account, listing, or registration</li>
                  <li>To detect, prevent, and address fraud, abuse, or technical issues</li>
                  <li>To improve the platform and understand how it&rsquo;s used</li>
                </ul>
              </section>

              <section id="cookies">
                <h2>4. Cookies & tracking</h2>
                <p>
                  We use essential cookies to keep you signed in and to
                  remember basic preferences. We may also use analytics tools
                  to understand aggregate usage of the site. You can control
                  or disable cookies through your browser settings, though
                  some parts of the site may not function correctly without
                  them.
                </p>
              </section>

              <section id="sharing">
                <h2>5. Sharing of information</h2>
                <p>We do not sell your personal information. We share it only:</p>
                <ul>
                  <li>
                    With the organizer of a tournament you register interest
                    in, so far as needed for them to contact you about that
                    tournament
                  </li>
                  <li>
                    Publicly, where you choose to have information (like a
                    tournament listing) published on the site
                  </li>
                  <li>
                    With service providers who help us run the platform
                    (such as hosting and database providers), under
                    appropriate confidentiality terms
                  </li>
                  <li>
                    When required by law, or to protect the rights, safety,
                    or property of TournamentWala, our users, or the public
                  </li>
                </ul>
              </section>

              <section id="security">
                <h2>6. Data storage & security</h2>
                <p>
                  Your information is stored using reputable, secured cloud
                  infrastructure with access controls and encryption in
                  transit. While we take reasonable steps to protect your
                  data, no method of transmission or storage is 100% secure,
                  and we cannot guarantee absolute security.
                </p>
              </section>

              <section id="your-rights">
                <h2>7. Your rights & choices</h2>
                <p>
                  You can review and update your profile information at any
                  time from your{" "}
                  <a href="/profile">profile page</a>. You may also request
                  that we delete your account and associated personal
                  information, or provide a copy of the data we hold about
                  you, by emailing us — we will respond within a reasonable
                  time, subject to any records we&rsquo;re required to keep
                  by law.
                </p>
              </section>

              <section id="children">
                <h2>8. Children&rsquo;s privacy</h2>
                <p>
                  TournamentWala is not directed at children under 13, and we
                  do not knowingly collect personal information from them. If
                  you believe a child has provided us with personal
                  information, please contact us and we will take steps to
                  remove it.
                </p>
              </section>

              <section id="changes">
                <h2>9. Changes to this policy</h2>
                <p>
                  We may update this privacy policy from time to time. Any
                  changes will be posted on this page with an updated
                  &ldquo;last updated&rdquo; date. Continued use of
                  TournamentWala after a change means you accept the revised
                  policy.
                </p>
              </section>

              <section id="contact">
                <h2>10. Contact us</h2>
                <p>
                  Questions about this policy or your data? Reach out
                  through our <a href="/contact">contact page</a>, email{" "}
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
