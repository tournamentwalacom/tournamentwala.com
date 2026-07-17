"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabaseBrowser";

function FilterList({ items, search, onSearchChange, emptyLabel, onPick }) {
  const filtered = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="nav-dd-body">
      <input
        type="search"
        className="nav-dd-search"
        placeholder="Search…"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        aria-label="Search"
      />
      <div className="nav-dd-list" role="listbox">
        {items.length === 0 && (
          <p className="nav-dd-empty">No live tournaments yet.</p>
        )}
        {items.length > 0 && filtered.length === 0 && (
          <p className="nav-dd-empty">No matches for &ldquo;{search}&rdquo;.</p>
        )}
        {filtered.map((item) => (
          <button
            key={item.name}
            type="button"
            className="nav-dd-item"
            onClick={() => onPick(item.name)}
          >
            <span>{item.name}</span>
            <span className="nav-dd-count">{item.count}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function NavMenu({ sports, cities, organizerName }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null); // 'sports' | 'cities' | 'account' | null
  const [sportSearch, setSportSearch] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const navRef = useRef(null);

  async function handleLogOut() {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    closeAll();
    router.refresh();
  }

  const firstName = organizerName ? organizerName.split(" ")[0] : null;

  useEffect(() => {
    function handleClickOutside(e) {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    }
    function handleEscape(e) {
      if (e.key === "Escape") {
        setOpenDropdown(null);
        setMobileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth > 1120) {
        setMobileOpen(false);
      }
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = mobileOpen ? "hidden" : "";
    document.documentElement.classList.toggle("nav-open", mobileOpen);
    return () => {
      document.documentElement.style.overflow = "";
      document.documentElement.classList.remove("nav-open");
    };
  }, [mobileOpen]);

  function goToFilter(param, value) {
    router.push(`/explore-tournaments?${param}=${encodeURIComponent(value)}`);
    closeAll();
  }

  function toggleDropdown(name) {
    setOpenDropdown((current) => (current === name ? null : name));
  }

  function closeAll() {
    setMobileOpen(false);
    setOpenDropdown(null);
  }

  const isHome = pathname === "/";

  return (
    <div className="nav-menu" ref={navRef}>
      {/* ---------------- Desktop ---------------- */}
      <nav className="nav-links" aria-label="Main">
        <Link href="/" className={isHome ? "active" : undefined}>
          Home
        </Link>
        <Link
          href="/explore-tournaments"
          className={pathname === "/explore-tournaments" ? "active" : undefined}
        >
          Explore
        </Link>

        <div className="nav-dd">
          <button
            type="button"
            className={`nav-dd-trigger${openDropdown === "sports" ? " open" : ""}`}
            onClick={() => toggleDropdown("sports")}
            aria-expanded={openDropdown === "sports"}
          >
            Sports <span className="caret" aria-hidden="true">▾</span>
          </button>
          {openDropdown === "sports" && (
            <div className="nav-dd-panel">
              <FilterList
                items={sports}
                search={sportSearch}
                onSearchChange={setSportSearch}
                onPick={(name) => goToFilter("sport", name)}
              />
            </div>
          )}
        </div>

        <div className="nav-dd">
          <button
            type="button"
            className={`nav-dd-trigger${openDropdown === "cities" ? " open" : ""}`}
            onClick={() => toggleDropdown("cities")}
            aria-expanded={openDropdown === "cities"}
          >
            Cities <span className="caret" aria-hidden="true">▾</span>
          </button>
          {openDropdown === "cities" && (
            <div className="nav-dd-panel">
              <FilterList
                items={cities}
                search={citySearch}
                onSearchChange={setCitySearch}
                onPick={(name) => goToFilter("city", name)}
              />
            </div>
          )}
        </div>

        <Link href="/about" className={pathname === "/about" ? "active" : undefined}>
          About
        </Link>
        <Link href="/contact" className={pathname === "/contact" ? "active" : undefined}>
          Contact Us
        </Link>
      </nav>

      <Link href="/post-tournament" className="btn btn-primary nav-cta">
        <span className="nav-cta-icon" aria-hidden="true">+</span>
        Post Tournament
      </Link>

      {firstName && (
        <div className="nav-dd nav-account">
          <button
            type="button"
            className={`nav-account-trigger${openDropdown === "account" ? " open" : ""}`}
            onClick={() => toggleDropdown("account")}
            aria-expanded={openDropdown === "account"}
            aria-haspopup="true"
          >
            <span className="nav-avatar" aria-hidden="true">
              {firstName.charAt(0).toUpperCase()}
            </span>
            <span className="nav-account-name">{firstName}</span>
            <span className="caret" aria-hidden="true">▾</span>
          </button>
          {openDropdown === "account" && (
            <div className="nav-dd-panel nav-account-panel">
              <div className="nav-account-header">
                <span className="nav-avatar nav-avatar-lg" aria-hidden="true">
                  {firstName.charAt(0).toUpperCase()}
                </span>
                <div>
                  <p className="nav-account-greeting">Hi, {firstName}</p>
                  <p className="nav-account-sub">Manage your account</p>
                </div>
              </div>
              <Link href="/profile" className="nav-dd-item" onClick={closeAll}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.6" />
                  <path
                    d="M2.5 14c.7-3 3-4.5 5.5-4.5s4.8 1.5 5.5 4.5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
                Profile
              </Link>
              <button
                type="button"
                className="nav-dd-item nav-dd-item-danger"
                onClick={handleLogOut}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path
                    d="M6.5 14H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h3.5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M10.5 11l3-3-3-3M13.2 8H6"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Log out
              </button>
            </div>
          )}
        </div>
      )}

      {/* ---------------- Mobile ---------------- */}
      <button
        type="button"
        className={`nav-toggle${mobileOpen ? " open" : ""}`}
        aria-label={mobileOpen ? "Close menu" : "Open menu"}
        aria-expanded={mobileOpen}
        aria-controls="mobile-nav-drawer"
        onClick={() => setMobileOpen((v) => !v)}
      >
        <span className="nav-toggle-bars" aria-hidden="true">
          <span className="bar bar-1" />
          <span className="bar bar-2" />
          <span className="bar bar-3" />
        </span>
      </button>

      <div
        className={`nav-overlay${mobileOpen ? " open" : ""}`}
        onClick={closeAll}
        aria-hidden="true"
      />

      <aside
        id="mobile-nav-drawer"
        className={`nav-drawer${mobileOpen ? " open" : ""}`}
        aria-hidden={!mobileOpen}
      >
        <div className="nav-drawer-head">
          <a href="/" className="brand" onClick={closeAll} aria-label="TournamentWala home">
            <Image
              className="brand-mark"
              src="/images/logo.png"
              alt=""
              width={42}
              height={42}
            />
            <span className="brand-word">
              tournament<em>wala</em>
            </span>
          </a>
          <button
            type="button"
            className="nav-drawer-close"
            aria-label="Close menu"
            onClick={closeAll}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M1 1L15 15M15 1L1 15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <nav className="nav-drawer-links" aria-label="Mobile">
          <Link
            href="/"
            className={`nav-drawer-link${isHome ? " active" : ""}`}
            style={{ "--i": 0 }}
            onClick={closeAll}
          >
            <span className="idx">01</span>
            <span>Home</span>
          </Link>
          <Link
            href="/explore-tournaments"
            className={`nav-drawer-link${
              pathname === "/explore-tournaments" ? " active" : ""
            }`}
            style={{ "--i": 1 }}
            onClick={closeAll}
          >
            <span className="idx">02</span>
            <span>Explore</span>
          </Link>

          <div className="nav-accordion" style={{ "--i": 2 }}>
            <button
              type="button"
              className={`nav-accordion-trigger${
                openDropdown === "sports" ? " open" : ""
              }`}
              onClick={() => toggleDropdown("sports")}
              aria-expanded={openDropdown === "sports"}
            >
              <span><span className="idx">03</span> Sports</span>
              <span className="caret" aria-hidden="true">▾</span>
            </button>
            {openDropdown === "sports" && (
              <FilterList
                items={sports}
                search={sportSearch}
                onSearchChange={setSportSearch}
                onPick={(name) => goToFilter("sport", name)}
              />
            )}
          </div>

          <div className="nav-accordion" style={{ "--i": 3 }}>
            <button
              type="button"
              className={`nav-accordion-trigger${
                openDropdown === "cities" ? " open" : ""
              }`}
              onClick={() => toggleDropdown("cities")}
              aria-expanded={openDropdown === "cities"}
            >
              <span><span className="idx">04</span> Cities</span>
              <span className="caret" aria-hidden="true">▾</span>
            </button>
            {openDropdown === "cities" && (
              <FilterList
                items={cities}
                search={citySearch}
                onSearchChange={setCitySearch}
                onPick={(name) => goToFilter("city", name)}
              />
            )}
          </div>

          <Link
            href="/about"
            className={`nav-drawer-link${pathname === "/about" ? " active" : ""}`}
            style={{ "--i": 4 }}
            onClick={closeAll}
          >
            <span className="idx">05</span>
            <span>About</span>
          </Link>
          <Link
            href="/contact"
            className={`nav-drawer-link${pathname === "/contact" ? " active" : ""}`}
            style={{ "--i": 5 }}
            onClick={closeAll}
          >
            <span className="idx">06</span>
            <span>Contact Us</span>
          </Link>
          <Link
            href="/post-tournament"
            className="btn btn-primary nav-cta nav-drawer-cta"
            style={{ "--i": 6 }}
            onClick={closeAll}
          >
            <span className="nav-cta-icon" aria-hidden="true">+</span>
            Post Tournament
          </Link>
        </nav>

        <div className="nav-drawer-foot">
          {firstName && (
            <div className="nav-drawer-account">
              <div className="nav-drawer-account-info">
                <span className="nav-avatar nav-avatar-lg" aria-hidden="true">
                  {firstName.charAt(0).toUpperCase()}
                </span>
                <div>
                  <p className="nav-drawer-account-name">{firstName}</p>
                  <p className="nav-drawer-account-sub">View your profile</p>
                </div>
              </div>
              <div className="nav-drawer-account-actions">
                <Link href="/profile" className="nav-drawer-link" onClick={closeAll}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.6" />
                    <path
                      d="M2.5 14c.7-3 3-4.5 5.5-4.5s4.8 1.5 5.5 4.5"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span>Profile</span>
                </Link>
                <button
                  type="button"
                  className="nav-drawer-link nav-drawer-logout"
                  onClick={handleLogOut}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path
                      d="M6.5 14H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h3.5"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M10.5 11l3-3-3-3M13.2 8H6"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>Log out</span>
                </button>
              </div>
            </div>
          )}
          <p className="nav-drawer-tag">
            Find. Play. <em>Win.</em>
          </p>
        </div>
      </aside>
    </div>
  );
}
