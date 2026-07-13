import Image from "next/image";

export default function Navbar() {
  return (
    <header className="nav">
      <div className="container nav-inner">
        <a href="#" className="brand" aria-label="TournamentWala home">
          <Image
            className="brand-mark"
            src="/images/favicon.png"
            alt="TournamentWala logo"
            width={40}
            height={40}
            priority
          />
          <span className="brand-word">
            tournament<em>wala</em>
            <small>FIND · PLAY · WIN</small>
          </span>
        </a>

        <nav className="nav-links" aria-label="Main">
          <a href="#tournaments">Tournaments</a>
          <a href="#how">How it works</a>
          <a href="#organizers">For organizers</a>
        </nav>

        <button className="btn btn-primary">List your tournament</button>
      </div>
    </header>
  );
}
