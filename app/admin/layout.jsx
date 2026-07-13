import "./admin.css";
import Sidebar from "@/components/admin/Sidebar";
import Topbar from "@/components/admin/Topbar";

export const metadata = {
  title: "Admin — TournamentWala",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }) {
  return (
    <div className="admin-shell">
      <Sidebar />
      <div className="admin-main">
        <Topbar />
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
