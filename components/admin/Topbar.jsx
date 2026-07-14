"use client";

import { useRouter } from "next/navigation";

export default function Topbar({ email, collapsed, onMenuClick, onCollapseClick }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <header className="admin-topbar">
      <div className="admin-topbar-left">
        <button
          type="button"
          className="admin-hamburger-btn"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M4 6h16M4 12h16M4 18h16"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <button
          type="button"
          className="admin-collapse-btn"
          onClick={onCollapseClick}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-pressed={collapsed}
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M4 6h16M4 12h10M4 18h16"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <div className="admin-topbar-title">Dashboard</div>
      </div>
      <div className="admin-topbar-user">
        <span className="admin-avatar">
          {email ? email[0].toUpperCase() : "A"}
        </span>
        <span>{email || "Admin"}</span>
        <button className="admin-logout-btn" onClick={handleLogout}>
          Log out
        </button>
      </div>
    </header>
  );
}
