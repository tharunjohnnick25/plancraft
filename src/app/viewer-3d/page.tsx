"use client";

import * as React from "react";
import Link from "next/link";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sky, Environment, ContactShadows, Float } from "@react-three/drei";
import {
  ArrowLeft, Hexagon, Sun, Moon, RotateCcw,
  Camera, Play, Search, Maximize, Settings2
} from "lucide-react";

function House({ dayMode }: { dayMode: boolean }) {
  return (
    <group position={[0, 0, 0]}>
      <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 20]} />
        <meshStandardMaterial color={dayMode ? "#e8f4e8" : "#2d4a2d"} />
      </mesh>
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[16, 3, 12]} />
        <meshStandardMaterial color={dayMode ? "#f5f0e1" : "#4a4a3a"} />
      </mesh>
      <mesh position={[0, 3, 0]}>
        <boxGeometry args={[18, 0.3, 14]} />
        <meshStandardMaterial color={dayMode ? "#c4a882" : "#5a4e3a"} />
      </mesh>
      <mesh position={[0, 3.8, 0]}>
        <coneGeometry args={[10, 2.5, 4]} />
        <meshStandardMaterial color={dayMode ? "#a0522d" : "#4a3020"} />
      </mesh>
      <mesh position={[5, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4, 3]} />
        <meshStandardMaterial color={dayMode ? "#87ceeb" : "#2a4a6a"} transparent opacity={0.6} />
      </mesh>
      <mesh position={[-5, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4, 3]} />
        <meshStandardMaterial color={dayMode ? "#87ceeb" : "#2a4a6a"} transparent opacity={0.6} />
      </mesh>
      <mesh position={[0, 0.12, 5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[5, 2]} />
        <meshStandardMaterial color={dayMode ? "#8B4513" : "#3a2010"} />
      </mesh>
      <mesh position={[6, 1, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.15, 2, 0.8]} />
        <meshStandardMaterial color={dayMode ? "#5c3a1e" : "#2a1a0e"} />
      </mesh>
    </group>
  );
}

export default function Viewer3DPage() {
  const [dayMode, setDayMode] = React.useState(true);

  return (
    <div className={`h-screen w-full flex flex-col overflow-hidden transition-colors duration-1000 ${dayMode ? 'bg-sky-100' : 'bg-slate-950'}`}>
      <header className="absolute top-0 left-0 w-full p-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-4">
          <Link href="/workspace" className={`p-2 rounded-lg transition-colors ${dayMode ? 'bg-white/80 hover:bg-white text-slate-700' : 'bg-black/50 hover:bg-black/80 text-slate-300'}`}>
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className={`px-4 py-2 rounded-lg font-semibold text-sm backdrop-blur-md shadow-sm flex items-center gap-2 ${dayMode ? 'bg-white/80 text-slate-800' : 'bg-black/50 text-slate-200'}`}>
            <Hexagon className="w-4 h-4 text-primary" />
            Luxury Villa 3D Preview
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex items-center rounded-lg p-1 backdrop-blur-md ${dayMode ? 'bg-white/80' : 'bg-black/50'}`}>
            <Link href="/workspace" className={`px-3 py-1 text-xs font-medium transition-colors ${dayMode ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-slate-100'}`}>2D</Link>
            <button className={`px-3 py-1 text-xs font-semibold shadow rounded-md ${dayMode ? 'bg-white text-slate-800' : 'bg-slate-800 text-white'}`}>3D</button>
          </div>
          <button className={`px-4 py-2 text-sm font-semibold rounded-lg shadow-sm transition-colors ${dayMode ? 'bg-white/80 hover:bg-white text-slate-800' : 'bg-primary text-white hover:bg-primary/90'}`}>
            Share
          </button>
        </div>
      </header>

      <main className="flex-1 relative">
        <Canvas camera={{ position: [20, 15, 20], fov: 45 }}>
          {dayMode ? (
            <Sky sunPosition={[100, 20, 100]} />
          ) : (
            <ambientLight intensity={0.2} />
          )}
          <ambientLight intensity={dayMode ? 0.5 : 0.1} />
          <directionalLight
            position={dayMode ? [20, 30, 10] : [5, 5, -5]}
            intensity={dayMode ? 1.5 : 0.3}
            castShadow
          />
          <Float speed={1} rotationIntensity={0.1} floatIntensity={0.1}>
            <House dayMode={dayMode} />
          </Float>
          <ContactShadows position={[0, -0.01, 0]} opacity={0.4} scale={25} blur={2} />
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            minPolarAngle={0.1}
            maxPolarAngle={Math.PI / 2.2}
          />
        </Canvas>
      </main>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 rounded-2xl backdrop-blur-md shadow-xl z-20 border transition-colors duration-1000 bg-white/80 dark:bg-black/60 border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setDayMode(!dayMode)}
          className={`p-3 rounded-xl transition-colors ${dayMode ? 'hover:bg-slate-100 text-slate-700' : 'bg-slate-800 text-yellow-400 hover:bg-slate-700'}`}
          title="Toggle Day/Night"
        >
          {dayMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <div className="w-px h-8 bg-slate-300 dark:bg-slate-700 mx-1" />
        <button className={`p-3 rounded-xl transition-colors ${dayMode ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-slate-800 text-slate-300'}`}>
          <RotateCcw className="w-5 h-5" />
        </button>
        <button className={`p-3 rounded-xl transition-colors ${dayMode ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-slate-800 text-slate-300'}`}>
          <Search className="w-5 h-5" />
        </button>
        <button className={`p-3 rounded-xl transition-colors ${dayMode ? 'bg-primary/10 text-primary' : 'bg-primary/20 text-primary'}`}>
          <Play className="w-5 h-5" />
        </button>
        <div className="w-px h-8 bg-slate-300 dark:bg-slate-700 mx-1" />
        <button className={`p-3 rounded-xl transition-colors ${dayMode ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-slate-800 text-slate-300'}`}>
          <Camera className="w-5 h-5" />
        </button>
        <button className={`p-3 rounded-xl transition-colors ${dayMode ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-slate-800 text-slate-300'}`}>
          <Settings2 className="w-5 h-5" />
        </button>
        <button className={`p-3 rounded-xl transition-colors ${dayMode ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-slate-800 text-slate-300'}`}>
          <Maximize className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
