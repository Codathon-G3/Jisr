import { IBM_Plex_Sans_Arabic, Readex_Pro } from "next/font/google";

import "../../docs/design-system/tokens.css";
import "./globals.css";

// Design-system fonts, self-hosted by Next.js (no request to Google from the browser).
const readexPro = Readex_Pro({
  subsets: ["arabic", "latin"],
  weight: ["500", "600"],
  variable: "--font-readex-pro",
  display: "swap",
});

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-plex-sans-arabic",
  display: "swap",
});

export const metadata = {
  title: "جسر | Jisr",
  description: "جسر لطيف نحو شخص تثق به",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${readexPro.variable} ${ibmPlexSansArabic.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
