import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  description: "Search issues and discussions across Sablier Labs repositories",
  title: "Sablier GitHub Search",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
