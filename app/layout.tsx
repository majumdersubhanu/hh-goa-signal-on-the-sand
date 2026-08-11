import type { Metadata } from "next";
import { headers } from "next/headers";
import { Imbue, Victor_Mono } from "next/font/google";
import "./globals.css";

const display = Imbue({
  variable: "--font-display",
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
  const description = "Make your HH Goa 2026 Builder Signal. Upload a photo, discover your builder class, add your crew, and share it with #FrameInGoa.";

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
      images: [{ url: `${origin}/og.png`, width: 1200, height: 630, alt: "Signal on the Sand — HH Goa 2026" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${origin}/og.png`],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${mono.variable}`}>{children}</body>
    </html>
  );
}
