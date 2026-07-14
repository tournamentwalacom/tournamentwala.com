import "./admin.css";

export const metadata = {
  title: "Admin — TournamentWala",
  robots: { index: false, follow: false },
  icons: {
    icon: "/images/favicon.png",
  },
};

export default function AdminLayout({ children }) {
  return children;
}
