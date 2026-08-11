"use client";

import QRCode from "qrcode";
import { ChangeEvent, DragEvent, KeyboardEvent, useCallback, useMemo, useRef, useState } from "react";
import BeachScene from "./beach-scene";

type Format = "id" | "back" | "pfp" | "crew";
type Stage = 0 | 1 | 2 | 3 | 4;

type Builder = {
  name: string;
  social: string;
  stack: string;
  mode: string;
  crew: string;
  photo: string;
  fileName: string;
};

const STACKS = ["AI / ML", "FRONTEND", "BACKEND", "DESIGN", "PRODUCT", "HARDWARE", "WEB3", "WEIRD TECH"];
const MODES = [
  ["SHIP IT", "Speed over ceremony"],
  ["MAKE IT BEAUTIFUL", "Details are the product"],
  ["BREAK THE IMPOSSIBLE", "Hard problems taste better"],
  ["CONNECT THE DOTS", "People are the platform"],
] as const;
const CREWS = ["SOLO & DANGEROUS", "ARRIVING WITH CREW", "LOOKING FOR MY PEOPLE", "ASK ME WHAT I'M BUILDING"];
const CLASSES: Record<string, string[]> = {
  "AI / ML": ["PROMPT ALCHEMIST", "MODEL WHISPERER", "LATENT PIRATE"],
  FRONTEND: ["PIXEL SURFER", "BROWSER BENDER", "INTERFACE PILOT"],
  BACKEND: ["SYSTEMS SHAMAN", "API PIRATE", "SERVER TAMER"],
  DESIGN: ["VIBE ENGINEER", "PIXEL POET", "MOTION MAVERICK"],
  PRODUCT: ["CHAOS CARTOGRAPHER", "SHIP CAPTAIN", "SIGNAL FINDER"],
  HARDWARE: ["CIRCUIT SORCERER", "ROBOT WRANGLER", "SOLDER MONK"],
  WEB3: ["CHAIN NAVIGATOR", "PROTOCOL PIRATE", "WALLET WIZARD"],
  "WEIRD TECH": ["BEAUTIFUL MISFIT", "GLITCH NATURALIST", "FUTURE FERAL"],
};

const GUIDE = [
  ["01", "GENESIS", "Meet the humans. Find the friction. Leave the comfort zone."],
  ["02", "THE BET", "Name the problem, the person and why your solution deserves to exist."],
  ["03", "THE BUILD", "Make the wild idea real. Test it. Break it. Make it undeniable."],
  ["04", "THE LAUNCH", "Tell the story, ship the proof and show the room what changed."],
] as const;

const INITIAL: Builder = {
  name: "YOUR NAME",
  social: "@yourhandle",
  stack: "DESIGN",
  mode: "MAKE IT BEAUTIFUL",
  crew: "LOOKING FOR MY PEOPLE",
  photo: "",
  fileName: "",
};

function hashText(value: string) {
  return [...value].reduce((sum, char) => ((sum << 5) - sum + char.charCodeAt(0)) | 0, 7);
}

function builderClass(builder: Builder) {
  const choices = CLASSES[builder.stack] ?? CLASSES["WEIRD TECH"];
  return choices[Math.abs(hashText(`${builder.name}${builder.mode}`)) % choices.length];
}

function builderId(builder: Builder) {
  return `GOA-${String(Math.abs(hashText(`${builder.name}${builder.social}`)) % 10000).padStart(4, "0")}`;
}

function socialDetails(value: string) {
  const clean = value.trim();
  if (!clean) return { label: "YOUR SIGNAL", value: "@yourhandle", url: "https://hhgoa.com" };
  if (clean.startsWith("@")) return { label: "X / TWITTER", value: clean, url: `https://x.com/${clean.slice(1)}` };
  const withProtocol = /^https?:\/\//i.test(clean) ? clean : `https://${clean}`;
  try {
    const parsed = new URL(withProtocol);
    const host = parsed.hostname.replace(/^www\./, "");
    if (host.includes("github.com")) return { label: "GITHUB", value: `@${parsed.pathname.split("/").filter(Boolean)[0] || "builder"}`, url: parsed.href };
    if (host.includes("linkedin.com")) return { label: "LINKEDIN", value: parsed.pathname.split("/").filter(Boolean).pop() || clean, url: parsed.href };
    return { label: "FIND ME AT", value: clean.replace(/^https?:\/\//, ""), url: parsed.href };
  } catch {
    return { label: "FIND ME AT", value: clean, url: "https://hhgoa.com" };
  }
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function cutPath(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, cut = 44) {
  ctx.beginPath();
  ctx.moveTo(x + cut, y);
  ctx.lineTo(x + width, y);
  ctx.lineTo(x + width, y + height - cut);
  ctx.lineTo(x + width - cut, y + height);
  ctx.lineTo(x, y + height);
  ctx.lineTo(x, y + cut);
  ctx.closePath();
}

function fitText(ctx: CanvasRenderingContext2D, text: string, max: number, size: number, family = "Arial Black") {
  let current = size;
  do {
    ctx.font = `900 ${current}px ${family}`;
    current -= 2;
  } while (ctx.measureText(text).width > max && current > 18);
}

function drawCover(ctx: CanvasRenderingContext2D, image: HTMLImageElement, x: number, y: number, width: number, height: number) {
  const scale = Math.max(width / image.width, height / image.height);
  const sw = width / scale;
  const sh = height / scale;
  ctx.drawImage(image, (image.width - sw) / 2, (image.height - sh) / 2, sw, sh, x, y, width, height);
}

function drawDoodles(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.save();
  ctx.strokeStyle = "#092f25";
  ctx.lineWidth = Math.max(8, width / 135);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const u = width / 1080;
  ctx.beginPath();
  ctx.moveTo(62 * u, height - 92 * u); ctx.quadraticCurveTo(110 * u, height - 165 * u, 144 * u, height - 88 * u);
  ctx.moveTo(103 * u, height - 125 * u); ctx.lineTo(76 * u, height - 188 * u); ctx.moveTo(108 * u, height - 136 * u); ctx.lineTo(143 * u, height - 192 * u);
  ctx.stroke();
  ctx.fillStyle = "#ff4f87"; ctx.fillRect(width - 192 * u, 55 * u, 116 * u, 116 * u);
  ctx.strokeRect(width - 192 * u, 55 * u, 116 * u, 116 * u);
  ctx.beginPath(); ctx.moveTo(width - 192 * u, 55 * u); ctx.lineTo(width - 134 * u, 18 * u); ctx.lineTo(width - 76 * u, 55 * u); ctx.stroke();
  ctx.fillStyle = "#ffd900"; ctx.beginPath(); ctx.arc(width - 90 * u, height - 104 * u, 38 * u, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#092f25"; ctx.font = `900 ${28 * u}px Arial Black`; ctx.textAlign = "center"; ctx.fillText("HH", width - 90 * u, height - 94 * u);
  // A tiny Goan fishing boat and balcão arch keep the frame rooted in place,
  // rather than reading as a generic tropical event graphic.
  ctx.fillStyle = "#1d4e89"; ctx.beginPath(); ctx.moveTo(250 * u, height - 70 * u); ctx.lineTo(390 * u, height - 70 * u); ctx.lineTo(360 * u, height - 32 * u); ctx.lineTo(278 * u, height - 32 * u); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#fff9e8"; ctx.fillRect(295 * u, height - 118 * u, 58 * u, 48 * u); ctx.strokeRect(295 * u, height - 118 * u, 58 * u, 48 * u);
  ctx.fillStyle = "#a84f2b"; ctx.beginPath(); ctx.moveTo(282 * u, height - 118 * u); ctx.lineTo(324 * u, height - 150 * u); ctx.lineTo(366 * u, height - 118 * u); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = "#1d4e89"; ctx.lineWidth = 5 * u; ctx.beginPath(); ctx.arc(width - 305 * u, 128 * u, 58 * u, Math.PI, 0); ctx.lineTo(width - 247 * u, 205 * u); ctx.moveTo(width - 363 * u, 128 * u); ctx.lineTo(width - 363 * u, 205 * u); ctx.stroke();
  ctx.restore();
}

function drawAzulejoBand(ctx: CanvasRenderingContext2D, y: number, width: number, tile = 46) {
  ctx.save();
  for (let x = 0; x < width; x += tile) {
    ctx.fillStyle = x / tile % 2 ? "#fff9e8" : "#d8edf0"; ctx.fillRect(x, y, tile, tile);
    ctx.strokeStyle = "#1d4e89"; ctx.lineWidth = 3; ctx.strokeRect(x, y, tile, tile);
    ctx.beginPath(); ctx.moveTo(x + tile / 2, y + 6); ctx.lineTo(x + tile - 6, y + tile / 2); ctx.lineTo(x + tile / 2, y + tile - 6); ctx.lineTo(x + 6, y + tile / 2); ctx.closePath(); ctx.stroke();
    ctx.beginPath(); ctx.arc(x + tile / 2, y + tile / 2, tile * .14, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.restore();
}

export default function Home() {
  const [builder, setBuilder] = useState(INITIAL);
  const [stage, setStage] = useState<Stage>(0);
  const [format, setFormat] = useState<Format>("id");
  const [dragging, setDragging] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [status, setStatus] = useState("WAITING FOR YOUR PHOTO");
  const [burst, setBurst] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentClass = useMemo(() => builderClass(builder), [builder]);
  const currentId = useMemo(() => builderId(builder), [builder]);
  const social = useMemo(() => socialDetails(builder.social), [builder.social]);

  const update = (patch: Partial<Builder>) => setBuilder((old) => ({ ...old, ...patch }));

  const ingestFile = useCallback(async (incoming?: File) => {
    if (!incoming) return;
    if (!incoming.type.startsWith("image/") && !/\.(heic|heif)$/i.test(incoming.name)) {
      setStatus("THAT DOESN'T LOOK LIKE A PHOTO");
      return;
    }
    setStatus("DEVELOPING YOUR SIGNAL…");
    try {
      let file = incoming;
      if (/heic|heif/i.test(incoming.type) || /\.(heic|heif)$/i.test(incoming.name)) {
        const { default: heic2any } = await import("heic2any");
        const converted = await heic2any({ blob: incoming, toType: "image/jpeg", quality: 0.92 });
        const blob = Array.isArray(converted) ? converted[0] : converted;
        file = new File([blob], incoming.name.replace(/\.(heic|heif)$/i, ".jpg"), { type: "image/jpeg" });
      }
      const reader = new FileReader();
      reader.onload = () => {
        update({ photo: String(reader.result), fileName: file.name });
        setStatus("PHOTO LOCKED. YOU'RE ON THE MAP.");
        setBurst((n) => n + 1);
        window.setTimeout(() => setStage(1), 450);
      };
      reader.readAsDataURL(file);
    } catch {
      setStatus("WE COULDN'T READ THAT ONE. TRY JPG OR PNG.");
    }
  }, []);

  const onDrop = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setDragging(false);
    void ingestFile(event.dataTransfer.files?.[0]);
  };

  const onFile = (event: ChangeEvent<HTMLInputElement>) => void ingestFile(event.target.files?.[0]);

  const goNext = () => {
    if (stage === 1 && builder.name.trim().length < 2) return setStatus("GIVE US AT LEAST TWO LETTERS");
    if (stage === 1 && builder.social.trim().length < 2) return setStatus("DROP ONE HANDLE OR LINK");
    if (stage === 2 && !builder.stack) return setStatus("PICK YOUR PLAYGROUND");
    setStatus(stage === 3 ? "SIGNAL FOUND. WELCOME TO THE SAND." : "SIGNAL UPDATED");
    setBurst((n) => n + 1);
    setIsFlipped(stage === 1);
    setStage((Math.min(stage + 1, 4) as Stage));
  };

  const renderCanvas = useCallback(async (kind: Format = format) => {
    const square = kind === "pfp";
    const canvas = document.createElement("canvas");
    canvas.width = square ? 1080 : 1400;
    canvas.height = square ? 1080 : 900;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas unavailable");
    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = "#f5efd9"; ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "#0b6b42"; ctx.fillRect(0, 0, width, height * 0.56);
    ctx.fillStyle = "#79d7cd"; ctx.fillRect(0, height * 0.56, width, height * 0.19);
    ctx.fillStyle = "#f6bd54"; ctx.fillRect(0, height * 0.75, width, height * 0.25);
    drawAzulejoBand(ctx, height * 0.75 - 22, width, 44);
    ctx.strokeStyle = "rgba(9,47,37,.18)"; ctx.lineWidth = 2;
    for (let y = 18; y < height; y += 22) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y + 12); ctx.stroke(); }
    drawDoodles(ctx, width, height);

    if (kind === "back") {
      const pad = 92;
      ctx.fillStyle = "#ff4f87"; cutPath(ctx, pad, pad, width - pad * 2, height - pad * 2, 54); ctx.fill();
      ctx.strokeStyle = "#092f25"; ctx.lineWidth = 16; ctx.stroke();
      ctx.fillStyle = "#ffd900"; ctx.fillRect(pad, pad, width - pad * 2, 100);
      ctx.fillStyle = "#092f25"; ctx.font = "900 34px Arial Black"; ctx.textAlign = "left"; ctx.fillText("FIND ME BETWEEN THE PALMS", pad + 42, pad + 67);
      ctx.fillStyle = "#fff9e8"; ctx.font = "900 28px Arial Black"; ctx.fillText(social.label, pad + 54, 320);
      fitText(ctx, social.value.toUpperCase(), 720, 76); ctx.fillText(social.value.toUpperCase(), pad + 54, 400);
      ctx.font = "700 25px monospace"; ctx.fillText(builder.crew, pad + 54, 500);
      ctx.fillText(`${builder.stack}  /  ${builder.mode}`, pad + 54, 550);
      const qr = await loadImage(await QRCode.toDataURL(social.url, { margin: 1, width: 360, color: { dark: "#092f25", light: "#fff9e8" } }));
      ctx.fillStyle = "#fff9e8"; ctx.fillRect(width - 460, 270, 300, 300); ctx.drawImage(qr, width - 445, 285, 270, 270);
      ctx.fillStyle = "#092f25"; ctx.fillRect(pad + 42, height - 185, width - pad * 2 - 84, 82);
      ctx.fillStyle = "#ffd900"; ctx.font = "900 31px Arial Black"; ctx.fillText(`${currentId}  ·  #FRAMEINGOA`, pad + 72, height - 132);
      ctx.fillStyle = "#fff9e8"; ctx.font = "900 20px Arial Black"; ctx.fillText("CANDOLIM · GOA · 15.2993° N", pad + 72, height - 88);
      return canvas;
    }

    if (kind === "pfp") {
      ctx.fillStyle = "#ff4f87"; cutPath(ctx, 76, 76, 928, 928, 72); ctx.fill(); ctx.strokeStyle = "#092f25"; ctx.lineWidth = 18; ctx.stroke();
      ctx.save(); cutPath(ctx, 145, 145, 790, 790, 50); ctx.clip();
      if (builder.photo) drawCover(ctx, await loadImage(builder.photo), 145, 145, 790, 790);
      else { ctx.fillStyle = "#ffd900"; ctx.fillRect(145, 145, 790, 790); ctx.fillStyle = "#092f25"; ctx.font = "900 160px Arial Black"; ctx.textAlign = "center"; ctx.fillText("YOU", 540, 600); }
      ctx.restore();
      ctx.fillStyle = "#ffd900"; ctx.fillRect(95, 800, 890, 136); ctx.strokeRect(95, 800, 890, 136);
      ctx.fillStyle = "#092f25"; fitText(ctx, currentClass, 820, 68); ctx.textAlign = "center"; ctx.fillText(currentClass, 540, 886);
      ctx.font = "900 26px Arial Black"; ctx.fillText("HH GOA '26 · CANDOLIM, GOA", 540, 985);
      return canvas;
    }

    const isCrew = kind === "crew";
    const pad = 70;
    ctx.fillStyle = isCrew ? "#ff4f87" : "#fff9e8"; cutPath(ctx, pad, pad, width - pad * 2, height - pad * 2, 58); ctx.fill();
    ctx.strokeStyle = "#092f25"; ctx.lineWidth = 16; ctx.stroke();
    ctx.fillStyle = "#ffd900"; ctx.fillRect(pad, pad, width - pad * 2, 100);
    ctx.fillStyle = "#092f25"; ctx.font = "900 32px Arial Black"; ctx.textAlign = "left"; ctx.fillText(isCrew ? "CREW SIGNAL · PASS THIS AROUND GOA" : "HH GOA '26 · CANDOLIM BUILDER SIGNAL", pad + 38, pad + 66);
    ctx.save(); cutPath(ctx, pad + 48, pad + 150, 450, 510, 38); ctx.clip();
    if (builder.photo) drawCover(ctx, await loadImage(builder.photo), pad + 48, pad + 150, 450, 510);
    else { ctx.fillStyle = "#79d7cd"; ctx.fillRect(pad + 48, pad + 150, 450, 510); ctx.fillStyle = "#092f25"; ctx.font = "900 88px Arial Black"; ctx.textAlign = "center"; ctx.fillText("YOU", pad + 273, 450); }
    ctx.restore();
    const x = pad + 555;
    ctx.fillStyle = "#092f25"; ctx.font = "900 25px Arial Black"; ctx.fillText("BUILDER CLASS", x, 260);
    ctx.fillStyle = isCrew ? "#fff9e8" : "#0b6b42"; fitText(ctx, currentClass, 650, 82); ctx.fillText(currentClass, x, 345);
    ctx.fillStyle = "#092f25"; ctx.font = "900 24px Arial Black"; ctx.fillText("KNOWN AS", x, 430);
    fitText(ctx, builder.name.toUpperCase(), 650, 62); ctx.fillText(builder.name.toUpperCase(), x, 495);
    ctx.font = "700 23px monospace"; ctx.fillText(`${builder.stack}  /  ${builder.mode}`, x, 565);
    ctx.fillText(builder.crew, x, 612);
    ctx.fillStyle = "#092f25"; ctx.fillRect(x, 655, 620, 78);
    ctx.fillStyle = "#ffd900"; ctx.font = "900 28px Arial Black"; ctx.fillText(`${currentId}  ·  #FRAMEINGOA`, x + 26, 705);
    const cardBottom = height - pad;
    const footerRuleY = cardBottom - 70;
    const footerBaseline = cardBottom - 28;
    ctx.strokeStyle = "#092f25"; ctx.lineWidth = 3; ctx.setLineDash([12, 8]);
    ctx.beginPath(); ctx.moveTo(pad + 48, footerRuleY); ctx.lineTo(width - pad - 48, footerRuleY); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = "#092f25"; ctx.font = "900 22px Arial Black"; ctx.fillText("CANDOLIM, GOA · 15.2993° N · BUILT IN PUBLIC", pad + 48, footerBaseline);
    return canvas;
  }, [builder, currentClass, currentId, format, social]);

  const download = async (kind: Format = format) => {
    const canvas = await renderCanvas(kind);
    const link = document.createElement("a");
    link.download = `hh-goa-${kind}-${builder.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "builder"}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    setStatus(`${kind.toUpperCase()} SAVED TO CAMERA ROLL`);
  };

  const share = async () => {
    const canvas = await renderCanvas(format);
    const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(), "image/png"));
    const file = new File([blob], `hh-goa-${currentId}.png`, { type: "image/png" });
    const params = new URLSearchParams({ n: builder.name, c: currentClass, s: builder.stack, m: builder.mode, r: builder.crew, u: social.value, id: currentId });
    const shareUrl = `${window.location.origin}/signal?${params.toString()}`;
    const copy = `I just found my HH Goa builder class: ${currentClass}. Find me on the sand. #FrameInGoa #HHGoa2026`;
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: "My HH Goa Builder Signal", text: copy, url: shareUrl });
      setStatus("SIGNAL SENT INTO THE WORLD");
      return;
    }
    await download(format);
    window.open(`https://x.com/intent/post?text=${encodeURIComponent(`${copy}\n${shareUrl}`)}`, "_blank", "noopener,noreferrer");
    setStatus("IMAGE SAVED. ATTACH IT TO YOUR POST.");
  };

  const keyAdvance = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") goNext();
  };

  return (
    <main className={`experience stage-${stage}`}>
      <div className="grain" aria-hidden="true" />
      <header className="topbar">
        <a className="wordmark" href="https://hhgoa.com" target="_blank" rel="noreferrer" aria-label="Hacker House Goa home">
          <span>HH</span><b>GOA</b><small>2026</small>
        </a>
        <div className="live-badge"><i /> LIVE FROM CANDOLIM, GOA</div>
        <button className="guide-button" onClick={() => setGuideOpen(true)}>FIELD GUIDE <span>↗</span></button>
      </header>

      <section className="world" aria-label="Your live builder signal on a Goa beach">
        <div className="goa-world-plate" aria-hidden="true" />
        <div className="night-lights" aria-hidden="true">{Array.from({ length: 9 }).map((_, index) => <i key={index} />)}</div>
        <div className="world-copy">
          <span className="eyebrow">GOA: BALCÃO TO BEACH SHACK</span>
          <h1>FIND YOUR<br /><em>SIGNAL.</em></h1>
          <p>Old-world arches. Arabian Sea. Fish curry rice.<br />Then the lights come on—and we build.</p>
        </div>
        <div className="goa-postmark" aria-hidden="true"><span>SUSEGAD<br />MODE</span><b>GOA<br />’26</b></div>
        <div className="azulejo-rail" aria-hidden="true">{Array.from({ length: 9 }).map((_, index) => <i key={index} />)}</div>
        <BeachScene
          key={burst}
          name={builder.name}
          photo={builder.photo}
          stack={builder.stack}
          builderClass={currentClass}
          socialLabel={social.label}
          socialValue={social.value}
          socialUrl={social.url}
          buildMode={builder.mode}
          crewStatus={builder.crew}
          builderId={currentId}
          flipped={isFlipped}
          onFlip={setIsFlipped}
        />
        <button className="flip-hint" onClick={() => setIsFlipped(!isFlipped)}>
          <span>{isFlipped ? "SEE THE FACE" : "FLIP FOR THE SIGNAL"}</span><b>↻</b>
        </button>
        <div className="shoreline" aria-hidden="true"><span /><span /><span /></div>
        <div className="goa-spectrum" aria-hidden="true"><span>PORTUGUESE BALCÃO</span><i /><span>ARABIAN SEA</span><i /><span>NIGHT SHIFT</span><i /><span>FISH THALI</span></div>
        <div className="wayfinding" aria-hidden="true"><b>← MANDOVI</b><b>MOPA 34 KM ↑</b><b>BUILD ZONE →</b></div>
      </section>

      <section className="dock" aria-label="Build your HH Goa signal">
        <div className="progress" aria-label={`Step ${Math.min(stage + 1, 4)} of 4`}>
          {[0, 1, 2, 3].map((item) => <button key={item} className={stage === item ? "active" : stage > item ? "done" : ""} onClick={() => stage === 4 || item <= stage ? setStage(item as Stage) : undefined}><span>{stage > item ? "✓" : item + 1}</span><b>{["FACE", "SIGNAL", "PLAYGROUND", "CREW"][item]}</b></button>)}
        </div>

        <div className="panel-wrap" aria-live="polite">
          {stage === 0 && (
            <article className="step-panel photo-step">
              <div className="step-number">01</div>
              <div className="step-copy"><span>ARRIVAL CHECK</span><h2>SHOW US<br />YOUR FACE.</h2><p>No polish needed. Beach hair encouraged.</p></div>
              <button className={`drop-zone ${dragging ? "dragging" : ""}`} onClick={() => inputRef.current?.click()} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={onDrop}>
                <span className="camera-glyph">✺</span><b>{builder.photo ? "SWAP THE PHOTO" : "DROP / TAP TO UPLOAD"}</b><small>JPG · PNG · HEIC</small>
              </button>
              <input ref={inputRef} className="sr-only" type="file" accept="image/jpeg,image/png,image/heic,image/heif,.heic,.heif" onChange={onFile} />
            </article>
          )}

          {stage === 1 && (
            <article className="step-panel identity-step">
              <div className="step-number">02</div>
              <div className="step-copy"><span>FREQUENCY</span><h2>WHAT DO WE<br />CALL YOU?</h2><p>And one place your future crew can find you.</p></div>
              <div className="fields">
                <label><span>YOUR NAME</span><input value={builder.name === "YOUR NAME" ? "" : builder.name} placeholder="e.g. Maya" onChange={(e) => update({ name: e.target.value })} /></label>
                <label><span>ONE HANDLE OR LINK</span><input value={builder.social === "@yourhandle" ? "" : builder.social} placeholder="@handle or your.site" onChange={(e) => update({ social: e.target.value })} onKeyDown={keyAdvance} /></label>
              </div>
              <button className="next-button" onClick={goNext}>LOCK THE SIGNAL <b>→</b></button>
            </article>
          )}

          {stage === 2 && (
            <article className="step-panel stack-step">
              <div className="step-number">03</div>
              <div className="step-copy"><span>PLAYGROUND</span><h2>WHERE DO YOU<br />CAUSE TROUBLE?</h2><p>Don’t overthink it. First instinct wins.</p></div>
              <div className="choice-area">
                <div className="chip-grid">{STACKS.map((item) => <button key={item} className={builder.stack === item ? "selected" : ""} onClick={() => { update({ stack: item }); setBurst((n) => n + 1); }}>{item}</button>)}</div>
                <span className="mini-label">YOUR BUILD MODE</span>
                <div className="mode-grid">{MODES.map(([title, sub]) => <button key={title} className={builder.mode === title ? "selected" : ""} onClick={() => update({ mode: title })}><b>{title}</b><small>{sub}</small></button>)}</div>
              </div>
              <button className="next-button" onClick={goNext}>STAMP IT <b>→</b></button>
            </article>
          )}

          {stage === 3 && (
            <article className="step-panel crew-step">
              <div className="step-number">04</div>
              <div className="step-copy"><span>THE HUMAN LAYER</span><h2>HOW ARE YOU<br />HITTING THE SAND?</h2><p>This becomes the easiest conversation starter in Goa.</p></div>
              <div className="crew-grid">{CREWS.map((item, index) => <button key={item} className={builder.crew === item ? "selected" : ""} onClick={() => update({ crew: item })}><span>{["☀", "✦", "⌁", "?!"][index]}</span><b>{item}</b></button>)}</div>
              <button className="next-button reveal-button" onClick={goNext}>REVEAL MY BUILDER CLASS <b>✺</b></button>
            </article>
          )}

          {stage === 4 && (
            <article className="step-panel result-step">
              <div className="result-title"><span>SIGNAL FOUND · {currentId}</span><h2>YOU’RE A<br /><em>{currentClass}.</em></h2><p>{builder.crew}. Now make it easier for the right people to find you.</p></div>
              <div className="export-station">
                <span className="mini-label">PACK YOUR BEACH BAG</span>
                <div className="format-grid">
                  {(["id", "back", "pfp", "crew"] as Format[]).map((item) => <button key={item} className={format === item ? "selected" : ""} onClick={() => { setFormat(item); setIsFlipped(item === "back"); }}><span>{item === "id" ? "▣" : item === "back" ? "QR" : item === "pfp" ? "◉" : "✦"}</span><b>{item === "id" ? "FRONT ID" : item === "back" ? "CONTACT BACK" : item === "pfp" ? "PFP" : "CREW CALL"}</b></button>)}
                </div>
                <div className="result-actions"><button onClick={() => void download()} className="download-button">DOWNLOAD PNG <span>↓</span></button><button onClick={() => void share()} className="share-button">SHARE SIGNAL <span>↗</span></button></div>
                <button className="restart" onClick={() => { setBuilder(INITIAL); setStage(0); setIsFlipped(false); setStatus("WAITING FOR YOUR PHOTO"); }}>MAKE ANOTHER →</button>
              </div>
            </article>
          )}
        </div>

        <div className="status-line"><span>{status}</span><b>{stage < 4 ? `${stage + 1} / 4` : "READY TO TRANSMIT"}</b></div>
      </section>

      <aside className={`field-guide ${guideOpen ? "open" : ""}`} aria-hidden={!guideOpen}>
        <button className="guide-close" onClick={() => setGuideOpen(false)} aria-label="Close field guide">×</button>
        <span className="eyebrow">THE CANDOLIM FIELD GUIDE</span>
        <h2>YOU’RE NOT COMING<br />TO A CONFERENCE.</h2>
        <p className="guide-lede">You’re entering a temporary builder village by the Arabian Sea—where strangers become crews and unfinished ideas leave Goa as proof.</p>
        <div className="guide-days">{GUIDE.map(([day, title, copy]) => <article key={day}><span>DAY {day}</span><h3>{title}</h3><p>{copy}</p></article>)}</div>
        <a href="https://hhgoa.com/radar" target="_blank" rel="noreferrer">SEE WHAT THE COAST IS BUILDING <b>↗</b></a>
      </aside>
      {guideOpen && <button className="guide-scrim" aria-label="Close field guide" onClick={() => setGuideOpen(false)} />}
    </main>
  );
}
