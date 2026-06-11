"use client";

import * as React from "react";
import Link from "next/link";
import { 
  Hexagon, MousePointer2, Move, Square, DoorOpen, Expand, Focus,
  Settings, Undo, Redo, ZoomIn, ZoomOut, Save, Download, Play, Sparkles,
  ChevronRight, ArrowLeft
} from "lucide-react";

export default function WorkspacePage() {
  const [activeTool, setActiveTool] = React.useState("select");
  const [rightPanel, setRightPanel] = React.useState("properties");

  const tools = [
    { id: "select", icon: MousePointer2, label: "Select (V)" },
    { id: "move", icon: Move, label: "Pan (Space)" },
    { divider: true },
    { id: "wall", icon: Square, label: "Draw Wall (W)" },
    { id: "room", icon: Expand, label: "Add Room (R)" },
    { id: "door", icon: DoorOpen, label: "Add Door (D)" },
    { id: "window", icon: Focus, label: "Add Window (O)" },
  ];

  return (
    <div className="h-screen w-full flex flex-col bg-slate-100 dark:bg-zinc-950 overflow-hidden select-none">
      
      {/* Top Toolbar */}
      <header className="h-14 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 shrink-0 z-20">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <Hexagon className="w-5 h-5 text-primary" />
            <span className="font-semibold text-sm">Luxury Villa - Ground Floor</span>
          </div>
          
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-2" />
          
          <div className="hidden md:flex items-center gap-1">
            <button className="px-3 py-1.5 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors text-slate-600 dark:text-slate-300">File</button>
            <button className="px-3 py-1.5 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors text-slate-600 dark:text-slate-300">Edit</button>
            <button className="px-3 py-1.5 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors text-slate-600 dark:text-slate-300">View</button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1 mr-2">
            <button className="px-3 py-1 text-xs font-semibold bg-white dark:bg-zinc-700 shadow rounded-md">2D</button>
            <Link href="/viewer-3d" className="px-3 py-1 text-xs font-medium text-slate-500 hover:text-foreground transition-colors">3D</Link>
          </div>
          
          <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" title="Undo (Ctrl+Z)">
            <Undo className="w-4 h-4" />
          </button>
          <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" title="Redo (Ctrl+Y)">
            <Redo className="w-4 h-4" />
          </button>
          
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1" />
          
          <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-sm font-medium">
            <Save className="w-4 h-4" /> Save
          </button>
          <button className="flex items-center gap-2 px-4 py-1.5 bg-primary text-white hover:bg-primary/90 rounded-lg transition-colors text-sm font-medium shadow-sm">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Toolbar */}
        <aside className="w-14 bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-slate-800 flex flex-col items-center py-4 gap-2 z-20 shrink-0">
          {tools.map((tool, i) => {
            if (tool.divider) {
              return <div key={i} className="w-8 h-px bg-slate-200 dark:bg-slate-800 my-2" />;
            }
            const isActive = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id as string)}
                title={tool.label}
                className={`p-2.5 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-primary/10 text-primary shadow-sm' 
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-foreground'
                }`}
              >
                {tool.icon && <tool.icon className="w-5 h-5" />}
              </button>
            );
          })}
        </aside>

        {/* Center Canvas */}
        <main className="flex-1 relative bg-[#e2e8f0] dark:bg-[#09090b] overflow-hidden">
          
          {/* Blueprint Grid Background */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-50 dark:opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(to right, #3b82f6 1px, transparent 1px),
                linear-gradient(to bottom, #3b82f6 1px, transparent 1px),
                linear-gradient(to right, #3b82f6 1px, transparent 1px),
                linear-gradient(to bottom, #3b82f6 1px, transparent 1px)
              `,
              backgroundSize: '100px 100px, 100px 100px, 20px 20px, 20px 20px',
              backgroundPosition: '-1px -1px, -1px -1px, -1px -1px, -1px -1px'
            }}
          />

          {/* Canvas Viewport Controls */}
          <div className="absolute top-4 left-4 z-10 flex gap-2">
            <div className="glass-card dark:glass-card-dark p-1 rounded-lg flex shadow-md">
              <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors"><ZoomOut className="w-4 h-4" /></button>
              <div className="flex items-center px-3 text-xs font-bold text-slate-500">100%</div>
              <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors"><ZoomIn className="w-4 h-4" /></button>
            </div>
          </div>

          {/* Simulated Plan Drawing */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-white shadow-2xl border-4 border-slate-800 relative">
            {/* Walls & Rooms placeholder */}
            <div className="absolute top-0 left-0 w-[400px] h-[400px] border-r-4 border-slate-800 bg-slate-50 flex items-center justify-center relative">
              <span className="text-slate-400 font-bold tracking-widest text-lg uppercase">Living Area</span>
              <div className="absolute top-1/2 left-0 -translate-x-1/2 w-4 h-16 bg-white border-y-4 border-slate-800" /> {/* Door */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-4 bg-blue-200 border-x-4 border-slate-800" /> {/* Window */}
            </div>
            <div className="absolute top-0 right-0 w-[200px] h-[200px] border-b-4 border-slate-800 bg-slate-100 flex items-center justify-center">
              <span className="text-slate-400 font-bold tracking-widest text-sm uppercase">Kitchen</span>
            </div>
            <div className="absolute bottom-0 right-0 w-[200px] h-[200px] bg-slate-100 flex items-center justify-center">
              <span className="text-slate-400 font-bold tracking-widest text-sm uppercase">Bath</span>
            </div>
            
            {/* Dimensions */}
            <div className="absolute -top-6 left-0 w-full flex items-center justify-center">
              <div className="h-px w-full bg-blue-500 relative">
                <div className="absolute -top-2 left-0 w-px h-4 bg-blue-500" />
                <div className="absolute -top-2 right-0 w-px h-4 bg-blue-500" />
                <span className="absolute -top-6 bg-[#e2e8f0] dark:bg-[#09090b] px-2 text-xs font-bold text-blue-500">30' 0"</span>
              </div>
            </div>
          </div>

        </main>

        {/* Right Sidebar */}
        <aside className="w-80 bg-white dark:bg-zinc-900 border-l border-slate-200 dark:border-slate-800 flex flex-col z-20 shrink-0">
          
          {/* Right Panel Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 p-2 gap-2 shrink-0">
            <button 
              onClick={() => setRightPanel("properties")}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${rightPanel === 'properties' ? 'bg-slate-100 dark:bg-slate-800 text-foreground shadow-sm' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
            >
              Properties
            </button>
            <button 
              onClick={() => setRightPanel("ai")}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${rightPanel === 'ai' ? 'bg-primary/10 text-primary shadow-sm' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
            >
              <Sparkles className="w-3 h-3" /> Copilot
            </button>
          </div>

          {/* Properties Panel */}
          {rightPanel === "properties" && (
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Selection</h3>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2 font-medium text-sm mb-1">
                    <Square className="w-4 h-4 text-slate-400" /> Exterior Wall
                  </div>
                  <p className="text-xs text-slate-500">ID: W-1042</p>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Dimensions</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">Length</span>
                    <input type="text" defaultValue="14' 6&quot;" className="w-24 px-2 py-1 text-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-slate-800 rounded font-mono text-right focus:outline-primary" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">Thickness</span>
                    <input type="text" defaultValue="0' 9&quot;" className="w-24 px-2 py-1 text-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-slate-800 rounded font-mono text-right focus:outline-primary" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">Height (3D)</span>
                    <input type="text" defaultValue="10' 0&quot;" className="w-24 px-2 py-1 text-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-slate-800 rounded font-mono text-right focus:outline-primary" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Material</h3>
                <button className="w-full flex items-center justify-between p-2 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-orange-100 border border-orange-200 rounded" />
                    <span className="text-sm font-medium">Red Brick</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>
          )}

          {/* AI Copilot Panel */}
          {rightPanel === "ai" && (
            <div className="flex-1 flex flex-col overflow-hidden bg-primary/5">
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="bg-white dark:bg-zinc-800 p-3 rounded-2xl rounded-tl-sm text-sm shadow-sm border border-slate-100 dark:border-slate-700">
                    Hi! I'm your AI Architect Copilot. I can help you modify this layout, optimize the space, or analyze costs. What would you like to do?
                  </div>
                </div>
                
                <div className="pl-11 space-y-2">
                  <button className="block w-full text-left px-3 py-2 text-xs font-medium text-primary bg-white dark:bg-zinc-800 rounded-lg border border-primary/20 hover:bg-primary/10 transition-colors shadow-sm">
                    "Increase living room size by 20%"
                  </button>
                  <button className="block w-full text-left px-3 py-2 text-xs font-medium text-primary bg-white dark:bg-zinc-800 rounded-lg border border-primary/20 hover:bg-primary/10 transition-colors shadow-sm">
                    "Add an attached bathroom to the master"
                  </button>
                  <button className="block w-full text-left px-3 py-2 text-xs font-medium text-primary bg-white dark:bg-zinc-800 rounded-lg border border-primary/20 hover:bg-primary/10 transition-colors shadow-sm">
                    "Check Vastu compliance"
                  </button>
                </div>
              </div>

              <div className="p-4 bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-slate-800">
                <div className="relative flex items-center">
                  <input 
                    type="text" 
                    placeholder="Ask AI to modify..." 
                    className="w-full pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <button className="absolute right-2 p-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                    <Play className="w-3 h-3 ml-0.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

        </aside>

      </div>
      
      {/* Status Bar */}
      <footer className="h-6 bg-slate-100 dark:bg-zinc-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 shrink-0 text-[10px] font-mono text-slate-500 uppercase tracking-widest z-20">
        <div className="flex gap-4">
          <span>X: 104.5</span>
          <span>Y: -42.0</span>
          <span>Grid: 1' 0"</span>
        </div>
        <div className="flex gap-4">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-success"></span> Syncing</span>
          <span>Version 2.4</span>
        </div>
      </footer>

    </div>
  );
}
