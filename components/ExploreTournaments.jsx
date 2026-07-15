"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { haversineDistanceKm } from "@/lib/geo";
import {
  LOCATION_CHOICE_KEY,
  LOCATION_DISMISSED_KEY,
  requestLocation,
} from "@/lib/locationConsent";

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

export default function ExploreTournaments({
  tickets,
  sportFacets,
  cityFacets,
  initialSport,
  initialCity,
}) {
  const [search, setSearch] = useState("");
  const [activeSport, setActiveSport] = useState(() =>
    initialSport && sportFacets.some((f) => f.name === initialSport)
      ? initialSport
      : "All"
  );
  const [activeCity, setActiveCity] = useState(() =>
    initialCity && cityFacets.some((f) => f.name === initialCity)
      ? initialCity
      : "All"
  );
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [filterOpen, setFilterOpen] = useState(false);
  const [panelQuery, setPanelQuery] = useState("");
  const [frozen, setFrozen] = useState(false);
  const [userCoords, setUserCoords] = useState(null);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const filterRef = useRef(null);
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (!filterOpen) return;
    function handleClick(e) {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false);
      }
    }
    function handleKey(e) {
      if (e.key === "Escape") setFilterOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [filterOpen]);

  useEffect(() => {
    if (!filterOpen) setPanelQuery("");
  }, [filterOpen]);

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

  // Nearest-first sorting needs the visitor's coordinates. We only ask
  // once — a prior "granted" silently re-fetches position, a prior
  // "denied" is respected, and a prior in-session "not now" isn't re-asked
  // until the next visit.
  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;

    const choice = localStorage.getItem(LOCATION_CHOICE_KEY);
    if (choice === "granted") {
      requestLocation({ onSuccess: setUserCoords });
      return;
    }
    if (choice === "denied") return;
    if (sessionStorage.getItem(LOCATION_DISMISSED_KEY)) return;

    setShowLocationPrompt(true);
  }, []);

  function handleAllowLocation() {
    requestLocation({
      onSuccess: (coords) => {
        setUserCoords(coords);
        setShowLocationPrompt(false);
      },
      onError: () => setShowLocationPrompt(false),
    });
  }

  function handleDismissLocationPrompt() {
    sessionStorage.setItem(LOCATION_DISMISSED_KEY, "1");
    setShowLocationPrompt(false);
  }

  const filtered = useMemo(() => {
    const matches = tickets.filter(
      (t) =>
        (activeSport === "All" || t.sport === activeSport) &&
        (activeCity === "All" || t.city === activeCity) &&
        matchesSearch(t, search)
    );

    if (!userCoords) return matches;

    // Nearest first; tournaments without geocoded coordinates sink to the
    // end but keep their relative (date-ascending) order — sort is stable.
    return [...matches].sort((a, b) => {
      const distanceA =
        a.latitude != null && a.longitude != null
          ? haversineDistanceKm(userCoords.lat, userCoords.lng, a.latitude, a.longitude)
          : Infinity;
      const distanceB =
        b.latitude != null && b.longitude != null
          ? haversineDistanceKm(userCoords.lat, userCoords.lng, b.latitude, b.longitude)
          : Infinity;
      return distanceA - distanceB;
    });
  }, [tickets, activeSport, activeCity, search, userCoords]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;
  const activeFilterCount =
    (activeSport !== "All" ? 1 : 0) + (activeCity !== "All" ? 1 : 0);

  const panelSportFacets = useMemo(
    () =>
      sportFacets.filter((f) =>
        f.name.toLowerCase().includes(panelQuery.toLowerCase())
      ),
    [sportFacets, panelQuery]
  );
  const panelCityFacets = useMemo(
    () =>
      cityFacets.filter((f) =>
        f.name.toLowerCase().includes(panelQuery.toLowerCase())
      ),
    [cityFacets, panelQuery]
  );

  function handleSearchChange(value) {
    setSearch(value);
    setVisibleCount(PAGE_SIZE);
  }

  function handleSportPick(name) {
    setActiveSport(name);
    setVisibleCount(PAGE_SIZE);
  }

  function handleCityPick(name) {
    setActiveCity(name);
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

      {showLocationPrompt && (
        <div className="explore-location-banner container">
          <span className="explore-location-banner-text">
            📍 Show tournaments near you first?
          </span>
          <div className="explore-location-banner-actions">
            <button
              type="button"
              className="explore-location-btn explore-location-btn-dismiss"
              onClick={handleDismissLocationPrompt}
            >
              Not now
            </button>
            <button
              type="button"
              className="explore-location-btn explore-location-btn-allow"
              onClick={handleAllowLocation}
            >
              Allow location
            </button>
          </div>
        </div>
      )}

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

          <div className="explore-filter-wrap" ref={filterRef}>
            <div className="explore-filter-row">
              <button
                type="button"
                className={`explore-filter-toggle${
                  filterOpen ? " open" : ""
                }`}
                onClick={() => setFilterOpen((v) => !v)}
                aria-expanded={filterOpen}
              >
                <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path
                    d="M3 5.5h14M6 10h8M8.5 14.5h3"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
                Filters
                {activeFilterCount > 0 && (
                  <span className="explore-filter-badge">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {activeSport !== "All" && (
                <button
                  type="button"
                  className="explore-active-pill"
                  onClick={() => handleSportPick("All")}
                >
                  {activeSport}
                  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <path
                      d="M6 6l8 8M14 6l-8 8"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              )}

              {activeCity !== "All" && (
                <button
                  type="button"
                  className="explore-active-pill"
                  onClick={() => handleCityPick("All")}
                >
                  {activeCity}
                  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <path
                      d="M6 6l8 8M14 6l-8 8"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              )}

              {search && (
                <button
                  type="button"
                  className="explore-active-pill"
                  onClick={() => handleSearchChange("")}
                >
                  “{search}”
                  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <path
                      d="M6 6l8 8M14 6l-8 8"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              )}
            </div>

            {filterOpen && (
              <div className="explore-filter-panel">
                <div className="explore-filter-panel-search">
                  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
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
                    placeholder="Search sports or cities…"
                    value={panelQuery}
                    onChange={(e) => setPanelQuery(e.target.value)}
                    aria-label="Search sports or cities"
                  />
                </div>

                <div className="explore-filter-panel-group">
                  <span className="explore-filter-panel-label">Sport</span>
                  <div className="explore-filter-panel-options">
                    {!panelQuery && (
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
                    )}
                    {panelSportFacets.map((facet) => (
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
                    {panelQuery && panelSportFacets.length === 0 && (
                      <span className="explore-filter-panel-empty">
                        No sports match “{panelQuery}”
                      </span>
                    )}
                  </div>
                </div>

                <div className="explore-filter-panel-group">
                  <span className="explore-filter-panel-label">City</span>
                  <div className="explore-filter-panel-options">
                    {!panelQuery && (
                      <button
                        type="button"
                        className={`explore-chip${
                          activeCity === "All" ? " active" : ""
                        }`}
                        onClick={() => handleCityPick("All")}
                      >
                        All Cities
                        <span className="explore-chip-count">
                          {tickets.length.toLocaleString("en-IN")}
                        </span>
                      </button>
                    )}
                    {panelCityFacets.map((facet) => (
                      <button
                        key={facet.name}
                        type="button"
                        className={`explore-chip${
                          activeCity === facet.name ? " active" : ""
                        }`}
                        onClick={() => handleCityPick(facet.name)}
                      >
                        {facet.name}
                        <span className="explore-chip-count">
                          {facet.count.toLocaleString("en-IN")}
                        </span>
                      </button>
                    ))}
                    {panelQuery && panelCityFacets.length === 0 && (
                      <span className="explore-filter-panel-empty">
                        No cities match “{panelQuery}”
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <section className="section container explore-results">
        {filtered.length === 0 ? (
          <div className="tickets-empty">
            No tournaments match{" "}
            {search
              ? `“${search}”`
              : [activeSport, activeCity].filter((v) => v !== "All").join(" · ") ||
                "your filters"}{" "}
            yet — try a different search or filter.
          </div>
        ) : (
          <>
            <div className="explore-grid">
              {visible.map((t) => (
                <Link
                  href={`/explore/${t.slug}`}
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
