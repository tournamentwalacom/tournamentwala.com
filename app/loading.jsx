import Navbar from "@/components/Navbar";
import TicketLoader from "@/components/TicketLoader";

export default function Loading() {
  return (
    <>
      <Navbar />
      <TicketLoader page belowNav size="lg" />
    </>
  );
}
