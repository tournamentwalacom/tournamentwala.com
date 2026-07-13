"use client";

import { useRouter } from "next/navigation";

export default function Topbar({ email }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <header className="admin-topbar">
      <div className="admin-topbar-title">Dashboard</div>
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
