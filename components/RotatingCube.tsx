"use client";

import React, { useRef, useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  useTexture,
  Environment,
  PerspectiveCamera,
} from "@react-three/drei";
import { EffectComposer, SSAO, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

// Types for our components
type CubeProps = {
  position?: [number, number, number];
  size?: number;
};

type LightProps = {
  speed?: number;
};

type Vector3 = {
  x: number;
  y: number;
  z: number;
};

// Custom hook for animated light position
const useCrawlingLight = (speed: number = 0.5): Vector3 => {
  const [position, setPosition] = useState<Vector3>({ x: 0, y: 0, z: 5 });
  const pathRadius = 5;
  const timeRef = useRef<number>(0);

  useFrame((_, delta) => {
    timeRef.current += delta * speed;

    // Create a crawling pattern by moving the light in a complex path
    const x =
      Math.sin(timeRef.current) * Math.cos(timeRef.current * 0.5) * pathRadius;
    const y = Math.sin(timeRef.current * 0.7) * pathRadius;
    const z =
      Math.cos(timeRef.current) * Math.sin(timeRef.current * 0.3) * pathRadius;

    setPosition({ x, y, z });
  });

  return position;
};

// Moving light that crawls around the cube
const CrawlingLight: React.FC<LightProps> = ({ speed = 0.5 }) => {
  const lightPosition = useCrawlingLight(speed);
  const lightRef = useRef<THREE.PointLight>(null);

  // Create a subtle color shift over time
  useFrame(({ clock }) => {
    if (lightRef.current) {
      const time = clock.getElapsedTime();
      const r = Math.sin(time * 0.3) * 0.1 + 0.9;
      const g = Math.sin(time * 0.2 + 1) * 0.1 + 0.9;
      const b = Math.sin(time * 0.1 + 2) * 0.1 + 0.9;
      lightRef.current.color.setRGB(r, g, b);
    }
  });

  return (
    <>
      <pointLight
        ref={lightRef}
        position={[lightPosition.x, lightPosition.y, lightPosition.z]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      {/* Helper sphere to visualize the light position (comment out in production) */}
      {/* <mesh position={[lightPosition.x, lightPosition.y, lightPosition.z]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color="white" />
      </mesh> */}
    </>
  );
};

// The main cube component
const Cube: React.FC<CubeProps> = ({ position = [0, 0, 0], size = 2 }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  // Load textures
  const textures = useTexture({
    map: "/cube/albedo.png",
    normalMap: "/cube/normal.png",
    aoMap: "/cube/ao.png",
  });

  // Create material with subtle glow
  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: textures.map,
      normalMap: textures.normalMap,
      aoMap: textures.aoMap,
      roughness: 0.5,
      metalness: 0.8,
      color: new THREE.Color("#222230"),
      emissive: new THREE.Color("#110022"),
      emissiveIntensity: 0.2,
    });
  }, [textures]);

  // Subtle rotation
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.1;
      meshRef.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <mesh ref={meshRef} position={position} castShadow receiveShadow>
      <boxGeometry args={[size, size, size]} />
      {material && <primitive object={material} attach="material" />}
    </mesh>
  );
};

// Scene setup with effects
const Scene: React.FC = () => {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 6]} />
      <color attach="background" args={["#050510"]} />

      <ambientLight intensity={0.2} />
      <CrawlingLight speed={1} />

      <Cube />

      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={4}
        maxDistance={10}
      />

      <Environment preset="night" />
    </>
  );
};

// Post-processing effects
const Effects: React.FC = () => {
  return (
    <EffectComposer enableNormalPass>
      <SSAO
        radius={0.3}
        intensity={20}
        luminanceInfluence={0.5}
        color={new THREE.Color(0x000000)}
      />
      <Bloom
        intensity={0.3}
        luminanceThreshold={0.7}
        luminanceSmoothing={0.9}
      />
    </EffectComposer>
  );
};

// Main component
export const RotatingCube: React.FC = () => {
  return (
    <div className="w-full absolute inset-0 h-[calc(100vh - 64px)] bg-gray-900 -z-10">
      <Canvas shadows dpr={[1, 2]}>
        <Scene />
        <Effects />
      </Canvas>
    </div>
  );
};

export default RotatingCube;
