import "./globals.css";
import AuthCodeCatcher from "@/components/AuthCodeCatcher";

export const metadata = {
  title: "TournamentWala.com — Find. Play. Win.",
  description:
    "India's tournament marketplace. Discover cricket, badminton, football, kabaddi and esports tournaments near you. Register in minutes, play for real prize pools.",
  icons: {
    icon: "/images/favicon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Anton&family=Archivo:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthCodeCatcher />
        {children}
      </body>
    </html>
  );
}
