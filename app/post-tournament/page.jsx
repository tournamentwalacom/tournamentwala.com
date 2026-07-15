import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PostTournamentForm from "@/components/PostTournamentForm";
import AuthForm from "@/components/AuthForm";
import { getCurrentUser } from "@/lib/supabaseServer";

export const metadata = {
  title: "Post a tournament — TournamentWala.com",
  description:
    "List your tournament free on TournamentWala. Submit your details and go live once approved.",
};

export default async function PostTournamentPage() {
  const session = await getCurrentUser();

  return (
    <>
      <Navbar />
      <main>
        <section
          className={`section container post-section${
            !session ? " post-section--auth" : ""
          }`}
        >
          {!session ? (
            <div className="post-hero">
              <div className="post-hero-copy">
                <span className="eyebrow">For organizers</span>
                <h1 className="section-title">
                  List your tournament.
                  <br />
                  We&rsquo;ll take it from here.
                </h1>
                <p className="post-intro">
                  Sign in or create a free account to post your tournament —
                  it only takes a moment, and we&rsquo;ll bring you right back
                  here.
                </p>
              </div>
              <AuthForm next="/post-tournament" />
            </div>
          ) : (
            <>
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
              <PostTournamentForm
                initialProfile={{
                  name: session.profile?.full_name || "",
                  phone: session.profile?.phone || "",
                  email: session.profile?.email || session.user.email || "",
                }}
              />
            </>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
