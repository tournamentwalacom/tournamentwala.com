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
        <SportsMarquee />
        <HowItWorks />
        <OrganizerCTA />
      </main>
      <Footer />
    </>
  );
}
