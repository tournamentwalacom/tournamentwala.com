import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Page Not Found — TournamentWala.com",
};

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="notfound">
        <div className="container notfound-inner">
          <span className="eyebrow">Error 404</span>
          <h1 className="notfound-title">
            Out Of <span className="notfound-title-accent">Bounds.</span>
          </h1>
          <p className="notfound-text">
            This page got knocked out in the group stage. The match, tournament,
            or page you're looking for doesn't exist or has moved.
          </p>
          <div className="notfound-actions">
            <Link href="/" className="btn btn-primary">
              Back To Home
            </Link>
            <Link href="/explore-tournaments" className="btn btn-ghost">
              Explore Tournaments
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
