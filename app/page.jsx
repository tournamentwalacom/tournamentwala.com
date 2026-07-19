import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Tournaments from "@/components/Tournaments";
import NearbyTournaments from "@/components/NearbyTournaments";
import SportsMarquee from "@/components/SportsMarquee";
import HowItWorks from "@/components/HowItWorks";
import OrganizerCTA from "@/components/OrganizerCTA";
import Footer from "@/components/Footer";
import { getHomepageStats } from "@/lib/homepageStats";

export default async function Home({ searchParams }) {
  const params = await searchParams;
  const stats = await getHomepageStats();

  return (
    <>
      <Navbar />
      <main>
        <Hero stats={stats} />
        <NearbyTournaments />
        <Tournaments
          sport="Cricket"
          city={params?.city}
          showActiveFilter={false}
          theme="gray"
        />
        <Tournaments
          sport="Football"
          city={params?.city}
          eyebrow="Football Tournaments"
          title="Get Onto the Pitch."
          sectionId="football-tournaments"
          showActiveFilter={false}
          theme="tint"
        />
        <Tournaments
          sport="Esports (BGMI / Valorant / Free Fire)"
          city={params?.city}
          eyebrow="BGMI Tournaments"
          title="Squad Up & Drop In."
          sectionId="bgmi-tournaments"
          showActiveFilter={false}
          theme="gray"
        />
        <Tournaments
          sport="Pickleball"
          city={params?.city}
          eyebrow="Pickleball Tournaments"
          title="Book Your Court."
          sectionId="pickleball-tournaments"
          showActiveFilter={false}
          theme="tint"
        />
        <SportsMarquee />
        <HowItWorks />
        <OrganizerCTA stats={stats} />
      </main>
      <Footer />
    </>
  );
}
