import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PostTournamentForm from "@/components/PostTournamentForm";
import AuthForm from "@/components/AuthForm";
import CompleteProfileForm from "@/components/CompleteProfileForm";
import { getCurrentUser } from "@/lib/supabaseServer";

export const metadata = {
  title: "Post a tournament — TournamentWala.com",
  description:
    "List your tournament free on TournamentWala. Submit your details and go live once approved.",
};

export default async function PostTournamentPage() {
  const session = await getCurrentUser();
  const needsProfile =
    session && (!session.profile?.full_name || !session.profile?.phone);

  return (
    <>
      <Navbar />
      <main>
        <section
          className={`section container post-section${
            !session || needsProfile ? " post-section--auth" : ""
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
          ) : needsProfile ? (
            <div className="post-hero">
              <div className="post-hero-copy">
                <span className="eyebrow">For organizers</span>
                <h1 className="section-title">
                  Almost there.
                </h1>
                <p className="post-intro">
                  We just need your name and phone number before you can post
                  a tournament.
                </p>
              </div>
              <CompleteProfileForm
                initialName={session.profile?.full_name || ""}
                initialPhone={session.profile?.phone || ""}
              />
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
