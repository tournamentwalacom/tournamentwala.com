"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

function DashboardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 13h6V4H4v9Zm0 7h6v-5H4v5Zm10 0h6V11h-6v9Zm0-16v5h6V4h-6Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TournamentsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M8 21h8M12 17v4M6 4h12v3a6 6 0 0 1-12 0V4Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 5H3v2a3 3 0 0 0 3 3M18 5h3v2a3 3 0 0 1-3 3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function OrganizersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M17 20v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M10 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM19 8a3 3 0 0 1 0 6M21 20v-2a3 3 0 0 0-2-2.83"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PaymentsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect
        x="3"
        y="6"
        width="18"
        height="13"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path d="M3 10h18" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function PricingIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3v18M17 7.5c0-1.66-2.24-3-5-3s-5 1.34-5 3 2.24 3 5 3 5 1.34 5 3-2.24 3-5 3-5-1.34-5-3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AnalyticsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 20V10M11 20V4M18 20v-7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ExpensesIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 7a2 2 0 0 1 2-2h11l3 3v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M16 11a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function BlogsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 4h11l3 3v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M8 9h8M8 13h8M8 17h5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function QueriesIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 5h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H8l-4 4V6a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 10h8M8 14h5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PlayersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M5 20c0-3.3 3.13-6 7-6s7 2.7 7 6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AdminPanelIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3 4 6v6c0 4.5 3.2 7.9 8 9 4.8-1.1 8-4.5 8-9V6l-8-3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M9 12l2 2 4-4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1.08 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const NAV_ITEMS = [
  { href: "/admin", key: "dashboard", label: "Dashboard", exact: true, icon: DashboardIcon },
  { href: "/admin/analytics", key: "analytics", label: "Analytics", icon: AnalyticsIcon },
  { href: "/admin/tournaments", key: "tournaments", label: "Tournaments", icon: TournamentsIcon },
  { href: "/admin/organizers", key: "organizers", label: "Organizers", icon: OrganizersIcon },
  { href: "/admin/players", key: "players", label: "Players", icon: PlayersIcon },
  { href: "/admin/payments", key: "payments", label: "Payments", icon: PaymentsIcon },
  { href: "/admin/pricing", key: "pricing", label: "Pricing", icon: PricingIcon },
  { href: "/admin/expenses", key: "expenses", label: "Expenses", icon: ExpensesIcon },
  { href: "/admin/blogs", key: "blogs", label: "Blogs", icon: BlogsIcon },
  { href: "/admin/queries", key: "queries", label: "Queries", icon: QueriesIcon },
  { href: "/admin/settings", key: "settings", label: "Settings", icon: SettingsIcon },
];

// Only the owner account can create/edit worker logins and their tab
// access — kept out of NAV_ITEMS (and off the worker permission list in
// lib/permissions.js) so it's never something a worker could be granted.
const ADMIN_PANEL_ITEM = {
  href: "/admin/admin-panel",
  label: "Admin Panel",
  icon: AdminPanelIcon,
};

export default function Sidebar({
  open = false,
  collapsed = false,
  isOwner = false,
  permissions = [],
  onNavigate,
}) {
  const pathname = usePathname();

  useEffect(() => {
    onNavigate?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const items = isOwner
    ? NAV_ITEMS
    : NAV_ITEMS.filter((item) => permissions.includes(item.key));

  return (
    <aside
      className={`admin-sidebar${open ? " admin-sidebar--open" : ""}${
        collapsed ? " admin-sidebar--collapsed" : ""
      }`}
    >
      <Link href="/admin" className="admin-brand" aria-label="TournamentWala admin home">
        <Image
          className="admin-brand-logo"
          src="/images/logo.png"
          alt="TournamentWala logo"
          width={34}
          height={34}
          priority
        />
        <span className="admin-brand-word">
          tournament<em>wala</em>
          <small>ADMIN</small>
        </span>
      </Link>

      <nav className="admin-nav" aria-label="Admin">
        {items.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`admin-nav-link${active ? " active" : ""}`}
              title={collapsed ? item.label : undefined}
            >
              <span className="admin-nav-icon">
                <Icon />
              </span>
              <span className="admin-nav-label">{item.label}</span>
            </Link>
          );
        })}

        {isOwner && (
          <>
            <div className="admin-nav-divider" role="separator" />
            <Link
              href={ADMIN_PANEL_ITEM.href}
              className={`admin-nav-link${
                pathname.startsWith(ADMIN_PANEL_ITEM.href) ? " active" : ""
              }`}
              title={collapsed ? ADMIN_PANEL_ITEM.label : undefined}
            >
              <span className="admin-nav-icon">
                <AdminPanelIcon />
              </span>
              <span className="admin-nav-label">{ADMIN_PANEL_ITEM.label}</span>
            </Link>
          </>
        )}
      </nav>
    </aside>
  );
}
