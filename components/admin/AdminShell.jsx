"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/admin/Sidebar";
import Topbar from "@/components/admin/Topbar";

const COLLAPSE_KEY = "tw_admin_sidebar_collapsed";

export default function AdminShell({ email, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(localStorage.getItem(COLLAPSE_KEY) === "1");
  }, []);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      return next;
    });
  }

  return (
    <div className={`admin-shell${collapsed ? " admin-shell--collapsed" : ""}`}>
      <Sidebar
        open={mobileOpen}
        collapsed={collapsed}
        onNavigate={() => setMobileOpen(false)}
      />
      {mobileOpen && (
        <div
          className="admin-backdrop"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}
      <div className="admin-main">
        <Topbar
          email={email}
          collapsed={collapsed}
          onMenuClick={() => setMobileOpen(true)}
          onCollapseClick={toggleCollapsed}
        />
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
