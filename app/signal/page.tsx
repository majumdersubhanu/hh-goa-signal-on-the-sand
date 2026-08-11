import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";

type Query = Promise<Record<string, string | string[] | undefined>>;

function one(value: string | string[] | undefined, fallback: string) {
  return (Array.isArray(value) ? value[0] : value || fallback).slice(0, 80);
}

export async function generateMetadata({ searchParams }: { searchParams: Query }): Promise<Metadata> {
  const query = await searchParams;
  const name = one(query.n, "A Goa builder");
  const builderClass = one(query.c, "Beautiful Misfit");
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;
  const imageQuery = new URLSearchParams();
  Object.entries(query).forEach(([key, raw]) => imageQuery.set(key, one(raw, "")));
  const image = `${origin}/api/og?${imageQuery.toString()}`;
  const title = `${name} is a ${builderClass} — HH Goa 2026`;
  const description = "A builder signal found on the sand. Make yours for HH Goa 2026.";
  return {
    title,
    description,
    metadataBase: new URL(origin),
    openGraph: { title, description, type: "website", images: [{ url: image, width: 1200, height: 630, alt: `${name}'s HH Goa Builder Signal` }] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function SharedSignal({ searchParams }: { searchParams: Query }) {
  const query = await searchParams;
  const name = one(query.n, "A Goa builder");
  const builderClass = one(query.c, "Beautiful Misfit");
  return (
    <main style={{ minHeight: "100svh", display: "grid", placeItems: "center", padding: 24, background: "#0b6b42", color: "#fff8e6", textAlign: "center" }}>
      <section style={{ maxWidth: 760 }}>
        <span className="eyebrow">A SIGNAL JUST WASHED ASHORE</span>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(48px, 10vw, 110px)", lineHeight: .85, letterSpacing: "-.05em", margin: "28px 0 20px" }}>{name.toUpperCase()} IS A<br /><span style={{ color: "#ffd900" }}>{builderClass.toUpperCase()}.</span></h1>
        <p style={{ fontWeight: 800, textTransform: "uppercase", lineHeight: 1.6 }}>The full builder ID is in their post. Your people might already be on the sand.</p>
        <Link href="/" style={{ display: "inline-block", marginTop: 20, padding: "17px 22px", border: "3px solid #092f25", boxShadow: "6px 6px 0 #092f25", background: "#ff4f87", color: "#092f25", textDecoration: "none", fontFamily: "var(--font-display)" }}>FIND MY SIGNAL →</Link>
      </section>
    </main>
  );
}
