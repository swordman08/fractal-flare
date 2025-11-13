import { useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Stats } from "@/utils/stats";
import galaxyTexture from "@/assets/galaxy.png";

interface HopalongCanvasProps {
  colorPalette: string[];
  speed: number;
}

const SCALE_FACTOR = 1000;
const CAMERA_BOUND = 100;
const NUM_POINTS_SUBSET = 40000;
const NUM_SUBSETS = 8;
const NUM_LEVELS = 8;
const LEVEL_DEPTH = 150;
const DEF_BRIGHTNESS = 0.5; // Match reference implementation
const DEF_SATURATION = 0.95;
const SPRITE_SIZE = 5; // Smaller sprites for better fade effect
// Orbit parameters constraints (from original)
const A_MIN = -30;
const A_MAX = 30;
const B_MIN = 0.2;
const B_MAX = 1.8;
const C_MIN = 5;
const C_MAX = 17;
const D_MIN = 0;
const D_MAX = 10;
const E_MIN = 0;
const E_MAX = 12;

interface OrbitData {
  positions: Float32Array;
  colors: Float32Array;
}

const generateHopalongOrbit = (hueValue: number, subset: number): OrbitData => {
  // Use exact parameter ranges from original
  const a = A_MIN + Math.random() * (A_MAX - A_MIN);
  const b = B_MIN + Math.random() * (B_MAX - B_MIN);
  const c = C_MIN + Math.random() * (C_MAX - C_MIN);
  const d = D_MIN + Math.random() * (D_MAX - D_MIN);
  const e = E_MIN + Math.random() * (E_MAX - E_MIN);

  const choice = Math.random();
  const positions = new Float32Array(NUM_POINTS_SUBSET * 3);
  const colors = new Float32Array(NUM_POINTS_SUBSET * 3);

  // Use different starting point for each subset (from original)
  let x = subset * 0.005 * (0.5 - Math.random());
  let y = subset * 0.005 * (0.5 - Math.random());
  let xMin = 0,
    xMax = 0,
    yMin = 0,
    yMax = 0;

  const points: Array<{ x: number; y: number }> = [];

  // Generate orbit points using exact Hopalong formula from original
  for (let i = 0; i < NUM_POINTS_SUBSET; i++) {
    let z;

    // Three formula variations from original (exact implementation)
    if (choice < 0.5) {
      z = d + Math.sqrt(Math.abs(b * x - c));
    } else if (choice < 0.75) {
      z = d + Math.sqrt(Math.sqrt(Math.abs(b * x - c)));
    } else {
      z = d + Math.log(2 + Math.sqrt(Math.abs(b * x - c)));
    }

    let x1;
    if (x > 0) {
      x1 = y - z;
    } else if (x === 0) {
      x1 = y;
    } else {
      x1 = y + z;
    }

    y = a - x;
    x = x1 + e;

    points.push({ x, y });

    if (x < xMin) xMin = x;
    else if (x > xMax) xMax = x;
    if (y < yMin) yMin = y;
    else if (y > yMax) yMax = y;
  }

  // Normalize to SCALE_FACTOR (exact from original)
  const scaleX = (2 * SCALE_FACTOR) / (xMax - xMin);
  const scaleY = (2 * SCALE_FACTOR) / (yMax - yMin);

  // Apply normalization and colors using HSV
  for (let i = 0; i < NUM_POINTS_SUBSET; i++) {
    positions[i * 3] = scaleX * (points[i].x - xMin) - SCALE_FACTOR;
    positions[i * 3 + 1] = scaleY * (points[i].y - yMin) - SCALE_FACTOR;
    positions[i * 3 + 2] = 0;

    // Use HSV color system from original
    const color = new THREE.Color();
    color.setHSL(hueValue, DEF_SATURATION, DEF_BRIGHTNESS);

    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  return { positions, colors };
};

const HopalongLayer = ({
  level,
  subset,
  speedRef,
  rotationSpeedRef,
  hueValue,
  texture,
  orbitData,
  needsUpdate,
}: {
  level: number;
  subset: number;
  speedRef: React.MutableRefObject<number>;
  rotationSpeedRef: React.MutableRefObject<number>;
  hueValue: number;
  texture: THREE.Texture;
  orbitData: OrbitData | undefined;
  needsUpdate: number;
}) => {
  const pointsRef = useRef<THREE.Points>(null);
  const lastUpdateRef = useRef(0);
  const [color] = useState(() => {
    const c = new THREE.Color();
    c.setHSL(hueValue, DEF_SATURATION, DEF_BRIGHTNESS);
    return c;
  });

  // Don't render if orbitData is undefined
  if (!orbitData) return null;

  useFrame((state) => {
    if (!pointsRef.current) return;

    // Move forward at current speed
    pointsRef.current.position.z += speedRef.current;

    // Apply rotation
    pointsRef.current.rotation.z += rotationSpeedRef.current;

    // Loop when passing camera (exact from original)
    if (pointsRef.current.position.z > state.camera.position.z) {
      pointsRef.current.position.z = -(NUM_LEVELS - 1) * LEVEL_DEPTH;

      if (needsUpdate > lastUpdateRef.current) {
        pointsRef.current.geometry.setAttribute("position", new THREE.BufferAttribute(orbitData.positions, 3));
        pointsRef.current.geometry.setAttribute("color", new THREE.BufferAttribute(orbitData.colors, 3));
        pointsRef.current.geometry.attributes.position.needsUpdate = true;
        pointsRef.current.geometry.attributes.color.needsUpdate = true;
        lastUpdateRef.current = needsUpdate;
      }
    }
  });

  const initialZ = -LEVEL_DEPTH * level - (subset * LEVEL_DEPTH) / NUM_SUBSETS + SCALE_FACTOR / 2;

  return (
    <points ref={pointsRef} position={[0, 0, initialZ]}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={NUM_POINTS_SUBSET}
          array={orbitData.positions}
          itemSize={3}
        />
        <bufferAttribute attach="attributes-color" count={NUM_POINTS_SUBSET} array={orbitData.colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={SPRITE_SIZE}
        map={texture}
        vertexColors
        transparent
        opacity={1.0}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthTest={false}
        fog={true}
        color={color}
      />
    </points>
  );
};

const CameraController = () => {
  const { camera } = useThree();
  const mouseX = useRef(0);
  const mouseY = useRef(0);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      mouseX.current = event.clientX - window.innerWidth / 2;
      mouseY.current = event.clientY - window.innerHeight / 2;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length === 1) {
        event.preventDefault();
        mouseX.current = event.touches[0].pageX - window.innerWidth / 2;
        mouseY.current = event.touches[0].pageY - window.innerHeight / 2;
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("touchmove", handleTouchMove);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  useFrame(() => {
    // Smooth camera movement based on mouse position (exact from original)
    if (camera.position.x >= -CAMERA_BOUND && camera.position.x <= CAMERA_BOUND) {
      camera.position.x += (mouseX.current - camera.position.x) * 0.05;
      if (camera.position.x < -CAMERA_BOUND) camera.position.x = -CAMERA_BOUND;
      if (camera.position.x > CAMERA_BOUND) camera.position.x = CAMERA_BOUND;
    }

    if (camera.position.y >= -CAMERA_BOUND && camera.position.y <= CAMERA_BOUND) {
      camera.position.y += (-mouseY.current - camera.position.y) * 0.05;
      if (camera.position.y < -CAMERA_BOUND) camera.position.y = -CAMERA_BOUND;
      if (camera.position.y > CAMERA_BOUND) camera.position.y = CAMERA_BOUND;
    }
  });

  return null;
};

const StatsMonitor = () => {
  const statsRef = useRef<Stats | null>(null);

  useEffect(() => {
    const stats = new Stats();
    statsRef.current = stats;
    stats.domElement.style.position = "absolute";
    stats.domElement.style.top = "5px";
    stats.domElement.style.left = "5px";
    document.body.appendChild(stats.domElement);

    return () => {
      if (statsRef.current) {
        document.body.removeChild(statsRef.current.domElement);
      }
    };
  }, []);

  useFrame(() => {
    if (statsRef.current) {
      statsRef.current.update();
    }
  });

  return null;
};

export const HopalongCanvas = ({ colorPalette, speed }: HopalongCanvasProps) => {
  const speedRef = useRef(8); // Default speed from original
  const rotationSpeedRef = useRef(0.005); // Default rotation from original
  const [hueValues] = useState(() => Array.from({ length: NUM_SUBSETS }, () => Math.random()));
  const [orbitDataArray, setOrbitDataArray] = useState(() =>
    Array.from({ length: NUM_SUBSETS }, (_, i) => generateHopalongOrbit(hueValues[i], i)),
  );
  const [updateCounter, setUpdateCounter] = useState(0);

  // Load galaxy texture using THREE.TextureLoader
  const [texture] = useState(() => {
    const loader = new THREE.TextureLoader();
    return loader.load(galaxyTexture);
  });

  // Regenerate all patterns together every 3 seconds (matching reference)
  useEffect(() => {
    const interval = setInterval(() => {
      const newOrbitData = Array.from({ length: NUM_SUBSETS }, (_, i) => generateHopalongOrbit(Math.random(), i));
      setOrbitDataArray(newOrbitData);
      setUpdateCounter((prev) => prev + 1);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Keyboard controls (exact from original)
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.keyCode === 38 && speedRef.current < 20) {
        speedRef.current += 0.5; // Up arrow - increase speed
      } else if (event.keyCode === 40 && speedRef.current > 0) {
        speedRef.current -= 0.5; // Down arrow - decrease speed
      } else if (event.keyCode === 37) {
        rotationSpeedRef.current += 0.001; // Left arrow - increase rotation
      } else if (event.keyCode === 39) {
        rotationSpeedRef.current -= 0.001; // Right arrow - decrease rotation
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Update speed from props
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, SCALE_FACTOR / 3], fov: 75 }}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: "high-performance",
        }}
        frameloop="always"
      >
        <color attach="background" args={["#000000"]} />
        <fogExp2 attach="fog" args={["#000000", 0.0022]} />

        <CameraController />
        <StatsMonitor />

        {/* Create multiple levels and subsets (exact structure from original) */}
        {Array.from({ length: NUM_LEVELS }).map((_, level) =>
          Array.from({ length: NUM_SUBSETS }).map((_, subset) => (
            <HopalongLayer
              key={`${level}-${subset}`}
              level={level}
              subset={subset}
              speedRef={speedRef}
              rotationSpeedRef={rotationSpeedRef}
              hueValue={hueValues[subset]}
              texture={texture}
              orbitData={orbitDataArray[subset]}
              needsUpdate={updateCounter}
            />
          )),
        )}
      </Canvas>
    </div>
  );
};
