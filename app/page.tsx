"use client";

import {
  ChangeEvent,
  DragEvent,
  PointerEvent as ReactPointerEvent,
  useMemo,
  useRef,
  useState,
} from "react";

type Format = "id" | "pfp" | "team";

type Builder = {
  id: number;
  name: string;
  stack: string;
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
];

const COLORS = {
  green: "#0b6839",
  greenDark: "#064628",
  yellow: "#fee101",
  pink: "#ff0080",
  paper: "#fffbe8",
  ink: "#082f20",
  sand: "#e6b86b",
};

const starterBuilder = (id: number): Builder => ({
  id,
  name: "",
  stack: "",
  photo: "",
  fileName: "",
  zoom: 1,
  offsetX: 0,
  offsetY: 0,
  classSeed: 0,
});

function hashText(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0;
  }
  return Math.abs(hash);
}

function getBuilderClass(builder: Builder) {
  const key = `${builder.name || "builder"}-${builder.stack || "maker"}-${builder.id}-${builder.classSeed}`;
  return BUILDER_CLASSES[hashText(key) % BUILDER_CLASSES.length];
}

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
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

function PalmMark({ small = false }: { small?: boolean }) {
  return (
    <span className={`palm-mark ${small ? "palm-mark--small" : ""}`} aria-hidden="true">
      <i className="palm-mark__trunk" />
      <i className="palm-mark__leaf palm-mark__leaf--1" />
      <i className="palm-mark__leaf palm-mark__leaf--2" />
      <i className="palm-mark__leaf palm-mark__leaf--3" />
      <i className="palm-mark__leaf palm-mark__leaf--4" />
      <i className="palm-mark__leaf palm-mark__leaf--5" />
    </span>
  );
}

export default function Home() {
  const [builders, setBuilders] = useState<Builder[]>([starterBuilder(1)]);
  const [activeId, setActiveId] = useState(1);
  const [format, setFormat] = useState<Format>("id");
  const [status, setStatus] = useState("Waiting for your signal.");
  const [isDropping, setIsDropping] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<{ x: number; y: number; startX: number; startY: number } | null>(null);

  const activeBuilder = builders.find((builder) => builder.id === activeId) ?? builders[0];
  const completedBuilders = builders.filter((builder) => builder.photo);
  const activeClass = useMemo(() => getBuilderClass(activeBuilder), [activeBuilder]);

  function updateBuilder(patch: Partial<Builder>, id = activeId) {
    setBuilders((current) =>
      current.map((builder) => (builder.id === id ? { ...builder, ...patch } : builder)),
    );
  }

  function ingestFile(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/") && !/\.(heic|heif)$/i.test(file.name)) {
      setStatus("That file is not an image. Try a JPG, PNG, or HEIC photo.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      updateBuilder({
        photo: String(reader.result),
        fileName: file.name,
        zoom: 1,
        offsetX: 0,
        offsetY: 0,
      });
      setStatus("Photo developed. Add your details or move straight to download.");
    };
    reader.onerror = () => setStatus("We couldn’t read that photo. Try another image.");
    reader.readAsDataURL(file);
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    ingestFile(event.target.files?.[0]);
    event.target.value = "";
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDropping(false);
    ingestFile(event.dataTransfer.files?.[0]);
  }

  function addTeammate() {
    if (builders.length >= 3) {
      setStatus("Crew frames hold up to three builders.");
      return;
    }
    const nextId = Math.max(...builders.map((builder) => builder.id)) + 1;
    setBuilders((current) => [...current, starterBuilder(nextId)]);
    setActiveId(nextId);
    setFormat("team");
    setStatus("Teammate slot ready. Drop in their photo.");
    requestAnimationFrame(() => fileInputRef.current?.click());
  }

  function removeTeammate(id: number) {
    if (builders.length === 1) return;
    const remaining = builders.filter((builder) => builder.id !== id);
    setBuilders(remaining);
    if (activeId === id) setActiveId(remaining[0].id);
    setStatus("Teammate removed from this signal.");
  }

  function onPhotoPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (!activeBuilder.photo) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      x: event.clientX,
      y: event.clientY,
      startX: activeBuilder.offsetX,
      startY: activeBuilder.offsetY,
    };
  }

  function onPhotoPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return;
    const nextX = Math.max(-50, Math.min(50, dragRef.current.startX + (event.clientX - dragRef.current.x) / 3));
    const nextY = Math.max(-50, Math.min(50, dragRef.current.startY + (event.clientY - dragRef.current.y) / 3));
    updateBuilder({ offsetX: nextX, offsetY: nextY });
  }

  function onPhotoPointerUp() {
    dragRef.current = null;
  }

  async function renderCanvas() {
    const people = (format === "team" ? completedBuilders : [activeBuilder]).filter(
      (builder) => builder.photo,
    );
    if (!people.length) throw new Error("Add a photo before exporting.");

    const canvas = document.createElement("canvas");
    const width = format === "team" ? 1600 : 1080;
    const height = format === "id" ? 1350 : format === "pfp" ? 1080 : 1000;
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas is unavailable in this browser.");

    context.fillStyle = COLORS.green;
    context.fillRect(0, 0, width, height);
    context.fillStyle = COLORS.yellow;
    context.beginPath();
    context.arc(width * 0.79, height * 0.13, height * 0.16, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = COLORS.pink;
    context.fillRect(0, height * 0.82, width, height * 0.18);

    context.strokeStyle = COLORS.ink;
    context.lineWidth = 8;
    for (let index = 0; index < 4; index += 1) {
      context.beginPath();
      const lineY = height * 0.72 + index * 22;
      context.moveTo(0, lineY);
      context.bezierCurveTo(width * 0.25, lineY - 26, width * 0.7, lineY + 35, width, lineY - 5);
      context.stroke();
    }

    context.fillStyle = COLORS.yellow;
    context.font = `700 ${Math.round(width * 0.04)}px monospace`;
    context.fillText("HH GOA · 28—31 OCT 2026", width * 0.055, height * 0.07);
    context.fillStyle = COLORS.paper;
    context.font = `900 ${Math.round(width * 0.075)}px Georgia`;
    context.fillText(format === "team" ? "CREW SIGNAL" : "BUILDER SIGNAL", width * 0.052, height * 0.15);

    const gap = 28;
    const cardWidth = format === "team" ? (width - 112 - gap * (people.length - 1)) / people.length : width * 0.74;
    const cardHeight = format === "team" ? height * 0.59 : format === "pfp" ? height * 0.69 : height * 0.64;
    const startX = format === "team" ? 56 : (width - cardWidth) / 2;
    const cardY = format === "id" ? height * 0.2 : height * 0.19;

    for (let index = 0; index < people.length; index += 1) {
      const builder = people[index];
      const x = startX + index * (cardWidth + gap);
      context.save();
      context.fillStyle = COLORS.paper;
      context.strokeStyle = COLORS.ink;
      context.lineWidth = 9;
      roundedRect(context, x, cardY, cardWidth, cardHeight, 22);
      context.fill();
      context.stroke();

      const image = await loadImage(builder.photo);
      const pad = cardWidth * 0.055;
      const photoHeight = cardHeight * (format === "pfp" ? 0.72 : 0.64);
      roundedRect(context, x + pad, cardY + pad, cardWidth - pad * 2, photoHeight, 12);
      context.clip();
      drawCover(
        context,
        image,
        x + pad,
        cardY + pad,
        cardWidth - pad * 2,
        photoHeight,
        builder.zoom,
        builder.offsetX,
        builder.offsetY,
      );
      context.restore();

      context.fillStyle = COLORS.yellow;
      context.fillRect(x + pad, cardY + pad + photoHeight - 24, cardWidth - pad * 2, 24);
      context.fillStyle = COLORS.ink;
      context.font = `900 ${Math.max(30, Math.round(cardWidth * 0.09))}px Georgia`;
      const name = (builder.name || `BUILDER ${index + 1}`).toUpperCase().slice(0, 19);
      context.fillText(name, x + pad, cardY + pad + photoHeight + cardHeight * 0.13);
      context.font = `700 ${Math.max(18, Math.round(cardWidth * 0.042))}px monospace`;
      context.fillText((builder.stack || "MAKING SOMETHING THAT MATTERS").toUpperCase().slice(0, 28), x + pad, cardY + pad + photoHeight + cardHeight * 0.2);
      context.fillStyle = COLORS.pink;
      context.fillRect(x + pad, cardY + cardHeight - cardHeight * 0.105, cardWidth - pad * 2, cardHeight * 0.065);
      context.fillStyle = COLORS.paper;
      context.font = `700 ${Math.max(15, Math.round(cardWidth * 0.033))}px monospace`;
      context.fillText(getBuilderClass(builder), x + pad * 1.3, cardY + cardHeight - cardHeight * 0.06);
    }

    context.fillStyle = COLORS.ink;
    context.font = `700 ${Math.round(width * 0.027)}px monospace`;
    context.fillText("LESS NOISE. MORE SIGNAL. · #FRAMEINGOA", width * 0.055, height * 0.955);
    return canvas;
  }

  async function downloadSignal() {
    try {
      setStatus("Developing your high-resolution signal…");
      const canvas = await renderCanvas();
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("Export failed.");
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `hh-goa-${format}-signal.png`;
      anchor.click();
      URL.revokeObjectURL(url);
      setStatus("Signal downloaded. See you on the sand.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Couldn’t export this signal.");
    }
  }

  function shareToX() {
    if (!completedBuilders.length) {
      setStatus("Add a photo before sharing your signal.");
      return;
    }
    const names = completedBuilders.map((builder) => builder.name || "a builder").join(", ");
    const message = `Signal found 🌴 ${names} will be building from Goa at HH Goa 2026. Less noise. More signal. #FrameInGoa`;
    window.open(`https://x.com/intent/post?text=${encodeURIComponent(message)}&url=${encodeURIComponent(window.location.href)}`, "_blank", "noopener,noreferrer");
    setStatus("X is open with your caption ready.");
  }

  const photoStyle = activeBuilder.photo
    ? {
        backgroundImage: `url(${activeBuilder.photo})`,
        backgroundSize: activeBuilder.zoom === 1 ? "cover" : `${activeBuilder.zoom * 100}%`,
        backgroundPosition: `${50 + activeBuilder.offsetX}% ${50 + activeBuilder.offsetY}%`,
      }
    : undefined;

  return (
    <main
      className="site-shell"
      onPointerMove={(event) => {
        const x = (event.clientX / window.innerWidth - 0.5) * 2;
        const y = (event.clientY / window.innerHeight - 0.5) * 2;
        event.currentTarget.style.setProperty("--pointer-x", x.toFixed(3));
        event.currentTarget.style.setProperty("--pointer-y", y.toFixed(3));
      }}
    >
      <div className="sun" aria-hidden="true" />
      <div className="cloud cloud--one" aria-hidden="true" />
      <div className="cloud cloud--two" aria-hidden="true" />
      <div className="horizon" aria-hidden="true">
        <div className="horizon__line horizon__line--one" />
        <div className="horizon__line horizon__line--two" />
        <div className="horizon__line horizon__line--three" />
      </div>
      <div className="shore" aria-hidden="true" />
      <div className="palm palm--left" aria-hidden="true"><PalmMark /></div>
      <div className="palm palm--right" aria-hidden="true"><PalmMark /></div>

      <header className="topbar">
        <a className="brand" href="#main-workstation" aria-label="HH Goa Signal home">
          <span className="brand__hh">HH</span>
          <span className="brand__goa">GOA</span>
          <span className="brand__year">’26</span>
        </a>
        <div className="topbar__meta">GOA, INDIA · 28—31 OCT 2026</div>
        <a className="quiet-link" href="https://hhgoa.com/" target="_blank" rel="noreferrer">
          EVENT SITE ↗
        </a>
      </header>

      <section className="intro" aria-labelledby="page-title">
        <p className="eyebrow"><span /> TASK 01 · BUILDER ID</p>
        <h1 id="page-title">LESS NOISE.<br /><em>MAKE YOUR SIGNAL.</em></h1>
        <p className="intro__copy">Drop a photo. Claim your builder class. Meet your crew on the sand.</p>
      </section>

      <section className="workstation" id="main-workstation" aria-label="Builder Signal workstation">
        <div className="desk-edge" aria-hidden="true" />
        <div className="sticker sticker--wifi" aria-hidden="true">HIGH-SPEED<br />FIBER</div>
        <div className="sticker sticker--ship" aria-hidden="true">SHIP<br />OR SHIP</div>

        <div className="controls-panel">
          <div className="format-switcher" aria-label="Signal format">
            {(["id", "pfp", "team"] as Format[]).map((item) => (
              <button
                className={format === item ? "is-active" : ""}
                key={item}
                onClick={() => setFormat(item)}
                type="button"
              >
                {item === "id" ? "BUILDER" : item === "pfp" ? "PFP" : "CREW"}
              </button>
            ))}
          </div>

          <div className="builder-tabs" aria-label="Crew members">
            {builders.map((builder, index) => (
              <button
                className={builder.id === activeId ? "builder-tab is-active" : "builder-tab"}
                key={builder.id}
                onClick={() => setActiveId(builder.id)}
                type="button"
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                {builder.name || `Builder ${index + 1}`}
              </button>
            ))}
            {builders.length < 3 && (
              <button className="builder-tab builder-tab--add" onClick={addTeammate} type="button">
                + Add teammate
              </button>
            )}
          </div>

          <div className="field-row">
            <label>
              <span>YOUR NAME</span>
              <input
                maxLength={19}
                onChange={(event) => updateBuilder({ name: event.target.value })}
                placeholder="What should we call you?"
                value={activeBuilder.name}
              />
            </label>
            <label>
              <span>WHAT ARE YOU BUILDING WITH?</span>
              <input
                maxLength={28}
                onChange={(event) => updateBuilder({ stack: event.target.value })}
                placeholder="Design, Rust, AI…"
                value={activeBuilder.stack}
              />
            </label>
          </div>

          <div className="class-ticket">
            <span>GENERATED BUILDER CLASS</span>
            <strong>{activeClass}</strong>
            <button
              onClick={() => updateBuilder({ classSeed: activeBuilder.classSeed + 1 })}
              type="button"
              aria-label="Generate another builder class"
            >
              ↻ REROLL
            </button>
          </div>

          {activeBuilder.photo && (
            <label className="zoom-control">
              <span>PHOTO ZOOM</span>
              <input
                aria-label="Photo zoom"
                max="2"
                min="1"
                onChange={(event) => updateBuilder({ zoom: Number(event.target.value) })}
                step="0.01"
                type="range"
                value={activeBuilder.zoom}
              />
            </label>
          )}

          <div className="action-row">
            <button className="action action--download" onClick={downloadSignal} type="button">
              DOWNLOAD PNG ↓
            </button>
            <button className="action action--share" onClick={shareToX} type="button">
              SHARE TO X ↗
            </button>
          </div>
          <p className="status" role="status" aria-live="polite">{status}</p>
          <p className="privacy-note">YOUR PHOTO NEVER LEAVES THIS DEVICE.</p>
        </div>

        <div
          className={`signal-stage signal-stage--${format} ${isDropping ? "is-dropping" : ""}`}
          onDragEnter={(event) => { event.preventDefault(); setIsDropping(true); }}
          onDragLeave={() => setIsDropping(false)}
          onDragOver={(event) => event.preventDefault()}
          onDrop={onDrop}
        >
          <div className="print-shadow" aria-hidden="true" />
          <div className="signal-print">
            <div className="signal-print__topline">
              <span>HH GOA</span><span>28—31 OCT</span>
            </div>
            {format === "team" ? (
              <div className="crew-preview">
                {builders.map((builder, index) => (
                  <button
                    className={`crew-slot ${builder.id === activeId ? "is-active" : ""}`}
                    key={builder.id}
                    onClick={() => setActiveId(builder.id)}
                    style={builder.photo ? {
                      backgroundImage: `url(${builder.photo})`,
                      backgroundSize: builder.zoom === 1 ? "cover" : `${builder.zoom * 100}%`,
                      backgroundPosition: `${50 + builder.offsetX}% ${50 + builder.offsetY}%`,
                    } : undefined}
                    type="button"
                  >
                    {!builder.photo && <span>+<small>BUILDER {index + 1}</small></span>}
                  </button>
                ))}
              </div>
            ) : (
              <div
                className="photo-window"
                onPointerDown={onPhotoPointerDown}
                onPointerMove={onPhotoPointerMove}
                onPointerUp={onPhotoPointerUp}
                onPointerCancel={onPhotoPointerUp}
                style={photoStyle}
              >
                {!activeBuilder.photo && (
                  <button className="upload-prompt" onClick={() => fileInputRef.current?.click()} type="button">
                    <span className="upload-prompt__sun">+</span>
                    <strong>DROP YOUR PHOTO</strong>
                    <small>JPG · PNG · HEIC</small>
                  </button>
                )}
                {activeBuilder.photo && <span className="drag-hint">DRAG TO FRAME</span>}
              </div>
            )}
            <div className="signal-print__identity">
              <small>{format === "team" ? "CREW SIGNAL" : activeClass}</small>
              <strong>{format === "team" ? "BUILD TOGETHER" : activeBuilder.name || "YOUR NAME"}</strong>
              <span>{format === "team" ? `${completedBuilders.length || 0} / ${builders.length} BUILDERS READY` : activeBuilder.stack || "MAKING SOMETHING THAT MATTERS"}</span>
            </div>
            <div className="signal-print__footer"><span>LESS NOISE. MORE SIGNAL.</span><b>#FRAMEINGOA</b></div>
          </div>
          {activeBuilder.photo && format !== "team" && (
            <button className="replace-photo" onClick={() => fileInputRef.current?.click()} type="button">REPLACE PHOTO</button>
          )}
          {builders.length > 1 && (
            <button className="remove-builder" onClick={() => removeTeammate(activeId)} type="button">REMOVE ACTIVE</button>
          )}
        </div>

        <input
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
          className="visually-hidden"
          onChange={onFileChange}
          ref={fileInputRef}
          type="file"
        />
      </section>

      <footer>
        <span>BUILT FOR THE BUILDERS WHO SHIP.</span>
        <span>NOT AN OFFICIAL EVENT CREDENTIAL.</span>
        <span>RIFF RAFF · EXPERIENCE DRIVEN DESIGN</span>
      </footer>
    </main>
  );
}
