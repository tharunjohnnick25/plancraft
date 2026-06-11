"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft, Hexagon, Sun, Moon, RotateCcw, RotateCw,
  Camera, Play, Search, Maximize, Minimize, Settings2,
  Eye, EyeOff, Share2, Move3d, User, MapPin,
  SkipForward, SkipBack, ChevronLeft, ChevronRight
} from "lucide-react";
import { useUIStore } from "@/lib/stores/ui-store";

type ViewMode = "orbit" | "walkthrough" | "first-person" | "third-person";

export default function Workspace3DPage() {
  const { addToast } = useUIStore();
  const [dayMode, setDayMode] = React.useState(true);
  const [viewMode, setViewMode] = React.useState<ViewMode>("orbit");
  const [rotation, setRotation] = React.useState(0);
  const [zoom, setZoom] = React.useState(1);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [showWalkthrough, setShowWalkthrough] = React.useState(false);

  const handleRotate = (dir: "left" | "right") => {
    setRotation(r => dir === "left" ? r - 15 : r + 15);
  };

  const handleShare = () => {
    addToast("Share link copied to clipboard!", "success");
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const viewModes: { id: ViewMode; label: string; icon: typeof Eye }[] = [
    { id: "orbit", label: "Orbit", icon: RotateCcw },
    { id: "walkthrough", label: "Walkthrough", icon: MapPin },
    { id: "first-person", label: "First-Person", icon: User },
    { id: "third-person", label: "Third-Person", icon: Move3d },
  ];

  return (
    <div className={`h-screen w-full flex flex-col overflow-hidden transition-colors duration-700 ${dayMode ? 'bg-sky-100' : 'bg-slate-950'}`}>
      {/* Top Bar */}
      <header className="absolute top-0 left-0 w-full p-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-4">
          <Link href="/workspace" className={`p-2 rounded-lg transition-colors backdrop-blur-md ${
            dayMode ? 'bg-white/80 hover:bg-white text-slate-700' : 'bg-black/50 hover:bg-black/80 text-slate-300'
          }`}>
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className={`px-4 py-2 rounded-lg font-semibold text-sm backdrop-blur-md shadow-sm flex items-center gap-2 ${
            dayMode ? 'bg-white/80 text-slate-800' : 'bg-black/50 text-slate-200'
          }`}>
            <Hexagon className="w-4 h-4 text-primary" />
            {currentViewLabel(viewMode)} Preview
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex items-center rounded-lg p-1 backdrop-blur-md ${
            dayMode ? 'bg-white/80' : 'bg-black/50'
          }`}>
            <Link href="/workspace/2d" className={`px-3 py-1 text-xs font-medium transition-colors ${
              dayMode ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-slate-100'
            }`}>2D</Link>
            <button className={`px-3 py-1 text-xs font-semibold shadow rounded-md ${
              dayMode ? 'bg-white text-slate-800' : 'bg-slate-800 text-white'
            }`}>3D</button>
            <Link href="/workspace/ar" className={`px-3 py-1 text-xs font-medium transition-colors ${
              dayMode ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-slate-100'
            }`}>AR</Link>
            <Link href="/workspace/vr" className={`px-3 py-1 text-xs font-medium transition-colors ${
              dayMode ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-slate-100'
            }`}>VR</Link>
          </div>
          <button
            onClick={handleShare}
            className={`px-4 py-2 text-sm font-semibold rounded-lg shadow-sm transition-colors ${
              dayMode ? 'bg-white/80 hover:bg-white text-slate-800' : 'bg-primary text-white hover:bg-primary/90'
            }`}
          >
            <Share2 className="w-4 h-4 inline mr-1.5" /> Share
          </button>
        </div>
      </header>

      {/* 3D Viewport */}
      <main className="flex-1 relative flex items-center justify-center overflow-hidden">
        {/* Sky environment */}
        <div className={`absolute inset-0 transition-opacity duration-700 ${
          dayMode ? 'opacity-100 bg-gradient-to-b from-sky-300 via-sky-100 to-emerald-100' : 'opacity-100 bg-gradient-to-b from-indigo-950 via-slate-900 to-zinc-900'
        }`} />
        <div className={`absolute inset-0 transition-opacity duration-700 ${
          dayMode ? 'opacity-0' : 'opacity-100'
        }`} style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.1) 0%, transparent 60%)'
        }} />

        {/* Sun/Moon */}
        <div className={`absolute transition-all duration-1000 rounded-full blur-3xl ${
          dayMode
            ? 'top-16 right-1/4 w-40 h-40 bg-yellow-200/60'
            : 'top-16 left-1/4 w-32 h-32 bg-blue-300/20'
        }`} />

        {/* Ground plane */}
        <div className={`absolute bottom-0 left-0 right-0 h-1/3 transition-colors duration-700 ${
          dayMode ? 'bg-emerald-800/30' : 'bg-zinc-800/50'
        }`} />

        {/* 3D Building (simulated with CSS transforms) */}
        <div
          className="relative z-10 transition-transform duration-500"
          style={{ transform: `perspective(800px) rotateX(25deg) rotateY(${rotation}deg) scale(${zoom})` }}
        >
          {/* Roof */}
          <div className={`w-80 h-28 mx-auto -mb-2 transition-colors duration-500 ${dayMode ? 'bg-amber-700' : 'bg-zinc-700'}`}
            style={{ transform: 'rotateX(-30deg) translateZ(40px)', transformOrigin: 'bottom' }}
          />
          {/* Front Face */}
          <div className={`w-80 h-52 border-2 flex flex-col items-center justify-center relative transition-colors duration-500 ${
            dayMode ? 'border-slate-300 bg-white/90 text-slate-800' : 'border-slate-700 bg-zinc-800/90 text-slate-200'
          }`}>
            <span className="text-3xl font-bold mb-1">Luxury Villa</span>
            <span className={`text-sm ${dayMode ? 'text-slate-400' : 'text-slate-500'}`}>5 BR | 2 Floors</span>
            {/* Windows */}
            <div className="absolute top-4 left-4 w-8 h-12 rounded border" style={{ backgroundColor: dayMode ? '#93c5fd' : '#1e3a5f' }} />
            <div className="absolute top-4 right-4 w-8 h-12 rounded border" style={{ backgroundColor: dayMode ? '#93c5fd' : '#1e3a5f' }} />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-12 h-16 rounded border" style={{ backgroundColor: dayMode ? '#93c5fd' : '#1e3a5f' }} />
            {/* Door */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-20" style={{ backgroundColor: dayMode ? '#78350f' : '#451a03' }} />
          </div>
        </div>

        {/* Walkthrough Overlay */}
        {showWalkthrough && (
          <div className="absolute inset-0 z-30 bg-black/80 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Walkthrough Mode</h2>
              <p className="text-zinc-400 mb-6">Use arrow keys or WASD to navigate through the building</p>
              <div className="flex items-center justify-center gap-4 mb-6">
                <button className="p-4 bg-zinc-800 rounded-xl text-white hover:bg-zinc-700"><ChevronLeft className="w-6 h-6" /></button>
                <div className="space-y-2">
                  <button className="p-4 bg-zinc-800 rounded-xl text-white hover:bg-zinc-700 block"><ChevronLeft className="w-6 h-6 rotate-90" /></button>
                  <button className="p-4 bg-zinc-800 rounded-xl text-white hover:bg-zinc-700 block"><ChevronLeft className="w-6 h-6 -rotate-90" /></button>
                </div>
                <button className="p-4 bg-zinc-800 rounded-xl text-white hover:bg-zinc-700"><ChevronRight className="w-6 h-6" /></button>
              </div>
              <button
                onClick={() => setShowWalkthrough(false)}
                className="px-8 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90"
              >
                Exit Walkthrough
              </button>
            </div>
          </div>
        )}

        {/* View Mode Selector */}
        <div className={`absolute top-20 right-4 z-10 flex flex-col gap-1 rounded-xl p-1.5 backdrop-blur-md border ${
          dayMode ? 'bg-white/80 border-slate-200' : 'bg-black/50 border-slate-800'
        }`}>
          {viewModes.map(mode => (
            <button
              key={mode.id}
              onClick={() => {
                setViewMode(mode.id);
                if (mode.id === 'walkthrough') setShowWalkthrough(true);
              }}
              className={`p-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 ${
                viewMode === mode.id
                  ? dayMode ? 'bg-white shadow text-slate-800' : 'bg-slate-800 text-white'
                  : dayMode ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-white'
              }`}
            >
              <mode.icon className="w-4 h-4" />
              {mode.label}
            </button>
          ))}
        </div>
      </main>

      {/* Bottom Toolbar */}
      <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 rounded-2xl backdrop-blur-md shadow-xl z-20 border transition-colors duration-700 ${
        dayMode ? 'bg-white/80 border-slate-200' : 'bg-black/60 border-slate-800'
      }`}>
        <button
          onClick={() => setDayMode(!dayMode)}
          className={`p-3 rounded-xl transition-colors ${dayMode ? 'hover:bg-slate-100 text-slate-700' : 'bg-slate-800 text-yellow-400 hover:bg-slate-700'}`}
          title="Toggle Day/Night"
        >
          {dayMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <div className="w-px h-8 bg-slate-300 dark:bg-slate-700 mx-1" />
        <button onClick={() => handleRotate("left")} className={`p-3 rounded-xl transition-colors ${dayMode ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-slate-800 text-slate-300'}`}>
          <RotateCcw className="w-5 h-5" />
        </button>
        <button onClick={() => handleRotate("right")} className={`p-3 rounded-xl transition-colors ${dayMode ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-slate-800 text-slate-300'}`}>
          <RotateCw className="w-5 h-5" />
        </button>
        <div className="w-px h-8 bg-slate-300 dark:bg-slate-700 mx-1" />
        <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className={`p-3 rounded-xl transition-colors ${dayMode ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-slate-800 text-slate-300'}`}>
          <Search className="w-5 h-5" />
        </button>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`p-3 rounded-xl transition-colors ${dayMode ? 'bg-primary/10 text-primary' : 'bg-primary/20 text-primary'}`}
        >
          {isPlaying ? <SkipForward className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>
        <div className="w-px h-8 bg-slate-300 dark:bg-slate-700 mx-1" />
        <button className={`p-3 rounded-xl transition-colors ${dayMode ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-slate-800 text-slate-300'}`}>
          <Camera className="w-5 h-5" />
        </button>
        <button className={`p-3 rounded-xl transition-colors ${dayMode ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-slate-800 text-slate-300'}`}>
          <Settings2 className="w-5 h-5" />
        </button>
        <button
          onClick={toggleFullscreen}
          className={`p-3 rounded-xl transition-colors ${dayMode ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-slate-800 text-slate-300'}`}
        >
          {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}

function currentViewLabel(mode: ViewMode): string {
  switch (mode) {
    case "orbit": return "3D Orbit";
    case "walkthrough": return "Walkthrough";
    case "first-person": return "First-Person";
    case "third-person": return "Third-Person";
  }
}
