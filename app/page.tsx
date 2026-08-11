"use client";

import {
  ChangeEvent,
  DragEvent,
  PointerEvent as ReactPointerEvent,
  useMemo,
  useRef,
  useState,
} from "react";
import dynamic from "next/dynamic";

const BeachScene = dynamic(
  () => import("./beach-scene").then((module) => module.BeachScene),
  {
    ssr: false,
    loading: () => <div className="scene-loader"><span>WARMING THE SAND</span></div>,
  },
);

type Format = "id" | "pfp" | "team";

type Builder = {
  id: number;
  name: string;
  stack: string;
  mission: string;
  energy: string;
  ritual: string;
  photo: string;
  fileName: string;
  zoom: number;
  offsetX: number;
  offsetY: number;
  classSeed: number;
};

const BUILDER_CLASSES = [
  "TIDE SHIPPER",
  "PALM STACKER",
  "SUNSET DEBUGGER",
  "SIGNAL SMITH",
  "WAVE RUNNER",
  "SANDCASTLE ARCHITECT",
  "MONSOON MAKER",
  "COASTAL OPERATOR",
  "MIDNIGHT LAUNCHER",
  "BAREFOOT FOUNDER",
];

const ENERGIES = ["Barefoot shipping", "Chai-fuelled", "Monsoon mode", "Sunset sprint"];
const RITUALS = ["Git push & pray", "One last coffee", "Walk by the water", "Play the launch song"];

const COLORS = {
  green: "#0b6839",
  yellow: "#fee101",
  pink: "#ff0080",
  paper: "#fffbe8",
  ink: "#082f20",
  sand: "#e6b86b",
  water: "#58c9c0",
  coral: "#ff6b43",
};

const starterBuilder = (id: number): Builder => ({
  id,
  name: "",
  stack: "",
  mission: "",
  energy: "Barefoot shipping",
  ritual: "Git push & pray",
  photo: "",
  fileName: "",
  zoom: 1,
  offsetX: 0,
  offsetY: 0,
  classSeed: 0,
});

function hashText(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) hash = (hash * 31 + value.charCodeAt(index)) | 0;
  return Math.abs(hash);
}

function getBuilderClass(builder: Builder) {
  const key = `${builder.name}-${builder.stack}-${builder.energy}-${builder.ritual}-${builder.id}-${builder.classSeed}`;
  return BUILDER_CLASSES[hashText(key) % BUILDER_CLASSES.length];
}

function getAccent(energy: string) {
  if (energy === "Monsoon mode") return COLORS.water;
  if (energy === "Sunset sprint") return COLORS.coral;
  if (energy === "Chai-fuelled") return COLORS.yellow;
  return COLORS.pink;
}

function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = source;
  });
}

function drawCover(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  zoom: number,
  offsetX: number,
  offsetY: number,
) {
  const baseScale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const scale = baseScale * zoom;
  const sourceWidth = width / scale;
  const sourceHeight = height / scale;
  const maxX = Math.max(0, image.naturalWidth - sourceWidth);
  const maxY = Math.max(0, image.naturalHeight - sourceHeight);
  const sourceX = Math.min(maxX, Math.max(0, maxX / 2 - (offsetX / 100) * maxX));
  const sourceY = Math.min(maxY, Math.max(0, maxY / 2 - (offsetY / 100) * maxY));
  context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height);
}

function cutCornerPath(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, cut = 24) {
  context.beginPath();
  context.moveTo(x + cut, y);
  context.lineTo(x + width, y);
  context.lineTo(x + width, y + height - cut);
  context.lineTo(x + width - cut, y + height);
  context.lineTo(x, y + height);
  context.lineTo(x, y + cut);
  context.closePath();
}

function drawFrameDoodles(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  accent: string,
) {
  const unit = width / 420;
  context.save();
  context.lineJoin = "bevel";
  context.lineCap = "square";
  context.strokeStyle = COLORS.ink;
  context.lineWidth = 5 * unit;

  // Isometric build cube, half on the frame and half on the portrait.
  const cubeX = x + width * .77;
  const cubeY = y + height * .08;
  const cube = 32 * unit;
  context.fillStyle = COLORS.yellow;
  context.beginPath(); context.moveTo(cubeX, cubeY); context.lineTo(cubeX + cube, cubeY - cube * .5); context.lineTo(cubeX + cube * 2, cubeY); context.lineTo(cubeX + cube, cubeY + cube * .55); context.closePath(); context.fill(); context.stroke();
  context.fillStyle = accent;
  context.beginPath(); context.moveTo(cubeX, cubeY); context.lineTo(cubeX + cube, cubeY + cube * .55); context.lineTo(cubeX + cube, cubeY + cube * 1.6); context.lineTo(cubeX, cubeY + cube); context.closePath(); context.fill(); context.stroke();
  context.fillStyle = COLORS.water;
  context.beginPath(); context.moveTo(cubeX + cube, cubeY + cube * .55); context.lineTo(cubeX + cube * 2, cubeY); context.lineTo(cubeX + cube * 2, cubeY + cube); context.lineTo(cubeX + cube, cubeY + cube * 1.6); context.closePath(); context.fill(); context.stroke();

  // Tiny beach bot.
  const botX = x + width * .08;
  const botY = y + height * .13;
  context.fillStyle = COLORS.yellow;
  context.fillRect(botX, botY, 52 * unit, 42 * unit);
  context.strokeRect(botX, botY, 52 * unit, 42 * unit);
  context.fillStyle = COLORS.ink;
  context.fillRect(botX + 12 * unit, botY + 13 * unit, 7 * unit, 7 * unit);
  context.fillRect(botX + 34 * unit, botY + 13 * unit, 7 * unit, 7 * unit);
  context.beginPath();
  context.moveTo(botX + 10 * unit, botY + 42 * unit); context.lineTo(botX - 2 * unit, botY + 61 * unit);
  context.moveTo(botX + 42 * unit, botY + 42 * unit); context.lineTo(botX + 55 * unit, botY + 61 * unit);
  context.moveTo(botX, botY + 22 * unit); context.lineTo(botX - 16 * unit, botY + 12 * unit);
  context.moveTo(botX + 52 * unit, botY + 22 * unit); context.lineTo(botX + 68 * unit, botY + 8 * unit);
  context.stroke();

  // Palm scratch, wave ticks and lightning bolt.
  context.strokeStyle = COLORS.yellow;
  context.lineWidth = 7 * unit;
  const palmX = x + width * .12;
  const palmY = y + height * .66;
  context.beginPath(); context.moveTo(palmX, palmY + 70 * unit); context.lineTo(palmX - 7 * unit, palmY + 18 * unit); context.stroke();
  [[-7,18,-37,-5],[-7,18,-20,-22],[-7,18,11,-20],[-7,18,35,-3]].forEach(([x1,y1,x2,y2]) => {
    context.beginPath(); context.moveTo(palmX + x1 * unit, palmY + y1 * unit); context.lineTo(palmX + x2 * unit, palmY + y2 * unit); context.stroke();
  });
  context.fillStyle = accent;
  const boltX = x + width * .85;
  const boltY = y + height * .54;
  context.beginPath(); context.moveTo(boltX, boltY); context.lineTo(boltX - 26 * unit, boltY + 36 * unit); context.lineTo(boltX - 8 * unit, boltY + 36 * unit); context.lineTo(boltX - 34 * unit, boltY + 76 * unit); context.lineTo(boltX + 22 * unit, boltY + 27 * unit); context.lineTo(boltX + 2 * unit, boltY + 27 * unit); context.closePath(); context.fill();
  context.strokeStyle = COLORS.ink;
  context.lineWidth = 3 * unit;
  for (let index = 0; index < 4; index += 1) {
    context.beginPath();
    context.moveTo(x + width * .62 + index * 18 * unit, y + height * .9 + (index % 2) * 6 * unit);
    context.lineTo(x + width * .62 + index * 18 * unit + 11 * unit, y + height * .9 + (index % 2) * 6 * unit);
    context.stroke();
  }
  context.restore();
}

function fitText(context: CanvasRenderingContext2D, text: string, maxWidth: number, startSize: number, family: string) {
  let size = startSize;
  do {
    context.font = `400 ${size}px ${family}`;
    if (context.measureText(text).width <= maxWidth) break;
    size -= 2;
  } while (size > 18);
}

export default function Home() {
  const [builders, setBuilders] = useState<Builder[]>([starterBuilder(1)]);
  const [activeId, setActiveId] = useState(1);
  const [format, setFormat] = useState<Format>("id");
  const [status, setStatus] = useState("Your build station is waiting.");
  const [isDropping, setIsDropping] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const checkinRef = useRef<HTMLElement>(null);
  const dragRef = useRef<{ x: number; y: number; startX: number; startY: number } | null>(null);

  const activeBuilder = builders.find((builder) => builder.id === activeId) ?? builders[0];
  const completedBuilders = builders.filter((builder) => builder.photo);
  const activeClass = useMemo(() => getBuilderClass(activeBuilder), [activeBuilder]);

  function updateBuilder(patch: Partial<Builder>, id = activeId) {
    setBuilders((current) => current.map((builder) => (builder.id === id ? { ...builder, ...patch } : builder)));
  }

  function ingestFile(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/") && !/\.(heic|heif)$/i.test(file.name)) {
      setStatus("That file missed the beach. Try a JPG, PNG or HEIC photo.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      updateBuilder({ photo: String(reader.result), fileName: file.name, zoom: 1, offsetX: 0, offsetY: 0 });
      setStatus("Photo developed. Move it, answer the beach check-in, then ship it.");
    };
    reader.onerror = () => setStatus("That photo would not develop. Try another image.");
    reader.readAsDataURL(file);
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    ingestFile(event.target.files?.[0]);
    event.target.value = "";
  }

  function onDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    setIsDropping(false);
    ingestFile(event.dataTransfer.files?.[0]);
  }

  function addTeammate() {
    if (builders.length >= 3) {
      setStatus("The beach table fits three builders. That is the whole crew.");
      return;
    }
    const nextId = Math.max(...builders.map((builder) => builder.id)) + 1;
    setBuilders((current) => [...current, starterBuilder(nextId)]);
    setActiveId(nextId);
    setFormat("team");
    setStatus("A chair is open. Add your teammate’s photo.");
    requestAnimationFrame(() => fileInputRef.current?.click());
  }

  function removeTeammate(id: number) {
    if (builders.length === 1) return;
    const remaining = builders.filter((builder) => builder.id !== id);
    setBuilders(remaining);
    if (id === activeId) setActiveId(remaining[0].id);
    setStatus("That chair is free again.");
  }

  function onCropPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (!activeBuilder.photo) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { x: event.clientX, y: event.clientY, startX: activeBuilder.offsetX, startY: activeBuilder.offsetY };
  }

  function onCropPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return;
    updateBuilder({
      offsetX: Math.max(-50, Math.min(50, dragRef.current.startX + (event.clientX - dragRef.current.x) / 3)),
      offsetY: Math.max(-50, Math.min(50, dragRef.current.startY + (event.clientY - dragRef.current.y) / 3)),
    });
  }

  function onCropPointerUp() {
    dragRef.current = null;
  }

  async function renderCanvas() {
    const people = (format === "team" ? completedBuilders : [activeBuilder]).filter((builder) => builder.photo);
    if (!people.length) throw new Error("Drop a photo before you ship this signal.");
    await document.fonts.ready;

    const canvas = document.createElement("canvas");
    canvas.width = format === "team" ? 1600 : 1080;
    canvas.height = format === "id" ? 1350 : format === "pfp" ? 1080 : 1000;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("This browser could not open the print room.");
    const { width, height } = canvas;

    context.fillStyle = COLORS.green;
    context.fillRect(0, 0, width, height);
    context.fillStyle = COLORS.yellow;
    context.save();
    context.translate(width * 0.82, height * 0.09);
    context.rotate(Math.PI / 5);
    context.fillRect(-height * 0.13, -height * 0.13, height * 0.26, height * 0.26);
    context.restore();

    context.fillStyle = COLORS.paper;
    context.font = `400 ${Math.round(width * 0.052)}px "Bowlby One SC"`;
    context.fillText(format === "team" ? "CREW SIGNAL" : "BUILDER SIGNAL", width * 0.05, height * 0.095);
    context.fillStyle = COLORS.yellow;
    context.font = `700 ${Math.round(width * 0.022)}px monospace`;
    context.fillText("HH GOA · 28—31 OCT 2026", width * 0.052, height * 0.135);

    const gap = 28;
    const cardWidth = format === "team" ? (width - 112 - gap * (people.length - 1)) / people.length : width * 0.76;
    const cardHeight = format === "team" ? height * 0.63 : format === "pfp" ? height * 0.72 : height * 0.69;
    const startX = format === "team" ? 56 : (width - cardWidth) / 2;
    const cardY = height * 0.18;

    for (let index = 0; index < people.length; index += 1) {
      const builder = people[index];
      const x = startX + index * (cardWidth + gap);
      const accent = getAccent(builder.energy);
      context.fillStyle = COLORS.paper;
      context.strokeStyle = COLORS.ink;
      context.lineWidth = 9;
      cutCornerPath(context, x, cardY, cardWidth, cardHeight, 28);
      context.fill();
      context.stroke();

      const pad = cardWidth * 0.055;
      const photoHeight = cardHeight * 0.56;
      const image = await loadImage(builder.photo);
      context.save();
      context.beginPath();
      context.rect(x + pad, cardY + pad, cardWidth - pad * 2, photoHeight);
      context.clip();
      drawCover(context, image, x + pad, cardY + pad, cardWidth - pad * 2, photoHeight, builder.zoom, builder.offsetX, builder.offsetY);
      context.restore();

      drawFrameDoodles(context, x, cardY, cardWidth, cardHeight, accent);

      context.fillStyle = accent;
      context.fillRect(x + pad, cardY + pad + photoHeight - 18, cardWidth - pad * 2, 30);
      context.fillStyle = COLORS.ink;
      const name = (builder.name || `BUILDER ${index + 1}`).toUpperCase().slice(0, 18);
      fitText(context, name, cardWidth - pad * 2, cardWidth * 0.095, '"Bowlby One SC"');
      context.fillText(name, x + pad, cardY + pad + photoHeight + cardHeight * 0.13);
      context.fillStyle = COLORS.pink;
      context.font = `400 ${Math.max(24, Math.round(cardWidth * 0.055))}px Modak`;
      context.fillText(getBuilderClass(builder), x + pad, cardY + pad + photoHeight + cardHeight * 0.205);
      context.fillStyle = COLORS.ink;
      context.font = `700 ${Math.max(15, Math.round(cardWidth * 0.031))}px monospace`;
      context.fillText((builder.stack || "MAKING SOMETHING THAT MATTERS").toUpperCase().slice(0, 34), x + pad, cardY + pad + photoHeight + cardHeight * 0.26);
      context.fillText(`${builder.energy.toUpperCase()} · ${builder.ritual.toUpperCase()}`.slice(0, 46), x + pad, cardY + cardHeight - cardHeight * 0.09);
    }

    context.fillStyle = COLORS.pink;
    context.fillRect(0, height * 0.9, width, height * 0.1);
    context.fillStyle = COLORS.paper;
    context.font = `700 ${Math.round(width * 0.022)}px monospace`;
    context.fillText("LESS NOISE. MORE SIGNAL. · #FRAMEINGOA", width * 0.05, height * 0.958);
    return canvas;
  }

  async function downloadSignal() {
    try {
      setStatus("The print room is developing your signal…");
      const canvas = await renderCanvas();
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("The print room jammed. Try once more.");
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `hh-goa-${format}-signal.png`;
      anchor.click();
      URL.revokeObjectURL(url);
      setStatus("Signal shipped. See you on the sand.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "This signal did not export.");
    }
  }

  function shareToX() {
    if (!completedBuilders.length) {
      setStatus("Drop a photo before you send a signal.");
      return;
    }
    const names = completedBuilders.map((builder) => builder.name || "a builder").join(", ");
    const message = `Signal found 🌴 ${names} will be building from Goa at HH Goa 2026. ${activeClass} energy. Less noise. More signal. #FrameInGoa`;
    window.open(`https://x.com/intent/post?text=${encodeURIComponent(message)}&url=${encodeURIComponent(window.location.href)}`, "_blank", "noopener,noreferrer");
    setStatus("X is open. Add the PNG and let the signal travel.");
  }

  const cropStyle = activeBuilder.photo ? {
    backgroundImage: `url(${activeBuilder.photo})`,
    backgroundPosition: `${50 + activeBuilder.offsetX}% ${50 + activeBuilder.offsetY}%`,
    backgroundSize: activeBuilder.zoom === 1 ? "cover" : `${activeBuilder.zoom * 100}%`,
  } : undefined;

  return (
    <main className="experience-shell">
      <BeachScene
        builderClass={activeClass}
        energy={activeBuilder.energy}
        mission={activeBuilder.mission}
        name={activeBuilder.name}
        offsetX={activeBuilder.offsetX}
        offsetY={activeBuilder.offsetY}
        photo={activeBuilder.photo}
        ritual={activeBuilder.ritual}
        stack={activeBuilder.stack}
        zoom={activeBuilder.zoom}
      />

      <header className="topbar">
        <a className="brand" href="#top" aria-label="Signal on the Sand home">
          <span>HH</span><b>GOA</b><small>’26</small>
        </a>
        <div className="topbar__date">28—31 OCT · GOA, INDIA</div>
        <a href="https://hhgoa.com/" target="_blank" rel="noreferrer">EVENT SITE ↗</a>
      </header>

      <section className="hero" id="top" aria-labelledby="page-title">
        <div className="hero__copy">
          <p className="kicker">TASK 01 · YOUR ARRIVAL RITUAL</p>
          <h1 id="page-title">
            <span className="hero__make">MAKE YOUR</span>
            <span className="hero__signal" aria-label="Signal">
              {"SIGNAL".split("").map((letter, index) => <i key={letter + index} style={{ "--letter": index } as React.CSSProperties}>{letter}</i>)}
            </span>
          </h1>
          <div className="hero-note">
            <strong>DROP A PHOTO.</strong>
            <span>Answer the beach check-in, meet your strange new builder class, and send your signal toward Goa.</span>
          </div>
          <button className="enter-button" onClick={() => checkinRef.current?.scrollIntoView({ behavior: "smooth" })} type="button">
            ENTER THE BUILD STATION <span>↓</span>
          </button>
        </div>
        <div className="scene-instruction" aria-hidden="true">
          <span>MOVE TO BEND THE LIGHT</span>
          <span>CLICK THE SIGNAL TO FLIP IT</span>
        </div>
      </section>

      <section
        className={`checkin ${isDropping ? "is-dropping" : ""}`}
        id="build-station"
        ref={checkinRef}
        onDragEnter={(event) => { event.preventDefault(); setIsDropping(true); }}
        onDragLeave={() => setIsDropping(false)}
        onDragOver={(event) => event.preventDefault()}
        onDrop={onDrop}
      >
        <div className="checkin-panel">
          <div className="panel-heading">
            <div><small>BEACH CHECK-IN</small><h2>WHO JUST LANDED?</h2></div>
            <b>{String(activeId).padStart(2, "0")}/{String(builders.length).padStart(2, "0")}</b>
          </div>

          <div className="builder-tabs" aria-label="Crew members">
            {builders.map((builder, index) => (
              <button className={builder.id === activeId ? "is-active" : ""} key={builder.id} onClick={() => setActiveId(builder.id)} type="button">
                <span>{index + 1}</span>{builder.name || `Mystery builder ${index + 1}`}
              </button>
            ))}
            {builders.length < 3 && <button className="add-builder" onClick={addTeammate} type="button">+ PULL UP A CHAIR</button>}
          </div>

          {!activeBuilder.photo ? (
            <button className="photo-drop" onClick={() => fileInputRef.current?.click()} type="button">
              <span className="photo-drop__plus">+</span>
              <span><strong>DROP YOUR BEST “I SHIPPED IT” FACE</strong><small>JPG, PNG or HEIC · stays on your device</small></span>
            </button>
          ) : (
            <div className="crop-row">
              <div
                className="crop-window"
                onPointerDown={onCropPointerDown}
                onPointerMove={onCropPointerMove}
                onPointerUp={onCropPointerUp}
                onPointerCancel={onCropPointerUp}
                style={cropStyle}
                role="img"
                aria-label="Drag to reposition your photo"
              ><span>DRAG ME</span></div>
              <div className="crop-controls">
                <button onClick={() => fileInputRef.current?.click()} type="button">SWAP THE FACE ↻</button>
                <label><span>COME CLOSER</span><input aria-label="Photo zoom" max="2" min="1" onChange={(event) => updateBuilder({ zoom: Number(event.target.value) })} step="0.01" type="range" value={activeBuilder.zoom} /></label>
              </div>
            </div>
          )}

          <div className="question-grid">
            <label className="question question--name">
              <span>WHAT DO WE SHOUT WHEN YOUR DEMO WORKS?</span>
              <input maxLength={18} onChange={(event) => updateBuilder({ name: event.target.value })} placeholder="Your name" value={activeBuilder.name} />
            </label>
            <label className="question question--stack">
              <span>WHAT KEEPS YOUR TERMINAL GLOWING AFTER MIDNIGHT?</span>
              <input maxLength={34} onChange={(event) => updateBuilder({ stack: event.target.value })} placeholder="AI, Rust, pixels, questionable APIs…" value={activeBuilder.stack} />
            </label>
            <label className="question question--mission">
              <span>WHAT ARE YOU HERE TO CAUSE?</span>
              <textarea maxLength={52} onChange={(event) => updateBuilder({ mission: event.target.value })} placeholder="A tiny description of your beautiful trouble" rows={2} value={activeBuilder.mission} />
              <small>{activeBuilder.mission.length}/52</small>
            </label>
          </div>

          <fieldset className="choice-question">
            <legend>PICK YOUR BEACH-SIDE BUILD ENERGY</legend>
            <div>{ENERGIES.map((energy) => <button className={activeBuilder.energy === energy ? "is-active" : ""} key={energy} onClick={() => updateBuilder({ energy })} type="button">{energy}</button>)}</div>
          </fieldset>

          <fieldset className="choice-question">
            <legend>YOUR TINY RITUAL BEFORE YOU SHIP?</legend>
            <div>{RITUALS.map((ritual) => <button className={activeBuilder.ritual === ritual ? "is-active" : ""} key={ritual} onClick={() => updateBuilder({ ritual })} type="button">{ritual}</button>)}</div>
          </fieldset>

          <div className="class-reveal">
            <div><small>THE BEACH HAS DECIDED</small><strong>{activeClass}</strong></div>
            <button onClick={() => updateBuilder({ classSeed: activeBuilder.classSeed + 1 })} type="button">NOPE, AGAIN ↻</button>
          </div>

          <div className="output-row">
            <div className="format-switcher" aria-label="Signal format">
              {(["id", "pfp", "team"] as Format[]).map((item) => (
                <button className={format === item ? "is-active" : ""} key={item} onClick={() => setFormat(item)} type="button">
                  {item === "id" ? "BUILDER ID" : item === "pfp" ? "PFP" : "CREW FRAME"}
                </button>
              ))}
            </div>
            <div className="action-row">
              <button className="download" onClick={downloadSignal} type="button">DOWNLOAD THE SIGNAL ↓</button>
              <button className="share" onClick={shareToX} type="button">SEND IT TO X ↗</button>
            </div>
          </div>

          {builders.length > 1 && <button className="remove-builder" onClick={() => removeTeammate(activeId)} type="button">REMOVE THIS BUILDER</button>}
          <p className="status" role="status" aria-live="polite">{status}</p>
        </div>
        <aside className="checkin-aside" aria-hidden="true">
          <span>YOUR LIVE SIGNAL IS FLOATING RIGHT THERE.</span>
          <b>CLICK IT.<br />IT HAS A BACK.</b>
        </aside>
      </section>

      <input accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif" className="visually-hidden" onChange={onFileChange} ref={fileInputRef} type="file" />
      <footer><span>LESS NOISE. MORE SIGNAL.</span><span>NOT AN OFFICIAL EVENT CREDENTIAL.</span><span>RIFF RAFF · EXPERIENCE DRIVEN DESIGN</span></footer>
    </main>
  );
}
