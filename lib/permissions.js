// Single source of truth for the admin tabs a worker account can be granted
// access to. Shared by the worker create/edit form, the sidebar nav filter,
// and middleware.js's per-request permission gate — keep it in sync with
// components/admin/Sidebar.jsx's NAV_ITEMS (the "Admin Panel" tab itself is
// deliberately excluded: only the owner account can manage workers).
export const ADMIN_SECTIONS = [
  { key: "dashboard", label: "Dashboard", path: "/admin", exact: true },
  { key: "analytics", label: "Analytics", path: "/admin/analytics" },
  { key: "tournaments", label: "Tournaments", path: "/admin/tournaments" },
  { key: "organizers", label: "Organizers", path: "/admin/organizers" },
  { key: "players", label: "Players", path: "/admin/players" },
  { key: "payments", label: "Payments", path: "/admin/payments" },
  { key: "pricing", label: "Pricing", path: "/admin/pricing" },
  { key: "expenses", label: "Expenses", path: "/admin/expenses" },
  { key: "blogs", label: "Blogs", path: "/admin/blogs" },
  { key: "queries", label: "Queries", path: "/admin/queries" },
  { key: "settings", label: "Settings", path: "/admin/settings" },
];

export const ADMIN_PERMISSION_KEYS = ADMIN_SECTIONS.map((s) => s.key);

/** The tab-gated section a given /admin/* pathname belongs to, or null for
 * pages that aren't part of the worker-permission system (login, the
 * owner-only admin-panel section, no-access, etc). */
export function sectionKeyForPath(pathname) {
  if (pathname === "/admin") return "dashboard";
  const section = ADMIN_SECTIONS.find(
    (s) => !s.exact && pathname.startsWith(s.path)
  );
  return section?.key || null;
}
