import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabaseAdmin } from "@/lib/supabase";

export const metadata = {
  title: "About us — TournamentWala.com",
  description:
    "TournamentWala.com is India's tournament marketplace, connecting players and organizers across cricket, badminton, football, kabaddi and esports.",
};

function formatPrice(pkg) {
  if (pkg.is_free) return "Free";
  const amount = `₹${Number(pkg.price).toLocaleString("en-IN")}`;
  return pkg.price_unit ? `${amount} / ${pkg.price_unit}` : amount;
}

export default async function AboutPage() {
  const { data: packages } = await supabaseAdmin()
    .from("promotion_packages")
    .select(
      "id, name, description, price, price_unit, is_free, requires_telegram_upload, requires_brief"
    )
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  const paidPackages = (packages || []).filter((pkg) => !pkg.is_free);
  const featuredId = paidPackages[0]?.id;

  return (
    <>
      <Navbar />
      <main>
        <section className="section container info-section">
          <div className="info-hero">
            <span className="eyebrow">Est. 10 July 2026</span>
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
              <span className="about-card-icon">🏆</span>
              <h4>What we do</h4>
              <p>
                From gully cricket to LAN esports finals, we list live and
                upcoming tournaments across cricket, badminton, football,
                kabaddi and more. Players browse by sport or city and register
                in minutes. Organizers list a tournament for free and manage
                registrations, fixtures and promotion in one place.
              </p>
            </div>

            <div className="about-card">
              <span className="about-card-icon">💡</span>
              <h4>Why we started</h4>
              <p>
                Most local tournaments never leave the group chat they were
                announced in — or spend days stuck in an Instagram page&rsquo;s
                DMs waiting to be noticed. We started TournamentWala on 10
                July 2026 so any player, anywhere, can find a tournament near
                them, and any organizer can fill their brackets without
                chasing anyone down.
              </p>
            </div>

            <div className="about-card">
              <span className="about-card-icon">📈</span>
              <h4>Where we&rsquo;re headed</h4>
              <p>
                We&rsquo;re growing city by city and sport by sport, adding
                live scores, player rankings and a fixture generator for
                organizers along the way.
              </p>
            </div>
          </div>
        </section>

        <section className="section container backer-section">
          <div className="backer-card">
            <div className="backer-logo" aria-hidden="true">
              <span>AERO</span>
              <span>BALLS</span>
            </div>
            <div className="backer-copy">
              <span className="eyebrow">Backed by</span>
              <h3>Aero Balls</h3>
              <p>
                TournamentWala is backed by Aero Balls, a name grassroots
                sport in India already trusts. That backing is what lets us
                keep listings free for organizers and keep pushing tournament
                culture into every city, not just the big ones.
              </p>
            </div>
          </div>
        </section>

        <section className="section container process-section">
          <div className="info-hero">
            <span className="eyebrow">How it works</span>
            <h2 className="section-title">
              One step.
              <br />
              That&rsquo;s the whole process.
            </h2>
            <p className="post-intro">
              Getting your tournament on a popular Instagram page used to
              mean DMing admins and waiting days for a reply, if you got one
              at all. We broke that habit. List your tournament once on
              TournamentWala, and it goes live on the website — and straight
              to Instagram — without a single DM.
            </p>
          </div>

          <div className="steps-row">
            <div className="step-card">
              <span className="step-number">1</span>
              <h4>Submit your tournament</h4>
              <p>
                Fill one simple form with your tournament details, poster and
                sport. Takes less than 5 minutes — no back-and-forth needed.
              </p>
            </div>
            <div className="step-connector" aria-hidden="true" />
            <div className="step-card">
              <span className="step-number">2</span>
              <h4>We review it</h4>
              <p>
                Our team checks every submission, free or paid, for quality
                and approves it — no chasing an admin for a status update.
              </p>
            </div>
            <div className="step-connector" aria-hidden="true" />
            <div className="step-card">
              <span className="step-number">3</span>
              <h4>Live everywhere</h4>
              <p>
                Published on TournamentWala.com, and if you picked a
                promotion, posted directly to our Instagram — no DMs, no
                waiting days, no chasing pages.
              </p>
            </div>
          </div>
        </section>

        <section className="section container pricing-section">
          <div className="info-hero">
            <span className="eyebrow">Promotion services</span>
            <h2 className="section-title">
              Get your tournament
              <br />
              seen, not just listed.
            </h2>
            <p className="post-intro">
              Website listing is free with every approved submission. Want
              more eyeballs? Add any of the promotions below — on the
              website, on our Instagram, or both.
            </p>
          </div>

          <div className="pricing-grid">
            {(packages || []).map((pkg) => (
              <div
                key={pkg.id}
                className={
                  pkg.id === featuredId
                    ? "pricing-card pricing-card-featured"
                    : "pricing-card"
                }
              >
                {pkg.id === featuredId && (
                  <span className="pricing-tag">Most popular</span>
                )}
                <div className="pricing-card-head">
                  <span className="pricing-name">{pkg.name}</span>
                  {pkg.is_free ? (
                    <span className="pricing-badge-free">Free</span>
                  ) : (
                    <span className="pricing-price">{formatPrice(pkg)}</span>
                  )}
                </div>
                <p className="pricing-desc">{pkg.description}</p>
                {pkg.requires_telegram_upload && (
                  <span className="pricing-time">
                    📩 Send your file + payment screenshot
                  </span>
                )}
              </div>
            ))}
          </div>

          <p className="pricing-note">
            <strong>Note:</strong> every listing, free or paid, is manually
            reviewed and approved before it goes live; paid promotions are
            scheduled right after approval.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
