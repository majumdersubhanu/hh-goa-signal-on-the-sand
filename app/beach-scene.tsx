"use client";

import { Canvas, ThreeEvent, useFrame } from "@react-three/fiber";
import QRCode from "qrcode";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

type Props = {
  name: string;
  photo: string;
  stack: string;
  builderClass: string;
  socialLabel: string;
  socialValue: string;
  socialUrl: string;
  buildMode: string;
  crewStatus: string;
  builderId: string;
  flipped: boolean;
  onFlip: (value: boolean) => void;
};

function imageFrom(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function fit(ctx: CanvasRenderingContext2D, value: string, max: number, initial: number) {
  let size = initial;
  while (size > 18) {
    ctx.font = `900 ${size}px Arial Black, sans-serif`;
    if (ctx.measureText(value).width <= max) return;
    size -= 2;
  }
}

function cover(ctx: CanvasRenderingContext2D, image: HTMLImageElement, x: number, y: number, width: number, height: number) {
  const scale = Math.max(width / image.width, height / image.height);
  const sw = width / scale;
  const sh = height / scale;
  ctx.drawImage(image, (image.width - sw) / 2, (image.height - sh) / 2, sw, sh, x, y, width, height);
}

function canvasTexture(canvas: HTMLCanvasElement) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

function paintAzulejos(ctx: CanvasRenderingContext2D, y: number, width: number) {
  for (let x = 0; x < width; x += 28) {
    ctx.fillStyle = x / 28 % 2 ? "#fff8e6" : "#d8edf0"; ctx.fillRect(x, y, 28, 24);
    ctx.strokeStyle = "#1d4e89"; ctx.lineWidth = 2; ctx.strokeRect(x, y, 28, 24);
    ctx.beginPath(); ctx.moveTo(x + 14, y + 4); ctx.lineTo(x + 24, y + 12); ctx.lineTo(x + 14, y + 20); ctx.lineTo(x + 4, y + 12); ctx.closePath(); ctx.stroke();
  }
}

function placeholderTextures() {
  const make = (background: string, headline: string) => {
    const canvas = document.createElement("canvas");
    canvas.width = 900; canvas.height = 560;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = background; ctx.fillRect(0, 0, 900, 560);
    ctx.fillStyle = "#ffd900"; ctx.fillRect(0, 0, 900, 82);
    ctx.fillStyle = "#092f25"; ctx.font = "900 42px Arial Black"; ctx.fillText(headline, 38, 56);
    paintAzulejos(ctx, 82, 900);
    ctx.strokeStyle = "#092f25"; ctx.lineWidth = 16; ctx.strokeRect(8, 8, 884, 544);
    return canvasTexture(canvas);
  };
  return { front: make("#fff8e6", "HH GOA '26 / CANDOLIM SIGNAL"), back: make("#ff4f87", "FIND ME BETWEEN THE PALMS") };
}

function useSignalTextures(props: Props) {
  const [textures, setTextures] = useState<{ front: THREE.Texture; back: THREE.Texture }>(() => placeholderTextures());
  const dependency = `${props.name}|${props.photo}|${props.stack}|${props.builderClass}|${props.socialValue}|${props.socialUrl}|${props.buildMode}|${props.crewStatus}|${props.builderId}`;

  useEffect(() => {
    let alive = true;
    const build = async () => {
      const frontCanvas = document.createElement("canvas");
      frontCanvas.width = 900; frontCanvas.height = 560;
      const front = frontCanvas.getContext("2d");
      if (!front) return;
      front.fillStyle = "#fff8e6"; front.fillRect(0, 0, 900, 560);
      front.fillStyle = "#ffd900"; front.fillRect(0, 0, 900, 82);
      front.fillStyle = "#092f25"; front.font = "900 28px Arial Black"; front.fillText("HH GOA '26  /  CANDOLIM BUILDER SIGNAL", 35, 53);
      paintAzulejos(front, 82, 900);
      front.fillStyle = "#ff4f87"; front.fillRect(32, 112, 330, 365);
      if (props.photo) {
        try { cover(front, await imageFrom(props.photo), 45, 125, 304, 339); } catch { /* keep the color block */ }
      } else {
        front.fillStyle = "#79d7cd"; front.fillRect(45, 125, 304, 339);
        front.fillStyle = "#092f25"; front.font = "900 78px Arial Black"; front.textAlign = "center"; front.fillText("YOU", 197, 325); front.textAlign = "left";
      }
      front.fillStyle = "#092f25"; front.font = "900 18px Arial Black"; front.fillText("BUILDER CLASS", 405, 155);
      front.fillStyle = "#0b6b42"; fit(front, props.builderClass, 450, 58); front.fillText(props.builderClass, 405, 222);
      front.fillStyle = "#092f25"; front.font = "900 17px Arial Black"; front.fillText("KNOWN AS", 405, 280);
      fit(front, props.name.toUpperCase(), 445, 44); front.fillText(props.name.toUpperCase(), 405, 330);
      front.font = "700 17px monospace"; front.fillText(`${props.stack} / ${props.buildMode}`, 405, 380);
      front.fillText(props.crewStatus, 405, 413);
      front.fillStyle = "#092f25"; front.fillRect(405, 446, 445, 62);
      front.fillStyle = "#ffd900"; front.font = "900 20px Arial Black"; front.fillText(`${props.builderId}  #FRAMEINGOA`, 428, 486);
      front.strokeStyle = "#092f25"; front.lineWidth = 15; front.strokeRect(7.5, 7.5, 885, 545);

      const backCanvas = document.createElement("canvas");
      backCanvas.width = 900; backCanvas.height = 560;
      const back = backCanvas.getContext("2d");
      if (!back) return;
      back.fillStyle = "#ff4f87"; back.fillRect(0, 0, 900, 560);
      back.fillStyle = "#ffd900"; back.fillRect(0, 0, 900, 82);
      back.fillStyle = "#092f25"; back.font = "900 28px Arial Black"; back.fillText("FIND ME BETWEEN THE PALMS", 35, 53);
      paintAzulejos(back, 82, 900);
      back.fillStyle = "#fff8e6"; back.font = "900 18px Arial Black"; back.fillText(props.socialLabel, 45, 153);
      fit(back, props.socialValue.toUpperCase(), 520, 56); back.fillText(props.socialValue.toUpperCase(), 45, 218);
      back.font = "700 17px monospace"; back.fillText(props.crewStatus, 45, 282);
      back.fillText(`${props.stack} / ${props.buildMode}`, 45, 318);
      try {
        const qrUrl = await QRCode.toDataURL(props.socialUrl, { margin: 1, width: 260, color: { dark: "#092f25", light: "#fff8e6" } });
        const qr = await imageFrom(qrUrl);
        back.fillStyle = "#fff8e6"; back.fillRect(635, 118, 220, 220); back.drawImage(qr, 646, 129, 198, 198);
      } catch { /* contact copy remains useful without QR */ }
      back.fillStyle = "#092f25"; back.fillRect(45, 390, 810, 78);
      back.fillStyle = "#ffd900"; back.font = "900 26px Arial Black"; back.fillText(`${props.builderId}  ·  #FRAMEINGOA`, 75, 440);
      back.fillStyle = "#fff8e6"; back.font = "900 17px Arial Black"; back.fillText("CANDOLIM, GOA / SCAN / SAY HI / BUILD SOMETHING STRANGE", 45, 515);
      back.strokeStyle = "#092f25"; back.lineWidth = 15; back.strokeRect(7.5, 7.5, 885, 545);

      const next = { front: canvasTexture(frontCanvas), back: canvasTexture(backCanvas) };
      if (alive) setTextures(next);
    };
    void build();
    return () => { alive = false; };
  }, [dependency]);
  return textures;
}

function Palm({ position = [0, 0, 0], scale = 1 }: { position?: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale} rotation={[0, 0, -0.08]}>
      <mesh position={[0, 1.05, 0]}><cylinderGeometry args={[0.09, 0.16, 2.1, 7]} /><meshStandardMaterial color="#b66a39" roughness={0.9} /></mesh>
      <group position={[0, 2.1, 0]}>
        {Array.from({ length: 7 }).map((_, index) => <mesh key={index} rotation={[0, index * (Math.PI * 2 / 7), index % 2 ? 0.3 : -0.3]} position={[0, 0, 0]}><sphereGeometry args={[0.52, 7, 4]} /><meshStandardMaterial color={index % 2 ? "#0d804b" : "#075937"} flatShading /></mesh>)}
      </group>
    </group>
  );
}

function GoanHouse({ position }: { position: [number, number, number] }) {
  return <group position={position} rotation={[0, 0.18, 0]}>
    <mesh position={[0, .62, 0]} castShadow><boxGeometry args={[2.45, 1.5, 1.05]} /><meshStandardMaterial color="#fff8e6" roughness={.88} /></mesh>
    <mesh position={[0, 1.63, 0]} rotation={[0, Math.PI / 4, 0]} castShadow><coneGeometry args={[1.78, .82, 4]} /><meshStandardMaterial color="#a84f2b" roughness={.95} flatShading /></mesh>
    <mesh position={[-.65, .72, .535]}><planeGeometry args={[.4, .68]} /><meshStandardMaterial color="#1d4e89" /></mesh>
    <mesh position={[.65, .72, .535]}><planeGeometry args={[.4, .68]} /><meshStandardMaterial color="#1d4e89" /></mesh>
    <mesh position={[0, .46, .545]}><planeGeometry args={[.48, .92]} /><meshStandardMaterial color="#ffd900" /></mesh>
    <mesh position={[0, -.18, .42]}><boxGeometry args={[2.8, .18, 1.05]} /><meshStandardMaterial color="#b96a3c" /></mesh>
    {[-1.02, 1.02].map((x) => <mesh key={x} position={[x, .18, .78]}><cylinderGeometry args={[.055, .075, .92, 8]} /><meshStandardMaterial color="#1d4e89" /></mesh>)}
    <group position={[1.15, 1.12, .56]}>{Array.from({ length: 8 }).map((_, i) => <mesh key={i} position={[(i % 3) * .17 - .18, Math.floor(i / 3) * .17 - .12, (i % 2) * .04]}><sphereGeometry args={[.16, 7, 6]} /><meshStandardMaterial color={i % 2 ? "#ff4f87" : "#e63476"} flatShading /></mesh>)}</group>
    <mesh position={[-1.2, .57, .56]}><boxGeometry args={[.11, 1.4, .12]} /><meshStandardMaterial color="#ffd900" /></mesh>
  </group>;
}

function FishingBoat({ position }: { position: [number, number, number] }) {
  const boat = useRef<THREE.Group>(null);
  useFrame(({ clock }) => { if (boat.current) boat.current.rotation.z = Math.sin(clock.elapsedTime * 1.4) * .045; });
  return <group ref={boat} position={position} rotation={[0, -.35, 0]}>
    <mesh rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[.28, .5, 1.7, 4]} /><meshStandardMaterial color="#1d4e89" roughness={.76} flatShading /></mesh>
    <mesh position={[0, .1, .24]} rotation={[0, 0, Math.PI / 2]}><boxGeometry args={[.13, 1.15, .14]} /><meshStandardMaterial color="#ffd900" /></mesh>
    <mesh position={[0, .82, 0]}><cylinderGeometry args={[.025, .035, 1.65, 8]} /><meshStandardMaterial color="#6f3f2a" /></mesh>
    <mesh position={[.35, .82, 0]} rotation={[0, 0, -.12]}><coneGeometry args={[.48, 1.05, 3]} /><meshStandardMaterial color="#ff4f87" side={THREE.DoubleSide} /></mesh>
    <mesh position={[-.5, -.03, .42]}><sphereGeometry args={[.16, 8, 6]} /><meshStandardMaterial color="#fff8e6" /></mesh>
  </group>;
}

function Laptop({ position }: { position: [number, number, number] }) {
  return <group position={position} rotation={[0.1, -0.45, -0.06]}>
    <mesh><boxGeometry args={[0.7, 0.08, 0.48]} /><meshStandardMaterial color="#f6dfba" /></mesh>
    <mesh position={[0, 0.32, -0.2]} rotation={[-0.82, 0, 0]}><boxGeometry args={[0.7, 0.05, 0.5]} /><meshStandardMaterial color="#092f25" /></mesh>
    <mesh position={[0, 0.33, -0.17]} rotation={[-0.82, 0, 0]}><planeGeometry args={[0.53, 0.32]} /><meshBasicMaterial color="#ff4f87" /></mesh>
  </group>;
}

function Robot({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => { if (ref.current) ref.current.position.y = position[1] + Math.sin(clock.elapsedTime * 2.1) * 0.08; });
  return <group ref={ref} position={position} rotation={[0, -0.2, 0]}>
    <mesh><boxGeometry args={[0.48, 0.42, 0.4]} /><meshStandardMaterial color="#ffd900" /></mesh>
    <mesh position={[0, 0.4, 0]}><boxGeometry args={[0.58, 0.4, 0.45]} /><meshStandardMaterial color="#fff8e6" /></mesh>
    <mesh position={[-0.13, 0.43, 0.23]}><sphereGeometry args={[0.045, 12, 12]} /><meshBasicMaterial color="#092f25" /></mesh>
    <mesh position={[0.13, 0.43, 0.23]}><sphereGeometry args={[0.045, 12, 12]} /><meshBasicMaterial color="#092f25" /></mesh>
    <mesh position={[0, 0.72, 0]}><cylinderGeometry args={[0.025, 0.025, 0.25]} /><meshStandardMaterial color="#092f25" /></mesh>
    <mesh position={[0, 0.87, 0]}><sphereGeometry args={[0.07, 10, 10]} /><meshStandardMaterial color="#ff4f87" /></mesh>
  </group>;
}

function Signal({ props }: { props: Props }) {
  const group = useRef<THREE.Group>(null);
  const textures = useSignalTextures(props);
  const pointer = useRef({ x: 0, y: 0 });
  const reduced = useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, []);
  const mobile = useMemo(() => typeof window !== "undefined" && window.matchMedia("(max-width: 720px), (max-height: 520px)").matches, []);
  const baseY = mobile ? -0.12 : 0.8;
  useFrame(({ clock }) => {
    if (!group.current) return;
    const target = props.flipped ? Math.PI : 0;
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, target + pointer.current.x * 0.08, 6, 0.016);
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, pointer.current.y * -0.05, 6, 0.016);
    if (!reduced) group.current.position.y = baseY + Math.sin(clock.elapsedTime * 1.35) * 0.08;
  });
  const move = (event: ThreeEvent<PointerEvent>) => { pointer.current.x = event.uv ? event.uv.x - 0.5 : 0; pointer.current.y = event.uv ? event.uv.y - 0.5 : 0; };
  return <group ref={group} position={[mobile ? 0.9 : 0.15, baseY, 1]} scale={mobile ? 0.64 : 0.92} onClick={(event) => { event.stopPropagation(); props.onFlip(!props.flipped); }} onPointerMove={move} onPointerOut={() => { pointer.current = { x: 0, y: 0 }; }}>
    <mesh castShadow><boxGeometry args={[4.5, 2.8, 0.12]} /><meshStandardMaterial color="#092f25" roughness={0.45} metalness={0.05} /></mesh>
    <mesh position={[0, 0, 0.066]}><planeGeometry args={[4.38, 2.68]} /><meshBasicMaterial map={textures.front} toneMapped={false} /></mesh>
    <mesh position={[0, 0, -0.066]} rotation={[0, Math.PI, 0]}><planeGeometry args={[4.38, 2.68]} /><meshBasicMaterial map={textures.back} toneMapped={false} /></mesh>
    <mesh position={[-1.65, 1.46, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.12, 0.035, 8, 18]} /><meshStandardMaterial color="#f2e3b8" metalness={0.6} roughness={0.25} /></mesh>
  </group>;
}

function World({ props }: { props: Props }) {
  return <>
    <ambientLight intensity={1.55} />
    <directionalLight position={[-4, 7, 5]} intensity={2.5} color="#fff0c0" castShadow />
    <spotLight position={[5, 4, 4]} intensity={8} angle={0.8} penumbra={1} color="#ffaf84" />
    <fog attach="fog" args={["#79d7cd", 8, 19]} />
    <Signal props={props} />
    <GoanHouse position={[-3.25, -1.85, -3.2]} />
    <FishingBoat position={[3.35, -1.45, -3.25]} />
    <Palm position={[-4.05, -1.7, -1.2]} scale={0.9} />
    <Palm position={[4.15, -1.9, -2]} scale={0.68} />
    <Robot position={[3.2, -1.35, 0.2]} />
    <Laptop position={[-2.9, -1.2, 1]} />
    <mesh position={[0, -2.05, -0.5]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[16, 8, 16, 8]} /><meshStandardMaterial color="#f6bd54" transparent opacity={.16} depthWrite={false} roughness={1} flatShading /></mesh>
    <mesh position={[0, -1.98, -4.6]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[16, 5]} /><meshStandardMaterial color="#65cfc7" transparent opacity={0.14} depthWrite={false} metalness={0.05} roughness={0.25} /></mesh>
    {[-4.8, -3.7, 3.8, 4.9].map((x, i) => <mesh key={x} position={[x, -1.6 + i % 2 * 0.1, 1.4 - i * 0.3]} rotation={[0.4, i, 0.2]}><icosahedronGeometry args={[0.22 + i * 0.025, 0]} /><meshStandardMaterial color={i % 2 ? "#ff4f87" : "#ffd900"} flatShading /></mesh>)}
  </>;
}

export default function BeachScene(props: Props) {
  return (
    <div className="beach-canvas" aria-label="Interactive 3D builder ID. Tap to flip it.">
      <Canvas dpr={[1, 1.7]} camera={{ position: [0, 0.35, 8.6], fov: 38 }} shadows gl={{ antialias: true, alpha: true }}>
        <World props={props} />
      </Canvas>
    </div>
  );
}
