"use client";

import * as React from "react";
import {
  Library, Search, Building2, Home, Warehouse, Plus,
  ExternalLink, ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";
import { mockTemplates } from "@/lib/api/mock-db";
import { useProjectStore } from "@/lib/stores/project-store";
import { useUIStore } from "@/lib/stores/ui-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const categories = [
  { id: "Residential", label: "Residential", icon: Home },
  { id: "Commercial", label: "Commercial", icon: Building2 },
  { id: "Industrial", label: "Industrial", icon: Warehouse },
];

const floorPlanLibrary = mockTemplates.map((t) => ({
  ...t,
  category: t.category === "Premium" ? "Residential" : t.category,
  size: `${Math.floor(Math.random() * 2000 + 800)} sqft`,
}));

export default function LibraryPage() {
  const { createProject } = useProjectStore();
  const { addToast } = useUIStore();
  const [search, setSearch] = React.useState("");
  const [activeCategory, setActiveCategory] = React.useState("Residential");

  const categorized = floorPlanLibrary.filter((p) => p.category === activeCategory);

  const filtered = categorized.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.style.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddToProjects = async (item: typeof floorPlanLibrary[0]) => {
    await createProject({
      name: item.name,
      description: item.description,
      floors: item.floors,
      style: item.style,
    });
    addToast(`"${item.name}" added to projects`, "success");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Library className="w-6 h-6 text-primary" />
          Floor Plan Library
        </h1>
        <p className="text-slate-500 text-sm mt-1">Browse our collection of pre-designed floor plans by category.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search floor plans..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow text-sm"
          />
        </div>
      </div>

      <div className="flex gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeCategory === cat.id
                ? "bg-primary/10 text-primary border border-primary/20"
                : "bg-transparent text-slate-500 hover:text-foreground border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
            }`}
          >
            <cat.icon className="w-4 h-4" />
            {cat.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Library className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-1">No floor plans found</h3>
          <p className="text-slate-500 text-sm">
            {search ? "Try a different search term." : "No plans available in this category yet."}
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {filtered.map((item, i) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={item.id}
            >
              <Card className="group h-full flex flex-col">
                <div className="aspect-video w-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
                  <Building2 className="w-12 h-12 text-slate-400 dark:text-slate-600" />
                </div>
                <CardContent className="flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold">{item.name}</h3>
                    <Badge>{item.style}</Badge>
                  </div>
                  <p className="text-sm text-slate-500 mb-3">{item.description}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mb-4">
                    <span className="flex items-center gap-1"><Home className="w-3 h-3" />{item.rooms} rooms</span>
                    <span>{item.size}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-auto">
                    <Button variant="outline" size="sm" className="flex-1">
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open
                    </Button>
                    <Button size="sm" className="flex-1" onClick={() => handleAddToProjects(item)}>
                      <Plus className="w-3.5 h-3.5" />
                      Add to Projects
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
