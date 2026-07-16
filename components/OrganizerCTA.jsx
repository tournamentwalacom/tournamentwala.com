import { formatTournamentsHosted } from "@/lib/tournaments";

export default function OrganizerCTA({ stats }) {
  return (
    <section className="section container" id="organizers">
      <div className="organizer">
        <div>
          <span className="eyebrow" style={{ color: "#ffc42e" }}>
            For organizers
          </span>
          <h2>
            You run the game.
            <br />
            <em>We fill the bracket.</em>
          </h2>
          <p>
            List your tournament free, set entry fees and slots, and let
            players find you. We handle registrations, UPI payments, fixture
            generation, live score pages and winner payouts — you focus on
            match day.
          </p>
          <div className="organizer-actions">
            <button className="btn btn-light">List a tournament — free</button>
            <button className="btn btn-outline-light">
              See organizer tools
            </button>
          </div>
        </div>

        <div className="organizer-stats">
          <div className="stat-row">
            <b>{formatTournamentsHosted(stats?.tournamentsHosted)}</b>
            <span>Tournaments hosted</span>
          </div>
          <div className="stat-row">
            <b>92%</b>
            <span>Slots filled before deadline</span>
          </div>
          <div className="stat-row">
            <b>₹0</b>
            <span>Listing fee, forever</span>
          </div>
          <div className="stat-row">
            <b>48 hrs</b>
            <span>Winner payout guarantee</span>
          </div>
        </div>
      </div>
    </section>
  );
}
