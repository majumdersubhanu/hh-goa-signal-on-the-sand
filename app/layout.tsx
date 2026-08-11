import type { Metadata } from "next";
import { headers } from "next/headers";
import { Bowlby_One_SC, Modak, Victor_Mono } from "next/font/google";
import "./globals.css";

const display = Bowlby_One_SC({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
});

const funk = Modak({
  variable: "--font-funk",
  weight: "400",
  subsets: ["latin"],
});

const mono = Victor_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;
  const title = "Signal on the Sand — HH Goa 2026";
  const description = "Touch down in Candolim and find your HH Goa 2026 Builder Signal in 20 seconds. Make a reversible 3D ID, contact card, PFP and crew call—then share it with #FrameInGoa.";

  return {
    title,
    description,
    metadataBase: new URL(origin),
    icons: {
      icon: "/goa.svg",
      shortcut: "/goa.svg",
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: origin,
      images: [{ url: `${origin}/og-goa.png`, width: 1536, height: 1024, alt: "Find Your Signal in Candolim, Goa — HH Goa 2026" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${origin}/og-goa.png`],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${funk.variable} ${mono.variable}`}>{children}</body>
    </html>
  );
}
