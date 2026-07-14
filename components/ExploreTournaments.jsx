"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

const PAGE_SIZE = 9;

function matchesSearch(ticket, query) {
  if (!query) return true;
  const haystack = [
    ticket.name,
    ticket.venue,
    ticket.city,
    ticket.organizer,
    ticket.sport,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query.toLowerCase());
}

export default function ExploreTournaments({ tickets, sportFacets }) {
  const [search, setSearch] = useState("");
  const [activeSport, setActiveSport] = useState("All");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [frozen, setFrozen] = useState(false);
  const sentinelRef = useRef(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setFrozen(!entry.isIntersecting),
      { rootMargin: "-72px 0px 0px 0px", threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const filtered = useMemo(() => {
    return tickets.filter(
      (t) =>
        (activeSport === "All" || t.sport === activeSport) &&
        matchesSearch(t, search)
    );
  }, [tickets, activeSport, search]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  function handleSearchChange(value) {
    setSearch(value);
    setVisibleCount(PAGE_SIZE);
  }

  function handleSportPick(name) {
    setActiveSport(name);
    setVisibleCount(PAGE_SIZE);
  }

  return (
    <>
      <section className="section container explore-head">
        <div className="explore-head-row">
          <div className="explore-head-text">
            <span className="eyebrow">Explore</span>
            <h1 className="section-title">Explore Tournaments.</h1>
            <p className="post-intro">
              Search tournaments, organizers, venues or cities.
            </p>
          </div>

          <div className="explore-search">
            <svg
              className="explore-search-icon"
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
            >
              <circle
                cx="9"
                cy="9"
                r="6.5"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <path
                d="M14 14l4.5 4.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
            <input
              type="search"
              className="explore-search-input"
              placeholder="Search by tournament, organizer, venue or city…"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              aria-label="Search tournaments"
            />
          </div>
        </div>
      </section>

      <div ref={sentinelRef} aria-hidden="true" />

      <div className={`explore-filter-bar${frozen ? " frozen" : ""}`}>
        <div className="container">
          <div className="explore-frozen-search">
            <svg
              className="explore-search-icon"
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
            >
              <circle
                cx="9"
                cy="9"
                r="6.5"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <path
                d="M14 14l4.5 4.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
            <input
              type="search"
              className="explore-search-input"
              placeholder="Search by tournament, organizer, venue or city…"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              aria-label="Search tournaments"
              tabIndex={frozen ? 0 : -1}
            />
          </div>

          <div className="explore-chip-row">
            <button
              type="button"
              className={`explore-chip${
                activeSport === "All" ? " active" : ""
              }`}
              onClick={() => handleSportPick("All")}
            >
              All Sports
              <span className="explore-chip-count">
                {tickets.length.toLocaleString("en-IN")}
              </span>
            </button>
            {sportFacets.map((facet) => (
              <button
                key={facet.name}
                type="button"
                className={`explore-chip${
                  activeSport === facet.name ? " active" : ""
                }`}
                onClick={() => handleSportPick(facet.name)}
              >
                {facet.name}
                <span className="explore-chip-count">
                  {facet.count.toLocaleString("en-IN")}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className="section container explore-results">
        {filtered.length === 0 ? (
          <div className="tickets-empty">
            No tournaments match{" "}
            {search ? `“${search}”` : `${activeSport}`} yet — try a
            different search or filter.
          </div>
        ) : (
          <>
            <div className="explore-grid">
              {visible.map((t) => (
                <Link
                  href={`/explore/${t.id}`}
                  className="ticket explore-card"
                  key={t.id}
                >
                  <div className="ticket-top">
                    <div className="ticket-sport">
                      <span className="chip">{t.sport}</span>
                      {t.tag && (
                        <span className={`chip ${t.hot ? "chip-hot" : ""}`}>
                          {t.tag}
                        </span>
                      )}
                    </div>
                    <h3>{t.name}</h3>
                    <div className="ticket-facts">
                      <span>
                        📍 <b>{t.venue}, {t.city}</b>
                      </span>
                      <span>
                        🗓️ <b>{t.dateRange}</b>
                      </span>
                      <span>
                        ⚙️ {t.format ? `${t.format} · ` : ""}Entry{" "}
                        <b>{t.entryFee}</b>
                      </span>
                      {t.organizer && (
                        <span>
                          🧑‍💼 By <b>{t.organizer}</b>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="ticket-tear" aria-hidden="true" />

                  <div className="ticket-stub">
                    <div className="prize">
                      <small>Prize pool</small>
                      <span className="amt">{t.prize}</span>
                    </div>
                    <span className="barcode" aria-hidden="true" />
                    <span className="btn btn-stub">Register</span>
                  </div>
                </Link>
              ))}
            </div>

            {hasMore && (
              <div className="explore-show-more-wrap">
                <button
                  type="button"
                  className="btn btn-ghost explore-show-more"
                  onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}
                >
                  Show more
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
}
