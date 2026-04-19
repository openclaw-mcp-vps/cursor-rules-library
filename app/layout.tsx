import type { Metadata } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://cursor-rules-library.com"),
  title: {
    default: "Cursor Rules Library",
    template: "%s | Cursor Rules Library",
  },
  description:
    "Browse 200+ curated .cursorrules files by framework. Preview, fork, and install with one command. Weekly community updates for Cursor and Claude Code users.",
  keywords: [
    "cursorrules",
    "cursor",
    "claude code",
    "ai developer tools",
    "next.js",
    "rust",
    "go",
    "prompt engineering",
  ],
  openGraph: {
    title: "Cursor Rules Library",
    description:
      "Curated .cursorrules files for every framework with one-click install and weekly new rules.",
    url: "https://cursor-rules-library.com",
    siteName: "Cursor Rules Library",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cursor Rules Library",
    description:
      "Curated .cursorrules files for every framework with one-click install.",
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased">
        <div className="min-h-screen">{children}</div>
      </body>
    </html>
  );
}
