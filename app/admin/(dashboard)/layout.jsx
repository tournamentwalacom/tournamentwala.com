import { cookies } from "next/headers";
import AdminShell from "@/components/admin/AdminShell";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

export default async function AdminDashboardLayout({ children }) {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  return <AdminShell email={session?.email}>{children}</AdminShell>;
}
