import { ImageResponse } from "next/og";

export const runtime = "edge";

function value(params: URLSearchParams, key: string, fallback: string) {
  return (params.get(key) || fallback).slice(0, 80).toUpperCase();
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const name = value(params, "n", "A GOA BUILDER");
  const builderClass = value(params, "c", "BEAUTIFUL MISFIT");
  const stack = value(params, "s", "WEIRD TECH");
  const mode = value(params, "m", "SHIP IT");
  const crew = value(params, "r", "LOOKING FOR MY PEOPLE");
  const social = value(params, "u", "#FRAMEINGOA");
  const id = value(params, "id", "GOA-2026");

  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#0b6b42", color: "#092f25", fontFamily: "Arial, sans-serif", overflow: "hidden" }}>
      <div style={{ position: "absolute", width: 290, height: 290, borderRadius: 999, background: "#ffd900", border: "10px solid #092f25", right: 65, top: 45, display: "flex" }} />
      <div style={{ position: "absolute", inset: 0, opacity: .12, backgroundImage: "linear-gradient(#092f25 2px, transparent 2px), linear-gradient(90deg, #092f25 2px, transparent 2px)", backgroundSize: "28px 28px", display: "flex" }} />
      <div style={{ position: "absolute", left: 70, top: 48, display: "flex", alignItems: "center", gap: 16, color: "#fff8e6", fontWeight: 900, fontSize: 28 }}>
        <span style={{ background: "#ff4f87", color: "#092f25", border: "5px solid #092f25", padding: "8px 13px", display: "flex" }}>HH</span>
        <span style={{ display: "flex" }}>GOA 2026 · SIGNAL ON THE SAND</span>
      </div>
      <div style={{ position: "absolute", left: 80, right: 80, top: 135, bottom: 55, background: "#fff8e6", border: "12px solid #092f25", boxShadow: "18px 18px 0 #092f25", display: "flex", flexDirection: "column" }}>
        <div style={{ height: 82, flexShrink: 0, background: "#ffd900", borderBottom: "8px solid #092f25", padding: "20px 30px", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 25, fontWeight: 900 }}>
          <span style={{ display: "flex" }}>HH GOA ’26 / BUILDER SIGNAL</span><span style={{ display: "flex" }}>{id}</span>
        </div>
        <div style={{ flex: 1, display: "flex", padding: "33px 38px 28px", gap: 42 }}>
          <div style={{ width: 325, flexShrink: 0, background: "#ff4f87", border: "7px solid #092f25", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
            <span style={{ fontSize: 124, fontWeight: 900, color: "#092f25", display: "flex" }}>{name.slice(0, 1)}</span>
            <span style={{ position: "absolute", bottom: 20, left: 20, right: 20, background: "#092f25", color: "#ffd900", padding: "10px", justifyContent: "center", fontSize: 18, fontWeight: 900, display: "flex" }}>PHOTO LIVES IN THE POST</span>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 19, fontWeight: 900, marginBottom: 6, display: "flex" }}>BUILDER CLASS</span>
            <span style={{ fontSize: builderClass.length > 19 ? 52 : 64, lineHeight: .9, letterSpacing: -3, fontWeight: 900, color: "#0b6b42", display: "flex", maxWidth: 590 }}>{builderClass}</span>
            <span style={{ fontSize: 18, fontWeight: 900, marginTop: 23, display: "flex" }}>KNOWN AS</span>
            <span style={{ fontSize: 42, fontWeight: 900, marginTop: 4, display: "flex" }}>{name}</span>
            <span style={{ fontSize: 18, fontWeight: 700, marginTop: 16, display: "flex" }}>{stack} / {mode}</span>
            <span style={{ fontSize: 17, marginTop: 9, display: "flex" }}>{crew}</span>
            <div style={{ marginTop: "auto", background: "#092f25", color: "#ffd900", padding: "13px 18px", fontSize: 19, fontWeight: 900, display: "flex", justifyContent: "space-between" }}><span style={{ display: "flex" }}>{social}</span><span style={{ display: "flex" }}>#FRAMEINGOA</span></div>
          </div>
        </div>
      </div>
    </div>,
    { width: 1200, height: 630, headers: { "Cache-Control": "public, max-age=31536000, immutable" } },
  );
}
