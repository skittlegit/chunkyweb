import type { Metadata } from "next";
import { Source_Serif_4, IBM_Plex_Mono, Newsreader } from "next/font/google";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import { Providers } from "./providers";

// Body / display serif — Source Serif 4 has gorgeous oldstyle figures and
// reads beautifully at small sizes (think academic journal).
const sourceSerif = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

// Display serif — Newsreader has a literary-magazine feel, used italic
// for figure captions and large numerals.
const newsreader = Newsreader({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

// Engineering monospace — IBM Plex Mono pairs naturally with technical print.
const plexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "ChunkyWeb — Mission Control",
  description: "Satellite attitude planning & imaging scheduling",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sourceSerif.variable} ${newsreader.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
