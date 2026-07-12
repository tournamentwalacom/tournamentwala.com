export default function Navbar() {
  return (
    <header className="nav">
      <div className="container nav-inner">
        <a href="#" className="brand" aria-label="TournamentWala home">
          {/* Ticket-shaped mark echoing the logo */}
          <svg
            className="brand-mark"
            viewBox="0 0 48 48"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M10 8 L38 4 L41 18 A5 5 0 0 0 41 28 L44 42 L16 46 L13 32 A5 5 0 0 1 13 22 Z"
              fill="#e8283c"
              transform="rotate(-8 24 24)"
            />
            <path
              d="M20 20 h6 v5 h5 M20 30 h6 v-5"
              stroke="#fff"
              strokeWidth="2.4"
              fill="none"
              strokeLinecap="round"
              transform="rotate(-8 24 24)"
            />
          </svg>
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
