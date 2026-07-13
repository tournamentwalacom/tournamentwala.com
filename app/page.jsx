import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import LiveTicker from "@/components/LiveTicker";
import Tournaments from "@/components/Tournaments";
import SportsMarquee from "@/components/SportsMarquee";
import HowItWorks from "@/components/HowItWorks";
import OrganizerCTA from "@/components/OrganizerCTA";
import Footer from "@/components/Footer";

export default async function Home({ searchParams }) {
  const params = await searchParams;

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <LiveTicker />
        <Tournaments sport={params?.sport} city={params?.city} />
        <Tournaments
          sport="Football"
          city={params?.city}
          eyebrow="Football Tournaments"
          title="Get Onto the Pitch."
          sectionId="football-tournaments"
          showActiveFilter={false}
        />
        <Tournaments
          sport="Esports (BGMI / Valorant / Free Fire)"
          city={params?.city}
          eyebrow="BGMI Tournaments"
          title="Squad Up & Drop In."
          sectionId="bgmi-tournaments"
          showActiveFilter={false}
        />
        <Tournaments
          sport="Pickleball"
          city={params?.city}
          eyebrow="Pickleball Tournaments"
          title="Book Your Court."
          sectionId="pickleball-tournaments"
          showActiveFilter={false}
        />
        <SportsMarquee />
        <HowItWorks />
        <OrganizerCTA />
      </main>
      <Footer />
    </>
  );
}
