"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

export default function NavMenu({ sports, cities }) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null); // 'sports' | 'cities' | null
  const [sportSearch, setSportSearch] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const navRef = useRef(null);

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
    document.documentElement.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [mobileOpen]);

  function goToFilter(param, value) {
    router.push(`/?${param}=${encodeURIComponent(value)}#tournaments`);
    setOpenDropdown(null);
    setMobileOpen(false);
  }

  function toggleDropdown(name) {
    setOpenDropdown((current) => (current === name ? null : name));
  }

  return (
    <div className="nav-menu" ref={navRef}>
      {/* ---------------- Desktop ---------------- */}
      <nav className="nav-links" aria-label="Main">
        <Link href="/">Home</Link>
        <a href="/#tournaments">Explore</a>

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

        <Link href="/about">About</Link>
        <Link href="/contact">Contact Us</Link>
      </nav>

      <Link href="/post-tournament" className="btn btn-primary nav-cta">
        + Post Tournament
      </Link>

      {/* ---------------- Mobile ---------------- */}
      <button
        type="button"
        className="nav-toggle"
        aria-label={mobileOpen ? "Close menu" : "Open menu"}
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen((v) => !v)}
      >
        <span className={`nav-toggle-bar${mobileOpen ? " open" : ""}`} />
      </button>

      <div className={`nav-drawer${mobileOpen ? " open" : ""}`}>
        <Link href="/" onClick={() => setMobileOpen(false)}>
          Home
        </Link>
        <a href="/#tournaments" onClick={() => setMobileOpen(false)}>
          Explore
        </a>

        <div className="nav-accordion">
          <button
            type="button"
            className={`nav-accordion-trigger${
              openDropdown === "sports" ? " open" : ""
            }`}
            onClick={() => toggleDropdown("sports")}
            aria-expanded={openDropdown === "sports"}
          >
            Sports <span className="caret" aria-hidden="true">▾</span>
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

        <div className="nav-accordion">
          <button
            type="button"
            className={`nav-accordion-trigger${
              openDropdown === "cities" ? " open" : ""
            }`}
            onClick={() => toggleDropdown("cities")}
            aria-expanded={openDropdown === "cities"}
          >
            Cities <span className="caret" aria-hidden="true">▾</span>
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

        <Link href="/about" onClick={() => setMobileOpen(false)}>
          About
        </Link>
        <Link href="/contact" onClick={() => setMobileOpen(false)}>
          Contact Us
        </Link>

        <Link
          href="/post-tournament"
          className="btn btn-primary nav-cta"
          onClick={() => setMobileOpen(false)}
        >
          + Post Tournament
        </Link>
      </div>
    </div>
  );
}
