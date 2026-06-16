"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  MousePointer2, Move, Square, Expand, DoorOpen, Focus,
  Undo, Redo, ZoomIn, ZoomOut, Save, Download, FileText, Edit3, Eye,
  ChevronRight, ArrowLeft, Hexagon, Sparkles, Play, Grid3x3,
  Maximize2, Sun, Moon, Ruler, Crosshair, Circle,
  Type
} from "lucide-react";
import { useProjectStore } from "@/lib/stores/project-store";
import { useUIStore } from "@/lib/stores/ui-store";

const ROOM_COLORS: Record<string, string> = {
  living: "#dbeafe",
  bedroom: "#fce7f3",
  kitchen: "#fef3c7",
  bathroom: "#e0e7ff",
  office: "#ede9fe",
  dining: "#d1fae5",
  default: "#f1f5f9",
};

const ROOM_BORDER_COLORS: Record<string, string> = {
  living: "#3b82f6",
  bedroom: "#ec4899",
  kitchen: "#f59e0b",
  bathroom: "#6366f1",
  office: "#8b5cf6",
  dining: "#10b981",
  default: "#94a3b8",
};

const ROOM_ICONS: Record<string, string> = {
  living: "🛋",
  bedroom: "🛏",
  kitchen: "🍳",
  bathroom: "🚿",
  office: "💼",
  dining: "🍽",
  default: "📐",
};

function Workspace2DContent() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("project");

  const { currentProject, setCurrentProject, updateProject } = useProjectStore();
  const { addToast } = useUIStore();

  React.useEffect(() => {
    if (projectId) {
      setCurrentProject(projectId);
    }
  }, [projectId, setCurrentProject]);

  const [activeTool, setActiveTool] = React.useState("select");
  const [rightPanel, setRightPanel] = React.useState<"properties" | "ai">("properties");
  const [zoom, setZoom] = React.useState(100);
  const [gridSize] = React.useState(20);
  const [nightMode, setNightMode] = React.useState(false);
  const [cursorPos, setCursorPos] = React.useState({ x: 0, y: 0 });
  const [showShortcuts, setShowShortcuts] = React.useState(false);
  const [selectedElement, setSelectedElement] = React.useState<string | null>(null);
  const [openMenu, setOpenMenu] = React.useState<string | null>(null);
  const [aiInput, setAiInput] = React.useState("");
  const [aiMessages, setAiMessages] = React.useState<{ role: "ai" | "user"; text: string }[]>([
    { role: "ai", text: "Hi! I'm your AI Architect Copilot. I can help you modify this layout, optimize the space, or analyze costs. What would you like to do?" }
  ]);

  const canvasRef = React.useRef<HTMLDivElement>(null);

  const tools = [
    { id: "select", icon: MousePointer2, label: "Select (V)" },
    { id: "pan", icon: Move, label: "Pan (Space)" },
    { divider: true },
    { id: "wall", icon: Square, label: "Draw Wall (W)" },
    { id: "room", icon: Expand, label: "Add Room (R)" },
    { id: "door", icon: DoorOpen, label: "Add Door (D)" },
    { id: "window", icon: Focus, label: "Add Window (O)" },
    { divider: true },
    { id: "measure", icon: Ruler, label: "Measure (M)" },
    { id: "text", icon: Type, label: "Text (T)" },
    { id: "dimension", icon: Crosshair, label: "Dimension (Shift+D)" },
  ];

  const rooms = currentProject?.rooms || [];

  const SCALE = 8;
  const canvasWidth = currentProject?.plotWidth ? currentProject.plotWidth * SCALE : 700;
  const canvasHeight = currentProject?.plotLength ? currentProject.plotLength * SCALE : 500;

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) / SCALE);
    const y = Math.round((e.clientY - rect.top) / SCALE);
    setCursorPos({ x, y });
  };

  const getRoomTypeColor = (type?: string) => ROOM_COLORS[type || "default"] || ROOM_COLORS.default;
  const getRoomBorderColor = (type?: string) => ROOM_BORDER_COLORS[type || "default"] || ROOM_BORDER_COLORS.default;
  const getRoomIcon = (type?: string) => ROOM_ICONS[type || "default"] || ROOM_ICONS.default;

  const handleExport = React.useCallback((format: "pdf" | "png" | "svg") => {
    if (!canvasRef.current || !currentProject) return;
    addToast(`Exporting "${currentProject.name}" as ${format.toUpperCase()}...`, "success");

    const canvas = document.createElement("canvas");
    const scale = 2;
    canvas.width = canvasWidth * scale;
    canvas.height = canvasHeight * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.scale(scale, scale);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvasWidth, canvasHeight);

    for (const room of rooms) {
      const x = Math.random() * (canvasWidth - room.width * SCALE - 20) + 10;
      const y = Math.random() * (canvasHeight - room.length * SCALE - 20) + 10;
      const w = room.width * SCALE;
      const h = room.length * SCALE;
      const color = getRoomTypeColor(room.type);

      ctx.fillStyle = color;
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = getRoomBorderColor(room.type);
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, w, h);

      ctx.fillStyle = "#1e293b";
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(room.name, x + w / 2, y + h / 2 - 4);
      ctx.font = "10px sans-serif";
      ctx.fillStyle = "#64748b";
      ctx.fillText(`${room.width}' × ${room.length}'`, x + w / 2, y + h / 2 + 12);
    }

    const link = document.createElement("a");
    if (format === "png") {
      link.download = `${currentProject.name.replace(/\s+/g, "-").toLowerCase()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } else if (format === "svg") {
      const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvasWidth}" height="${canvasHeight}">
        <rect width="${canvasWidth}" height="${canvasHeight}" fill="white" stroke="#1e293b" stroke-width="2"/>
        ${rooms.map(r => {
          const rx = Math.random() * (canvasWidth - r.width * SCALE - 20) + 10;
          const ry = Math.random() * (canvasHeight - r.length * SCALE - 20) + 10;
          const rw = r.width * SCALE;
          const rh = r.length * SCALE;
          return `<rect x="${rx}" y="${ry}" width="${rw}" height="${rh}" fill="${getRoomTypeColor(r.type)}" stroke="${getRoomBorderColor(r.type)}" stroke-width="2"/>
            <text x="${rx + rw / 2}" y="${ry + rh / 2}" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="#1e293b">${r.name}</text>
            <text x="${rx + rw / 2}" y="${ry + rh / 2 + 14}" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#64748b">${r.width}' × ${r.length}'</text>`;
        }).join("\n")}
      </svg>`;
      const blob = new Blob([svgContent], { type: "image/svg+xml" });
      link.download = `${currentProject.name.replace(/\s+/g, "-").toLowerCase()}.svg`;
      link.href = URL.createObjectURL(blob);
      link.click();
      URL.revokeObjectURL(link.href);
    } else {
      const win = window.open("", "_blank");
      if (win) {
        win.document.write(`<html><head><title>${currentProject.name}</title>
          <style>body{margin:0;display:flex;justify-content:center;padding:20px;background:#e2e8f0}img{max-width:100%;box-shadow:0 4px 24px rgba(0,0,0,0.15)}</style></head>
          <body><img src="${canvas.toDataURL("image/png")}" /></body></html>`);
        win.document.close();
      }
    }
  }, [currentProject, rooms, canvasRef, addToast, canvasWidth, canvasHeight, SCALE, getRoomTypeColor, getRoomBorderColor]);

  const handleSave = () => {
    if (currentProject) {
      updateProject(currentProject.id, { name: currentProject.name });
      addToast("Project saved!", "success");
    }
  };

  const handleAISuggest = async (text: string) => {
    setAiMessages(prev => [...prev, { role: "user", text }]);
    setAiInput("");
    setTimeout(() => {
      setAiMessages(prev => [...prev, { role: "ai", text: `Great suggestion! I'll analyze the "${text}" request and update the design accordingly.` }]);
    }, 1000);
  };

  const menus = [
    { id: "file", label: "File", items: ["New Project", "Open...", "Save (Ctrl+S)", "Import CAD", "Export as PDF", "Export as PNG", "Export as SVG", "Print"] },
    { id: "edit", label: "Edit", items: ["Undo (Ctrl+Z)", "Redo (Ctrl+Y)", "Cut (Ctrl+X)", "Copy (Ctrl+C)", "Paste (Ctrl+V)", "Delete", "Select All"] },
    { id: "view", label: "View", items: ["Zoom In", "Zoom Out", "Fit to Screen", "Grid Lines", "Snap to Grid", "Toggle 3D View"] },
  ];

  const handleMenuAction = (item: string) => {
    setOpenMenu(null);
    if (item.includes("Export as PDF")) handleExport("pdf");
    else if (item.includes("Export as PNG")) handleExport("png");
    else if (item.includes("Export as SVG")) handleExport("svg");
    else if (item.includes("Save")) handleSave();
  };

  return (
    <div className={`h-screen w-full flex flex-col overflow-hidden select-none transition-colors duration-500 ${nightMode ? 'bg-zinc-950' : 'bg-slate-100'}`}>
      {/* Top Toolbar */}
      <header className={`h-14 border-b flex items-center justify-between px-4 shrink-0 z-30 transition-colors duration-500 ${
        nightMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center gap-3">
          <Link href="/workspace" className={`p-2 rounded-lg transition-colors ${
            nightMode ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-slate-100 text-slate-500'
          }`}>
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <Hexagon className="w-5 h-5 text-primary" />
            <span className="font-semibold text-sm">{currentProject?.name || "Untitled"}</span>
          </div>
          <div className="h-6 w-px bg-slate-200 dark:bg-zinc-800 mx-2" />
          <div className="hidden md:flex items-center gap-1">
            {menus.map(menu => (
              <div key={menu.id} className="relative">
                <button
                  onClick={() => setOpenMenu(openMenu === menu.id ? null : menu.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                    nightMode ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  {menu.label}
                </button>
                {openMenu === menu.id && (
                  <div className={`absolute top-full left-0 mt-1 w-44 rounded-xl shadow-2xl border py-1 z-50 ${
                    nightMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'
                  }`}>
                    {menu.items.map((item, i) => (
                      <button
                        key={i}
                        onClick={() => handleMenuAction(item)}
                        className={`w-full text-left px-4 py-2 text-xs font-medium transition-colors ${
                          nightMode ? 'text-zinc-300 hover:bg-zinc-800' : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex items-center rounded-lg p-0.5 border ${
            nightMode ? 'bg-zinc-800 border-zinc-700' : 'bg-slate-100 border-slate-200'
          }`}>
            <button className={`px-3 py-1 text-xs font-semibold shadow-sm rounded-md ${
              nightMode ? 'bg-zinc-700 text-white' : 'bg-white'
            }`}>2D</button>
            <Link href="/workspace/3d" className={`px-3 py-1 text-xs font-medium transition-colors ${
              nightMode ? 'text-zinc-400 hover:text-white' : 'text-slate-500 hover:text-foreground'
            }`}>3D</Link>
          </div>
          <div className="h-6 w-px bg-slate-200 dark:bg-zinc-800 mx-1" />
          <button onClick={() => setZoom(z => Math.max(25, z - 10))} className={`p-2 rounded-lg transition-colors ${
            nightMode ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-slate-100 text-slate-500'
          }`} title="Zoom Out"><ZoomOut className="w-4 h-4" /></button>
          <span className={`text-xs font-bold min-w-[3rem] text-center ${
            nightMode ? 'text-zinc-400' : 'text-slate-500'
          }`}>{zoom}%</span>
          <button onClick={() => setZoom(z => Math.min(400, z + 10))} className={`p-2 rounded-lg transition-colors ${
            nightMode ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-slate-100 text-slate-500'
          }`} title="Zoom In"><ZoomIn className="w-4 h-4" /></button>
          <div className="h-6 w-px bg-slate-200 dark:bg-zinc-800 mx-1" />
          <button onClick={handleSave} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors text-xs font-medium ${
            nightMode ? 'hover:bg-zinc-800 text-zinc-300' : 'hover:bg-slate-100 text-slate-600'
          }`}>
            <Save className="w-3.5 h-3.5" /> Save
          </button>
          <div className="relative">
            <button
              onClick={() => setOpenMenu(openMenu === "export" ? null : "export")}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-primary text-white hover:bg-primary/90 rounded-lg transition-colors text-xs font-medium shadow-sm"
            >
              <Download className="w-3.5 h-3.5" /> Export
            </button>
            {openMenu === "export" && (
              <div className={`absolute top-full right-0 mt-1 w-36 rounded-xl shadow-2xl border py-1 z-50 ${
                nightMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'
              }`}>
                {["Export as PDF", "Export as PNG", "Export as SVG"].map((item) => (
                  <button
                    key={item}
                    onClick={() => handleMenuAction(item)}
                    className={`w-full text-left px-4 py-2 text-xs font-medium transition-colors ${
                      nightMode ? 'text-zinc-300 hover:bg-zinc-800' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Toolbar */}
        <aside className={`w-14 flex flex-col items-center py-4 gap-2 z-20 shrink-0 border-r transition-colors duration-500 ${
          nightMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'
        }`}>
          {tools.map((tool, i) => {
            if ("divider" in tool) return <div key={i} className={`w-8 h-px my-1 ${nightMode ? 'bg-zinc-800' : 'bg-slate-200'}`} />;
            const isActive = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                title={tool.label}
                className={`p-2.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-primary/10 text-primary shadow-sm'
                    : nightMode
                      ? 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-foreground'
                }`}
              >
                {React.createElement(tool.icon, { className: "w-5 h-5" })}
              </button>
            );
          })}
        </aside>

        {/* Center Canvas */}
        <main
          ref={canvasRef}
          className={`flex-1 relative overflow-hidden transition-colors duration-500 ${
            nightMode ? 'bg-[#0a0a0f]' : 'bg-[#e2e8f0]'
          }`}
          onMouseMove={handleMouseMove}
        >
          {/* Grid */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              opacity: nightMode ? 0.15 : 0.4,
              backgroundImage: `
                linear-gradient(rgba(59,130,246,0.5) 1px, transparent 1px),
                linear-gradient(90deg, rgba(59,130,246,0.5) 1px, transparent 1px)
              `,
              backgroundSize: `${gridSize}px ${gridSize}px`
            }}
          />

          {/* Canvas Controls Overlay */}
          <div className="absolute top-4 left-4 z-10 flex gap-2">
            <div className={`rounded-lg p-1 flex shadow-md border ${
              nightMode ? 'bg-zinc-900/90 border-zinc-700' : 'bg-white/90 border-slate-200'
            }`}>
              <button onClick={() => setNightMode(!nightMode)} className={`p-2 rounded-md transition-colors ${
                nightMode ? 'hover:bg-zinc-700 text-yellow-400' : 'hover:bg-slate-100 text-slate-500'
              }`}>
                {nightMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button onClick={() => setShowShortcuts(!showShortcuts)} className={`p-2 rounded-md transition-colors ${
                nightMode ? 'hover:bg-zinc-700 text-zinc-400' : 'hover:bg-slate-100 text-slate-500'
              }`}>
                <Grid3x3 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Keyboard Shortcuts Panel */}
          {showShortcuts && (
            <div className={`absolute top-16 left-4 z-20 rounded-xl shadow-2xl border p-4 w-64 ${
              nightMode ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-slate-200'
            }`}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Keyboard Shortcuts</h3>
              <div className="space-y-1.5">
                {[
                  ["V", "Select Tool"], ["W", "Wall Tool"], ["R", "Room Tool"],
                  ["D", "Door Tool"], ["O", "Window Tool"], ["M", "Measure"],
                  ["Space", "Pan Tool"], ["Ctrl+Z", "Undo"], ["Ctrl+Y", "Redo"],
                  ["Ctrl+S", "Save"], ["+/-", "Zoom In/Out"],
                ].map(([key, desc], i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className={`text-xs ${nightMode ? 'text-zinc-400' : 'text-slate-500'}`}>{desc}</span>
                    <kbd className={`px-1.5 py-0.5 text-[10px] font-mono font-bold rounded border ${
                      nightMode ? 'bg-zinc-800 text-zinc-300 border-zinc-700' : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>{key}</kbd>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dynamic Floor Plan Canvas */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ transform: `translate(-50%, -50%) scale(${zoom / 100})` }}>
            <div className={`relative shadow-2xl border-4 transition-colors duration-500 ${
              nightMode ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-slate-800'
            }`} style={{ width: canvasWidth, height: canvasHeight }}>
              {rooms.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className={`text-6xl mb-4 ${nightMode ? 'text-zinc-700' : 'text-slate-300'}`}>📐</div>
                    <p className={`text-sm font-medium ${nightMode ? 'text-zinc-500' : 'text-slate-400'}`}>No rooms added yet</p>
                    <p className={`text-xs mt-1 ${nightMode ? 'text-zinc-600' : 'text-slate-400'}`}>Add rooms to see your floor plan</p>
                  </div>
                </div>
              )}

              {rooms.map((room, i) => {
                const x = 20 + (i * 30) % (canvasWidth - room.width * SCALE - 40);
                const y = 20 + (i * 40) % (canvasHeight - room.length * SCALE - 40);
                const w = Math.max(room.width * SCALE, 60);
                const h = Math.max(room.length * SCALE, 60);
                const color = getRoomTypeColor(room.type);
                const borderColor = getRoomBorderColor(room.type);
                const icon = getRoomIcon(room.type);

                return (
                  <div
                    key={room.id}
                    className={`absolute rounded-lg flex flex-col items-center justify-center transition-all duration-200 hover:shadow-lg hover:z-10 cursor-pointer ${
                      selectedElement === room.id ? 'ring-2 ring-primary ring-offset-2' : ''
                    }`}
                    style={{
                      left: x, top: y, width: w, height: h,
                      backgroundColor: color,
                      border: `2px solid ${borderColor}`,
                    }}
                    onClick={() => setSelectedElement(room.id)}
                  >
                    <span style={{ fontSize: `${Math.min(24, Math.max(14, w / 8))}px` }}>{icon}</span>
                    <span className={`font-bold text-center leading-tight ${nightMode ? 'text-zinc-800' : 'text-slate-700'}`}
                      style={{ fontSize: `${Math.min(13, Math.max(9, w / 14))}px` }}
                    >
                      {room.name}
                    </span>
                    <span className={`text-center ${nightMode ? 'text-zinc-600' : 'text-slate-500'}`}
                      style={{ fontSize: `${Math.min(11, Math.max(8, w / 16))}px` }}
                    >
                      {room.width}&apos;x{room.length}&apos;
                    </span>
                    {/* Window indicators */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-1.5 bg-blue-300 border-x-2 border-b-2" style={{ borderColor: borderColor }} />
                    {/* Door indicator */}
                    <div className="absolute top-1/2 left-0 -translate-y-1/2 w-1.5 h-1/4 bg-amber-200 border-y-2 border-r-2" style={{ borderColor: borderColor }} />
                  </div>
                );
              })}

              {/* Dimension Lines */}
              {rooms.length > 0 && (
                <>
                  <div className="absolute -top-7 left-0 w-full flex items-center justify-center">
                    <div className={`h-px w-[90%] relative`} style={{ backgroundColor: nightMode ? '#6366f1' : '#3b82f6' }}>
                      <div className="absolute -top-1.5 left-0 w-px h-3" style={{ backgroundColor: nightMode ? '#6366f1' : '#3b82f6' }} />
                      <div className="absolute -top-1.5 right-0 w-px h-3" style={{ backgroundColor: nightMode ? '#6366f1' : '#3b82f6' }} />
                      <span className={`absolute -top-6 left-1/2 -translate-x-1/2 px-2 text-[10px] font-bold ${
                        nightMode ? 'text-indigo-400 bg-zinc-900' : 'text-blue-500 bg-[#e2e8f0]'
                      }`}>{currentProject?.plotWidth || 0}&apos; 0&quot;</span>
                    </div>
                  </div>
                  <div className="absolute -left-10 top-0 h-full flex items-center">
                    <div className={`w-px h-[90%] relative`} style={{ backgroundColor: nightMode ? '#6366f1' : '#3b82f6' }}>
                      <div className="absolute -left-1.5 top-0 h-px w-3" style={{ backgroundColor: nightMode ? '#6366f1' : '#3b82f6' }} />
                      <div className="absolute -left-1.5 bottom-0 h-px w-3" style={{ backgroundColor: nightMode ? '#6366f1' : '#3b82f6' }} />
                      <span className={`absolute -left-16 top-1/2 -translate-y-1/2 px-2 text-[10px] font-bold -rotate-90 whitespace-nowrap ${
                        nightMode ? 'text-indigo-400 bg-zinc-900' : 'text-blue-500 bg-[#e2e8f0]'
                      }`}>{currentProject?.plotLength || 0}&apos; 0&quot;</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className={`w-80 flex flex-col z-20 shrink-0 border-l transition-colors duration-500 ${
          nightMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'
        }`}>
          {/* Panel Tabs */}
          <div className={`flex border-b p-2 gap-2 shrink-0 ${
            nightMode ? 'border-zinc-800' : 'border-slate-200'
          }`}>
            <button
              onClick={() => setRightPanel("properties")}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                rightPanel === 'properties'
                  ? nightMode ? 'bg-zinc-800 text-white shadow-sm' : 'bg-slate-100 text-foreground shadow-sm'
                  : nightMode ? 'text-zinc-500 hover:bg-zinc-800/50' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              Properties
            </button>
            <button
              onClick={() => setRightPanel("ai")}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                rightPanel === 'ai'
                  ? 'bg-primary/10 text-primary shadow-sm'
                  : nightMode ? 'text-zinc-500 hover:bg-zinc-800/50' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <Sparkles className="w-3 h-3" /> Copilot
            </button>
          </div>

          {/* Properties Panel */}
          {rightPanel === "properties" && (
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Project Info</h3>
                <div className={`p-3 rounded-lg border space-y-2 ${
                  nightMode ? 'bg-zinc-800/50 border-zinc-700' : 'bg-slate-50 border-slate-200'
                }`}>
                  <p className="text-sm font-medium">{currentProject?.name || "Untitled"}</p>
                  <div className="flex flex-wrap gap-1">
                    {currentProject?.plotLength && currentProject.plotWidth ? (
                      <span className="px-2 py-0.5 text-[10px] font-medium bg-slate-200 dark:bg-slate-700 rounded">{currentProject.plotLength}x{currentProject.plotWidth}ft</span>
                    ) : null}
                    {currentProject?.style ? (
                      <span className="px-2 py-0.5 text-[10px] font-medium bg-slate-200 dark:bg-slate-700 rounded">{currentProject.style}</span>
                    ) : null}
                    {currentProject?.facing ? (
                      <span className="px-2 py-0.5 text-[10px] font-medium bg-slate-200 dark:bg-slate-700 rounded">{currentProject.facing}</span>
                    ) : null}
                    {currentProject?.budgetTier ? (
                      <span className="px-2 py-0.5 text-[10px] font-medium bg-slate-200 dark:bg-slate-700 rounded">{currentProject.budgetTier}</span>
                    ) : null}
                  </div>
                </div>
              </div>

              {selectedElement && (() => {
                const room = rooms.find(r => r.id === selectedElement);
                if (!room) return null;
                return (
                  <>
                    <div>
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Selected Room</h3>
                      <div className={`p-3 rounded-lg border ${
                        nightMode ? 'bg-zinc-800/50 border-zinc-700' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <div className="flex items-center gap-2 font-medium text-sm mb-1">
                          <Expand className="w-4 h-4 text-slate-400" />
                          {room.name}
                        </div>
                        <p className="text-xs text-slate-500">ID: {room.id} | Type: {room.type || "generic"}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Dimensions</h3>
                      <div className="space-y-3">
                        {[["Width", `${room.width}'`], ["Length", `${room.length}'`], ["Area", room.area ? `${room.area} sqft` : `${room.width * room.length} sqft`]].map(([label, val]) => (
                          <div key={label} className="flex items-center justify-between">
                            <span className="text-sm text-slate-500">{label}</span>
                            <input type="text" defaultValue={val} className={`w-24 px-2 py-1 text-sm rounded font-mono text-right focus:outline-primary border ${nightMode ? 'bg-zinc-800 border-zinc-700 text-zinc-200' : 'bg-white border-slate-200'}`} readOnly />
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                );
              })()}

              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Rooms ({rooms.length})</h3>
                <div className="space-y-1.5">
                  {rooms.map(room => (
                    <button
                      key={room.id}
                      onClick={() => setSelectedElement(room.id)}
                      className={`w-full flex items-center gap-2 p-2 rounded-lg text-sm transition-colors border ${
                        selectedElement === room.id
                          ? 'border-primary bg-primary/5'
                          : nightMode ? 'border-transparent hover:bg-zinc-800' : 'border-transparent hover:bg-slate-50'
                      }`}
                    >
                      <span>{getRoomIcon(room.type)}</span>
                      <span className="flex-1 text-left font-medium">{room.name}</span>
                      <span className="text-xs text-slate-400">{room.width}&apos;x{room.length}&apos;</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* AI Copilot Panel */}
          {rightPanel === "ai" && (
            <div className="flex-1 flex flex-col overflow-hidden bg-primary/[0.03]">
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {aiMessages.map((msg, i) => (
                  <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      msg.role === 'ai' ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-200'
                    }`}>
                      {msg.role === 'ai' ? <Sparkles className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                    </div>
                    <div className={`p-3 rounded-2xl text-sm max-w-[85%] ${
                      msg.role === 'ai'
                        ? nightMode ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-slate-100'
                        : 'bg-primary/10 border-primary/20'
                    } shadow-sm border`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div className="space-y-2 pl-3">
                  {["Increase living room size by 20%", "Add an attached bathroom to the master", "Check Vastu compliance", "Generate cost estimate"].map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleAISuggest(s)}
                      className="block w-full text-left px-3 py-2 text-xs font-medium text-primary rounded-lg border border-primary/20 hover:bg-primary/10 transition-colors shadow-sm"
                    >
                      &quot;{s}&quot;
                    </button>
                  ))}
                </div>
              </div>
              <div className={`p-4 border-t ${
                nightMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'
              }`}>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={aiInput}
                    onChange={e => setAiInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && aiInput.trim()) handleAISuggest(aiInput.trim()); }}
                    placeholder="Ask AI to modify..."
                    className={`w-full pl-4 pr-10 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 border ${
                      nightMode ? 'bg-zinc-950 border-zinc-700 text-zinc-200 placeholder-zinc-500' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                  <button
                    onClick={() => { if (aiInput.trim()) handleAISuggest(aiInput.trim()); }}
                    className="absolute right-2 p-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <Play className="w-3 h-3 ml-0.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Status Bar */}
      <footer className={`h-6 flex items-center justify-between px-4 shrink-0 text-[10px] font-mono uppercase tracking-widest z-20 border-t transition-colors duration-500 ${
        nightMode ? 'bg-zinc-950 text-zinc-500 border-zinc-800' : 'bg-slate-100 text-slate-500 border-slate-200'
      }`}>
        <div className="flex gap-4">
          <span>X: {cursorPos.x}</span>
          <span>Y: {cursorPos.y}</span>
          <span>Grid: {gridSize}&quot;</span>
          <span>Tool: {activeTool}</span>
          <span>Rooms: {rooms.length}</span>
        </div>
        <div className="flex gap-4">
          <span className="flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${nightMode ? 'bg-green-500' : 'bg-green-600'}`}></span>
            Synced
          </span>
          <span>{currentProject?.name || "No Project"}</span>
        </div>
      </footer>
    </div>
  );
}

export default function Workspace2DPage() {
  return (
    <React.Suspense fallback={
      <div className="h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-zinc-950">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500">Loading workspace...</p>
        </div>
      </div>
    }>
      <Workspace2DContent />
    </React.Suspense>
  );
}
