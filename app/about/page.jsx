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
        <section className="section container post-section">
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

          <div className="about-body">
            <h4>What we do</h4>
            <p>
              From gully cricket to LAN esports finals, we list live and
              upcoming tournaments across cricket, badminton, football,
              kabaddi and more. Players can browse by sport or city and
              register in minutes. Organizers can list a tournament for free
              and manage registrations, fixtures and payouts in one place.
            </p>

            <h4>Why we started</h4>
            <p>
              Most local tournaments never leave the group chat they were
              announced in. We built TournamentWala so any player, anywhere,
              can find a tournament near them — and any organizer can fill
              their brackets without chasing people down.
            </p>

            <h4>Where we&rsquo;re headed</h4>
            <p>
              We&rsquo;re growing city by city and sport by sport, adding
              live scores, player rankings and a fixture generator for
              organizers along the way.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
