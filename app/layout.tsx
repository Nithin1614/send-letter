import type { Metadata } from "next";
import {
  Playfair_Display,
  Crimson_Pro,
  Cormorant_Garamond,
  Dancing_Script,
  Great_Vibes,
  Caveat,
  Pacifico,
  Special_Elite,
  Sacramento,
  Parisienne,
} from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap" });
const crimson  = Crimson_Pro({ subsets: ["latin"], weight: ["200","300","400","600","700"], variable: "--font-crimson", display: "swap" });
const cormorant= Cormorant_Garamond({ subsets: ["latin"], weight: ["400","500","600","700"], variable: "--font-cormorant", display: "swap" });
const dancing  = Dancing_Script({ subsets: ["latin"], variable: "--font-dancing", display: "swap" });
const greatVibes = Great_Vibes({ subsets: ["latin"], weight: "400", variable: "--font-vibes", display: "swap" });
const caveat   = Caveat({ subsets: ["latin"], variable: "--font-caveat", display: "swap" });
const pacifico = Pacifico({ subsets: ["latin"], weight: "400", variable: "--font-pacifico", display: "swap" });
const typewriter = Special_Elite({ subsets: ["latin"], weight: "400", variable: "--font-typewriter", display: "swap" });
const sacramento = Sacramento({ subsets: ["latin"], weight: "400", variable: "--font-sacramento", display: "swap" });
const parisienne = Parisienne({ subsets: ["latin"], weight: "400", variable: "--font-parisienne", display: "swap" });

export const metadata: Metadata = {
  title: "Send Letter — Free Sealed Letters | No Account Needed",
  description: "Create sealed letters for any moment — long distance, anniversaries, bad days, birthdays. Interactive wax seal reveal. Free, no account needed.",
  keywords: "send letter, sealed letter, wax seal, love letter, long distance, anniversary gift",
  openGraph: {
    title: "Send Letter — Sealed Letters for the Moments That Matter",
    description: "Create sealed letters for any moment. Interactive wax seal reveal. Free, no account needed.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${crimson.variable} ${cormorant.variable} ${dancing.variable} ${greatVibes.variable} ${caveat.variable} ${pacifico.variable} ${typewriter.variable} ${sacramento.variable} ${parisienne.variable}`}
    >
      <body className="grain antialiased min-h-screen" style={{ background: "#0a0606" }}>
        {children}
      </body>
    </html>
  );
}
