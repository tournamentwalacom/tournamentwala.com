"use client";

import { useState } from "react";
import { requestAndBroadcastLocation } from "@/lib/locationConsent";
import { formatPrizesPaidOut, formatTeamsCount } from "@/lib/tournaments";

export default function Hero({ stats }) {
  const [locationError, setLocationError] = useState(false);

  function handleFindNearby() {
    setLocationError(false);
    requestAndBroadcastLocation({
      onSuccess: () => {
        document
          .getElementById("nearby-tournaments")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      },
      onError: () => setLocationError(true),
    });
  }

  return (
    <section className="hero">
      <div className="container hero-grid">
        <div className="hero-columns">
          <div className="hero-col-left">
            <span className="hero-kicker">
              <span className="pulse-dot" aria-hidden="true" />
              <span className="hero-kicker-text">
                2,300+ tournaments live across 40 Indian cities
              </span>
            </span>

            <h1 className="hero-title" aria-label="Find. Play. Win.">
              <span className="hero-title-line">
                <span className="word word-find">Find.</span>{" "}
                <span className="word word-play">Play.</span>
              </span>{" "}
              <span className="word word-win">Win.</span>
            </h1>
          </div>

          <div className="hero-col-right">
            <p className="hero-sub">
              TournamentWala is India&rsquo;s tournament marketplace. Discover
              <strong> cricket, badminton, football, kabaddi and esports </strong>
              events near you, register your team in minutes, and chase real
              prize pools — no phone calls, no paper forms.
            </p>

            <div className="hero-actions">
              <div className="finder" aria-label="Find tournaments">
                <select aria-label="Choose a sport" defaultValue="">
                  <option value="" disabled>
                    Pick a sport
                  </option>
                  <option>Cricket</option>
                  <option>Badminton</option>
                  <option>Football</option>
                  <option>Kabaddi</option>
                  <option>Table Tennis</option>
                  <option>Chess</option>
                  <option>BGMI / Esports</option>
                </select>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleFindNearby}
                >
                  Find nearby tournament →
                </button>
              </div>

              {locationError && (
                <p className="hero-location-error">
                  Couldn&rsquo;t get your location —{" "}
                  <a href="/explore-tournaments">browse all tournaments</a>{" "}
                  instead.
                </p>
              )}

              <div className="hero-meta">
                <span>
                  <b>48 hrs</b> avg. slot sell-out
                </span>
                <span>
                  <b>{formatPrizesPaidOut(stats?.prizesPaidOut)}</b> prizes paid out
                </span>
                <span>
                  <b>{formatTeamsCount(stats?.totalTeams)}</b> Teams
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
