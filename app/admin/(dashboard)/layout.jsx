import { cookies } from "next/headers";
import Sidebar from "@/components/admin/Sidebar";
import Topbar from "@/components/admin/Topbar";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

export default async function AdminDashboardLayout({ children }) {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  return (
    <div className="admin-shell">
      <Sidebar />
      <div className="admin-main">
        <Topbar email={session?.email} />
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
