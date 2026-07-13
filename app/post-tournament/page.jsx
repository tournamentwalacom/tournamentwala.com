import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PostTournamentForm from "@/components/PostTournamentForm";

export const metadata = {
  title: "Post a tournament — TournamentWala.com",
  description:
    "List your tournament free on TournamentWala. Submit your details and go live once approved.",
};

export default function PostTournamentPage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="section container post-section">
          <span className="eyebrow">For organizers</span>
          <h1 className="section-title">
            List your tournament.
            <br />
            We&rsquo;ll take it from here.
          </h1>
          <p className="post-intro">
            Fill in the details below — it&rsquo;s free. Our team reviews
            every submission before it goes live, usually within 24–48 hrs.
          </p>
          <PostTournamentForm />
        </section>
      </main>
      <Footer />
    </>
  );
}
