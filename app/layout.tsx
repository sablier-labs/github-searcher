import type { Metadata } from "next";
import "./globals.css";

const BASE_URL = "https://sablier-github-searcher.vercel.app";
const TITLE = "Sablier GitHub Searcher";

export const metadata: Metadata = {
  description: "Search issues and discussions across Sablier Labs repositories",
  metadataBase: new URL(BASE_URL),
  openGraph: {
    description: "Search issues and discussions across Sablier Labs repositories",
    images: [
      {
        alt: "Sablier GitHub Searcher",
        height: 780,
        url: `${BASE_URL}/opengraph.jpg`,
        width: 1200,
      },
    ],
    locale: "en_US",
    siteName: TITLE,
    title: TITLE,
    type: "website",
    url: BASE_URL,
  },
  title: TITLE,
  twitter: {
    card: "summary_large_image",
    description: "Search issues and discussions across Sablier Labs repositories",
    images: [`${BASE_URL}/opengraph.jpg`],
    title: TITLE,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
