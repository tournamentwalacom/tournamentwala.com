import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import LiveTicker from "@/components/LiveTicker";
import Tournaments from "@/components/Tournaments";
import SportsMarquee from "@/components/SportsMarquee";
import HowItWorks from "@/components/HowItWorks";
import OrganizerCTA from "@/components/OrganizerCTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <LiveTicker />
        <Tournaments />
        <SportsMarquee />
        <HowItWorks />
        <OrganizerCTA />
      </main>
      <Footer />
    </>
  );
}
