import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Orbit - Social Messaging Platform",
    template: "%s | Orbit",
  },
  description:
    "Connect, communicate, and build your own digital constellations. A next-generation social messaging platform where conversations move like celestial paths.",
  keywords: [
    "messaging",
    "chat",
    "social",
    "communication",
    "real-time",
    "orbit",
  ],
  authors: [{ name: "Orbit" }],
  openGraph: {
    title: "Orbit - Social Messaging Platform",
    description:
      "Connect, communicate, and build your own digital constellations.",
    type: "website",
    locale: "en_US",
    siteName: "Orbit",
  },
  twitter: {
    card: "summary_large_image",
    title: "Orbit - Social Messaging Platform",
    description:
      "Connect, communicate, and build your own digital constellations.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
