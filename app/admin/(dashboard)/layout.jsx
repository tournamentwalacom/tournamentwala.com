import { cookies, headers } from "next/headers";
import AdminShell from "@/components/admin/AdminShell";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

export default async function AdminDashboardLayout({ children }) {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  // Set by middleware.js, which already looked these up (fresh from
  // admin_workers for worker sessions) to gate the request — reading them
  // here avoids a second DB round trip just to filter the sidebar.
  const isOwner = headers().get("x-admin-role") === "owner";
  const permissions = (headers().get("x-admin-permissions") || "")
    .split(",")
    .filter(Boolean);

  return (
    <AdminShell email={session?.email} isOwner={isOwner} permissions={permissions}>
      {children}
    </AdminShell>
  );
}
