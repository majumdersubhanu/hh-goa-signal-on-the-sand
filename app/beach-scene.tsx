"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

type BeachSceneProps = {
  builderClass: string;
  energy: string;
  mission: string;
  name: string;
  offsetX: number;
  offsetY: number;
  photo: string;
  ritual: string;
  stack: string;
  zoom: number;
};

const COLORS = {
  green: "#0b6839",
  greenDark: "#043d24",
  yellow: "#fee101",
  pink: "#ff0080",
  paper: "#fffbe8",
  ink: "#082f20",
  sand: "#e6b86b",
  water: "#58c9c0",
  coral: "#ff6b43",
};

function coverCrop(
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
  const base = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const scale = base * zoom;
  const sourceWidth = width / scale;
  const sourceHeight = height / scale;
  const maxX = Math.max(0, image.naturalWidth - sourceWidth);
  const maxY = Math.max(0, image.naturalHeight - sourceHeight);
  const sourceX = Math.min(maxX, Math.max(0, maxX / 2 - (offsetX / 100) * maxX));
  const sourceY = Math.min(maxY, Math.max(0, maxY / 2 - (offsetY / 100) * maxY));
  context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height);
}

function drawTextureDoodles(context: CanvasRenderingContext2D) {
  context.lineJoin = "bevel";
  context.lineCap = "square";
  context.lineWidth = 8;
  context.strokeStyle = COLORS.ink;

  // Isometric build cube.
  context.fillStyle = COLORS.yellow;
  context.beginPath();
  context.moveTo(594, 148); context.lineTo(644, 122); context.lineTo(694, 148); context.lineTo(644, 176); context.closePath();
  context.fill(); context.stroke();
  context.fillStyle = COLORS.pink;
  context.beginPath();
  context.moveTo(594, 148); context.lineTo(644, 176); context.lineTo(644, 232); context.lineTo(594, 203); context.closePath();
  context.fill(); context.stroke();
  context.fillStyle = COLORS.water;
  context.beginPath();
  context.moveTo(644, 176); context.lineTo(694, 148); context.lineTo(694, 203); context.lineTo(644, 232); context.closePath();
  context.fill(); context.stroke();

  // Angular palm and lightning marks.
  context.strokeStyle = COLORS.yellow;
  context.lineWidth = 10;
  context.beginPath(); context.moveTo(84, 530); context.lineTo(67, 458); context.lineTo(83, 398); context.stroke();
  [[83, 398, 42, 367], [83, 398, 65, 346], [83, 398, 106, 352], [83, 398, 135, 373]].forEach(([x1,y1,x2,y2]) => {
    context.beginPath(); context.moveTo(x1,y1); context.lineTo(x2,y2); context.stroke();
  });
  context.fillStyle = COLORS.pink;
  context.beginPath(); context.moveTo(668, 482); context.lineTo(632, 532); context.lineTo(657, 532); context.lineTo(624, 584); context.lineTo(697, 516); context.lineTo(668, 516); context.closePath(); context.fill();

  // Tiny beach bot.
  context.fillStyle = COLORS.yellow; context.strokeStyle = COLORS.ink; context.lineWidth = 7;
  context.fillRect(112, 141, 82, 64); context.strokeRect(112, 141, 82, 64);
  context.fillStyle = COLORS.ink; context.fillRect(132, 159, 10, 10); context.fillRect(165, 159, 10, 10);
  context.beginPath(); context.moveTo(128, 205); context.lineTo(111, 234); context.moveTo(177, 205); context.lineTo(195, 234); context.moveTo(108, 182); context.lineTo(87, 195); context.moveTo(196, 182); context.lineTo(216, 166); context.stroke();

  // Code and motion scratches.
  context.strokeStyle = COLORS.paper; context.lineWidth = 5;
  context.beginPath(); context.moveTo(524, 570); context.lineTo(500, 547); context.lineTo(524, 525); context.moveTo(552, 525); context.lineTo(576, 547); context.lineTo(552, 570); context.stroke();
  context.fillStyle = COLORS.yellow;
  for (let index = 0; index < 4; index += 1) context.fillRect(232 + index * 28, 137 + (index % 2) * 10, 15, 15);
}

function useSignalTexture(props: BeachSceneProps) {
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);

  useEffect(() => {
    let cancelled = false;
    let nextTexture: THREE.CanvasTexture | null = null;

    async function draw() {
      await document.fonts.ready;
      if (cancelled) return;
      const canvas = document.createElement("canvas");
      canvas.width = 768;
      canvas.height = 960;
      const context = canvas.getContext("2d");
      if (!context) return;

      context.fillStyle = COLORS.green;
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = COLORS.yellow;
      context.fillRect(0, 0, canvas.width, 92);
      context.fillStyle = COLORS.ink;
      context.font = "700 24px monospace";
      context.fillText("HH GOA · 28—31 OCT 2026", 34, 56);

      const photoX = 42;
      const photoY = 118;
      const photoWidth = 684;
      const photoHeight = 500;
      context.fillStyle = COLORS.paper;
      context.fillRect(photoX, photoY, photoWidth, photoHeight);

      if (props.photo) {
        const image = new Image();
        image.src = props.photo;
        try {
          await image.decode();
          coverCrop(context, image, photoX, photoY, photoWidth, photoHeight, props.zoom, props.offsetX, props.offsetY);
        } catch {
          context.fillStyle = COLORS.paper;
          context.fillRect(photoX, photoY, photoWidth, photoHeight);
        }
      } else {
        context.strokeStyle = COLORS.ink;
        context.lineWidth = 5;
        for (let index = -300; index < 900; index += 36) {
          context.beginPath();
          context.moveTo(index, photoY);
          context.lineTo(index + 500, photoY + photoHeight);
          context.stroke();
        }
        context.fillStyle = COLORS.yellow;
        context.fillRect(160, 315, 448, 94);
        context.fillStyle = COLORS.ink;
        context.font = "900 36px monospace";
        context.textAlign = "center";
        context.fillText("DROP YOUR PHOTO", 384, 374);
        context.textAlign = "left";
      }

      drawTextureDoodles(context);

      context.fillStyle = COLORS.pink;
      context.fillRect(42, 598, 270, 42);
      context.fillStyle = COLORS.paper;
      context.font = "700 20px monospace";
      context.fillText((props.energy || "BAREFOOT SHIPPING").toUpperCase().slice(0, 22), 57, 627);

      context.fillStyle = COLORS.paper;
      context.font = "900 76px 'Bowlby One SC', sans-serif";
      context.fillText((props.name || "YOUR NAME").toUpperCase().slice(0, 14), 42, 735);
      context.fillStyle = COLORS.yellow;
      context.font = "400 42px Modak, sans-serif";
      context.fillText(props.builderClass.toUpperCase().slice(0, 25), 42, 786);
      context.fillStyle = COLORS.paper;
      context.font = "700 19px monospace";
      context.fillText((props.stack || "MAKING SOMETHING THAT MATTERS").toUpperCase().slice(0, 36), 44, 829);
      context.fillStyle = COLORS.yellow;
      context.fillRect(42, 858, 684, 3);
      context.fillStyle = COLORS.paper;
      context.font = "700 16px monospace";
      context.fillText((props.mission || props.ritual || "LESS NOISE. MORE SIGNAL.").toUpperCase().slice(0, 52), 42, 895);
      context.fillStyle = COLORS.yellow;
      context.fillText("#FRAMEINGOA", 566, 932);

      nextTexture = new THREE.CanvasTexture(canvas);
      nextTexture.colorSpace = THREE.SRGBColorSpace;
      nextTexture.anisotropy = 4;
      nextTexture.needsUpdate = true;
      if (!cancelled) setTexture(nextTexture);
    }

    draw();
    return () => {
      cancelled = true;
      nextTexture?.dispose();
    };
  }, [props.builderClass, props.energy, props.mission, props.name, props.offsetX, props.offsetY, props.photo, props.ritual, props.stack, props.zoom]);

  return texture;
}

function SignalObject(props: BeachSceneProps) {
  const group = useRef<THREE.Group>(null);
  const [flipped, setFlipped] = useState(false);
  const [hovered, setHovered] = useState(false);
  const texture = useSignalTexture(props);
  const { size } = useThree();
  const compact = size.width < 760;
  const narrow = size.width < 520;

  useEffect(() => {
    document.body.style.cursor = hovered ? "grab" : "default";
    return () => { document.body.style.cursor = "default"; };
  }, [hovered]);

  useFrame((state) => {
    if (!group.current) return;
    const time = state.clock.elapsedTime;
    const targetX = compact ? (narrow ? 0.72 : 1.25) : 2.35;
    const targetY = compact ? (narrow ? -0.62 : -0.05) : 0.72;
    group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, targetX, 0.055);
    group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, targetY + Math.sin(time * 1.35) * 0.09, 0.075);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, state.pointer.y * -0.13 + Math.sin(time) * 0.025, 0.07);
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, (flipped ? Math.PI : 0) + state.pointer.x * 0.22, 0.075);
    group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, state.pointer.x * -0.035, 0.06);
  });

  return (
    <group
      ref={group}
      scale={compact ? (narrow ? 0.48 : 0.5) : 0.78}
      onClick={(event) => { event.stopPropagation(); setFlipped((value) => !value); }}
      onPointerOver={(event) => { event.stopPropagation(); setHovered(true); }}
      onPointerOut={() => setHovered(false)}
    >
      <mesh castShadow receiveShadow>
        <boxGeometry args={[3.45, 4.3, 0.16, 2, 2, 1]} />
        <meshStandardMaterial color={COLORS.ink} roughness={0.72} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0, 0.086]}>
        <planeGeometry args={[3.3, 4.14]} />
        <meshBasicMaterial key={texture?.uuid ?? "signal-loading"} map={texture ?? undefined} color={texture ? "#ffffff" : COLORS.green} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, -0.086]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[3.3, 4.14]} />
        <meshStandardMaterial color={COLORS.pink} roughness={0.65} />
      </mesh>
      <mesh position={[0, 0.34, -0.092]} rotation={[0, Math.PI, 0]}>
        <boxGeometry args={[2.5, 0.6, 0.03]} />
        <meshStandardMaterial color={COLORS.yellow} />
      </mesh>
      <mesh position={[0, -0.55, -0.092]} rotation={[0, Math.PI, 0]}>
        <boxGeometry args={[2.1, 0.08, 0.03]} />
        <meshStandardMaterial color={COLORS.paper} />
      </mesh>
    </group>
  );
}

function Palm({ position, flip = false }: { position: [number, number, number]; flip?: boolean }) {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (group.current) group.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.75) * 0.035 * (flip ? -1 : 1);
  });
  return (
    <group ref={group} position={position} scale={flip ? [-1, 1, 1] : [1, 1, 1]} rotation={[0.05, 0, -0.14]}>
      <mesh castShadow position={[0, -0.5, 0]} rotation={[0, 0, -0.08]}>
        <cylinderGeometry args={[0.12, 0.21, 3.7, 7]} />
        <meshStandardMaterial color="#bb733e" roughness={1} />
      </mesh>
      {[[-1.0, 0.1, 0.65], [-0.58, 0.54, 0.85], [0, 0.72, 1], [0.62, 0.48, 0.84], [1.05, 0.05, 0.62]].map((leaf, index) => (
        <mesh key={index} castShadow position={[leaf[0], 1.45 + leaf[1], leaf[2] * 0.1]} rotation={[0, 0, (index - 2) * 0.42]}>
          <boxGeometry args={[1.55, 0.22, 0.1]} />
          <meshStandardMaterial color={index % 2 ? COLORS.greenDark : COLORS.green} roughness={0.86} />
        </mesh>
      ))}
    </group>
  );
}

function House() {
  return (
    <group position={[-3.55, -0.2, -2.5]} scale={0.78} rotation={[0, 0.22, 0]}>
      <mesh castShadow position={[0, 0.15, 0]}>
        <boxGeometry args={[2.25, 1.8, 1.45]} />
        <meshStandardMaterial color={COLORS.paper} roughness={0.94} />
      </mesh>
      <mesh castShadow position={[0, 1.25, 0]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[1.75, 1.75, 1.7]} />
        <meshStandardMaterial color={COLORS.coral} roughness={0.9} />
      </mesh>
      {[-0.62, 0, 0.62].map((x) => (
        <mesh key={x} position={[x, 0.3, 0.74]}>
          <boxGeometry args={[0.35, 0.7, 0.05]} />
          <meshStandardMaterial color={x === 0 ? COLORS.pink : COLORS.yellow} />
        </mesh>
      ))}
    </group>
  );
}

function MovingWater() {
  const waveRefs = useRef<Array<THREE.Mesh | null>>([]);
  useFrame((state) => {
    waveRefs.current.forEach((wave, index) => {
      if (!wave) return;
      wave.position.x = ((state.clock.elapsedTime * (0.17 + index * 0.025) + index * 2.1) % 14) - 7;
      wave.rotation.z = Math.sin(state.clock.elapsedTime * 0.65 + index) * 0.04;
    });
  });
  return (
    <group position={[0, -1.55, -2.8]} rotation={[-Math.PI / 2.75, 0, 0]}>
      <mesh receiveShadow>
        <planeGeometry args={[22, 10, 1, 1]} />
        <meshStandardMaterial color={COLORS.water} roughness={0.55} metalness={0.05} />
      </mesh>
      {Array.from({ length: 8 }).map((_, index) => (
        <mesh key={index} ref={(mesh) => { waveRefs.current[index] = mesh; }} position={[index * 1.8 - 7, -1.1 + index * 0.45, 0.035]} castShadow>
          <boxGeometry args={[2.2 + (index % 3) * 0.5, 0.065, 0.045]} />
          <meshStandardMaterial color={index % 2 ? COLORS.paper : COLORS.greenDark} roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function SandMotes() {
  const points = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const values = new Float32Array(120 * 3);
    for (let index = 0; index < 120; index += 1) {
      values[index * 3] = ((index * 37) % 101) / 8 - 6;
      values[index * 3 + 1] = ((index * 53) % 89) / 34 - 1.6;
      values[index * 3 + 2] = ((index * 29) % 73) / 12 - 4;
    }
    return values;
  }, []);
  useFrame((state) => {
    if (!points.current) return;
    points.current.rotation.y = state.clock.elapsedTime * 0.018;
    points.current.position.x = Math.sin(state.clock.elapsedTime * 0.22) * 0.2;
  });
  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={COLORS.yellow} size={0.035} transparent opacity={0.72} sizeAttenuation />
    </points>
  );
}

function BeachBot() {
  const bot = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!bot.current) return;
    const time = state.clock.elapsedTime;
    bot.current.position.y = -1.15 + Math.abs(Math.sin(time * 1.7)) * 0.18;
    bot.current.rotation.y = Math.sin(time * 0.8) * 0.3;
  });
  return (
    <group ref={bot} position={[4.55, -1.15, 1.35]} rotation={[0, -0.45, 0]} scale={0.72}>
      <mesh castShadow><boxGeometry args={[1, .76, .72]} /><meshStandardMaterial color={COLORS.yellow} roughness={.7} /></mesh>
      <mesh position={[-.22, .08, .37]}><boxGeometry args={[.12, .12, .04]} /><meshStandardMaterial color={COLORS.ink} /></mesh>
      <mesh position={[.22, .08, .37]}><boxGeometry args={[.12, .12, .04]} /><meshStandardMaterial color={COLORS.ink} /></mesh>
      <mesh position={[-.32, -.65, 0]} rotation={[0,0,.22]} castShadow><boxGeometry args={[.14,.62,.14]} /><meshStandardMaterial color={COLORS.pink} /></mesh>
      <mesh position={[.32, -.65, 0]} rotation={[0,0,-.22]} castShadow><boxGeometry args={[.14,.62,.14]} /><meshStandardMaterial color={COLORS.pink} /></mesh>
      <mesh position={[-.65, -.05, 0]} rotation={[0,0,-.75]}><boxGeometry args={[.5,.11,.11]} /><meshStandardMaterial color={COLORS.water} /></mesh>
      <mesh position={[.65, -.05, 0]} rotation={[0,0,.75]}><boxGeometry args={[.5,.11,.11]} /><meshStandardMaterial color={COLORS.water} /></mesh>
      <mesh position={[0, .55, 0]} rotation={[0,0,.18]}><boxGeometry args={[.09,.42,.09]} /><meshStandardMaterial color={COLORS.pink} /></mesh>
      <mesh position={[.04, .8, 0]} rotation={[.2,.2,.3]}><tetrahedronGeometry args={[.18]} /><meshStandardMaterial color={COLORS.pink} /></mesh>
    </group>
  );
}

function LaptopProp() {
  const laptop = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!laptop.current) return;
    laptop.current.rotation.z = -0.1 + Math.sin(state.clock.elapsedTime * .9) * .02;
  });
  return (
    <group ref={laptop} position={[-2.2, -1.3, 1.55]} rotation={[0, .45, -.1]} scale={.82}>
      <mesh castShadow><boxGeometry args={[1.75,.12,1.05]} /><meshStandardMaterial color={COLORS.paper} roughness={.75} /></mesh>
      <mesh castShadow position={[0,.72,-.45]} rotation={[-.16,0,0]}><boxGeometry args={[1.75,1.35,.1]} /><meshStandardMaterial color={COLORS.ink} /></mesh>
      <mesh position={[0,.72,-.39]} rotation={[-.16,0,0]}><planeGeometry args={[1.5,1.08]} /><meshStandardMaterial color={COLORS.pink} emissive={COLORS.pink} emissiveIntensity={.35} /></mesh>
      {[[-.52,.82],[-.2,.52],[.2,.78],[.5,.5]].map(([x,y], index) => <mesh key={index} position={[x,y,-.33]} rotation={[-.16,0,0]}><boxGeometry args={[.16,.07,.03]} /><meshBasicMaterial color={index % 2 ? COLORS.yellow : COLORS.water} /></mesh>)}
    </group>
  );
}

function FloatingArtifacts() {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!group.current) return;
    group.current.rotation.y = state.clock.elapsedTime * .16;
    group.current.position.y = Math.sin(state.clock.elapsedTime * 1.1) * .12;
  });
  return (
    <group ref={group} position={[.15, 1.6, -1.1]}>
      <mesh castShadow position={[-1.25,.1,.1]} rotation={[.5,.2,.8]}><tetrahedronGeometry args={[.32]} /><meshStandardMaterial color={COLORS.pink} /></mesh>
      <mesh castShadow position={[1.42,.48,-.3]} rotation={[.2,.8,.4]}><boxGeometry args={[.45,.45,.45]} /><meshStandardMaterial color={COLORS.yellow} /></mesh>
      <mesh castShadow position={[.5,-.2,-.7]} rotation={[.6,.4,.2]}><octahedronGeometry args={[.23]} /><meshStandardMaterial color={COLORS.water} /></mesh>
    </group>
  );
}

function CameraMotion() {
  const { camera } = useThree();
  useFrame((state) => {
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, state.pointer.x * 0.22, 0.035);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 0.45 + state.pointer.y * 0.12, 0.035);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

function World(props: BeachSceneProps) {
  const { size } = useThree();
  const compact = size.width < 760;
  return (
    <>
      <color attach="background" args={[COLORS.green]} />
      <fog attach="fog" args={[COLORS.green, 10, 22]} />
      <ambientLight intensity={1.65} color="#fff5d7" />
      <directionalLight castShadow position={[4, 7, 5]} intensity={3.1} color={COLORS.yellow} shadow-mapSize={[1024, 1024]} />
      <pointLight position={[-4, 1, 2]} intensity={12} distance={8} color={COLORS.pink} />
      <CameraMotion />
      <mesh position={[4.25, 2.5, -3.8]} rotation={[0.18, 0.42, 0.55]}>
        <boxGeometry args={[1.45, 1.45, 0.12]} />
        <meshStandardMaterial color={COLORS.yellow} emissive={COLORS.yellow} emissiveIntensity={0.8} />
      </mesh>
      {!compact && <House />}
      <Palm position={compact ? [-3.1, -0.2, -2.3] : [-5.1, -0.15, -2.2]} />
      {!compact && <Palm position={[5.1, -0.2, -2.4]} flip />}
      <MovingWater />
      <mesh receiveShadow position={[0, -2.45, 1.1]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[22, 9, 12, 12]} />
        <meshStandardMaterial color={COLORS.sand} roughness={1} />
      </mesh>
      <mesh receiveShadow castShadow position={[0, -1.72, 1.9]} rotation={[-0.03, 0, 0]}>
        <boxGeometry args={[12, 0.45, 3.6]} />
        <meshStandardMaterial color="#a85f37" roughness={0.9} />
      </mesh>
      <SignalObject {...props} />
      <BeachBot />
      {!compact && <LaptopProp />}
      <FloatingArtifacts />
      <SandMotes />
    </>
  );
}

export function BeachScene(props: BeachSceneProps) {
  return (
    <div className="webgl-stage" aria-label="Interactive 3D HH Goa beach scene">
      <Canvas
        camera={{ position: [0, 0.45, 10], fov: 38, near: 0.1, far: 40 }}
        dpr={[1, 1.6]}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        shadows="soft"
        fallback={<div className="webgl-fallback">Your signal is still ready—this device is showing the lightweight version.</div>}
      >
        <World {...props} />
      </Canvas>
    </div>
  );
}
