import { Inter, Poppins } from "next/font/google";

import "bootstrap/dist/css/bootstrap.min.css";
import "react-photo-view/dist/react-photo-view.css";
import "./globals.css";

import Footer from "@/components/layout/Footer";
import NavBar from "@/components/layout/NavBar";
import Providers from "@/components/providers/Providers";
import { themeBootScript } from "@/components/providers/ThemeProvider";
import { auth } from "@/auth";

// Self-hosted by next/font, so no request leaves for fonts.googleapis.com and
// the strict `style-src 'self'` in the CSP holds.
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: {
    default: "Tuition Me | Learn Without Limits",
    template: "%s | Tuition Me",
  },
  description:
    "Tuition Me — find expert tutors and enroll in live, one-on-one and group courses across Math, Science, Programming, Languages and more.",
  keywords: ["tuition", "tutoring", "online courses", "learn", "education", "tutors"],
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/favicon.ico",
    apple: "/logo192.png",
  },
  robots: { index: true, follow: true },
};

export const viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }) {
  // Resolving the session here means the first HTML the browser receives
  // already reflects who is signed in — no "logged out" flash in the navbar.
  const session = await auth();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${poppins.variable} ${inter.variable}`}
    >
      <head>
        {/* Sets data-theme before first paint. See themeBootScript. */}
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body>
        <Providers session={session}>
          <div className="min-vh-100 d-flex flex-column">
            <NavBar />
            <div className="flex-grow-1">{children}</div>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
