import type { Metadata } from "next";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const sans = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans"
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono"
});

export const metadata: Metadata = {
  metadataBase: new URL("https://cursor-rules-library.com"),
  title: {
    default: "Cursor Rules Library",
    template: "%s | Cursor Rules Library"
  },
  description:
    "Browse 200+ curated .cursorrules files for every framework. Preview, fork, and install rules in one command.",
  keywords: [
    "cursorrules",
    "cursor",
    "claude code",
    "ai dev tools",
    "prompt engineering",
    "developer workflow"
  ],
  openGraph: {
    title: "Cursor Rules Library",
    description:
      "Install battle-tested .cursorrules files for Next.js, Rust, Go, and 200+ stacks.",
    type: "website",
    siteName: "Cursor Rules Library",
    url: "https://cursor-rules-library.com"
  },
  twitter: {
    card: "summary_large_image",
    title: "Cursor Rules Library",
    description:
      "Curated .cursorrules for every framework with one-click install and weekly drops."
  },
  alternates: {
    canonical: "/"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${sans.variable} ${mono.variable} antialiased`}>{children}</body>
    </html>
  );
}
