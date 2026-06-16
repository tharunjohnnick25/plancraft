"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  LayoutTemplate, Layers, Home, ArrowRight, Search,
  Building2, Star, Sparkles, Eye
} from "lucide-react";
import { motion } from "framer-motion";
import { mockTemplates } from "@/lib/api/mock-db";
import { useProjectStore, ProjectAsset } from "@/lib/stores/project-store";
import { useUIStore } from "@/lib/stores/ui-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AssetViewer from "@/components/viewers/AssetViewer";

export default function TemplatesPage() {
  const router = useRouter();
  const { createProject } = useProjectStore();
  const { addToast } = useUIStore();
  const [search, setSearch] = React.useState("");

  const [previewAssets, setPreviewAssets] = React.useState<ProjectAsset[] | null>(null);
  const [previewInitialAssetId, setPreviewInitialAssetId] = React.useState<string | undefined>(undefined);

  const handlePreviewTemplate = (template: typeof mockTemplates[0], mode?: "blueprint" | "3d") => {
    const isModern = template.style.toLowerCase().includes("modern") || template.style.toLowerCase().includes("luxury");
    const isContemporary = template.style.toLowerCase().includes("contemporary");
    const baseImg = isModern 
      ? "/images/showcase/modern_luxury_villa.png" 
      : (isContemporary ? "/images/showcase/compact_urban_duplex.png" : "/images/showcase/scandinavian_apartment.png");

    const templateAssets: ProjectAsset[] = [
      {
        id: `t-blue-${template.id}`,
        name: `${template.name}_2D_Blueprint.png`,
        type: "image/png",
        url: baseImg,
        category: "blueprint",
        size: "1.2 MB",
        createdAt: new Date().toISOString()
      },
      {
        id: `t-3d-${template.id}`,
        name: `${template.name}_3D_Structure.glb`,
        type: "model/gltf-binary",
        url: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
        category: "3d",
        size: "4.8 MB",
        createdAt: new Date().toISOString()
      },
      {
        id: `t-elev-${template.id}`,
        name: `${template.name}_Front_Elevation.png`,
        type: "image/png",
        url: "/images/showcase/modern_luxury_villa.png",
        category: "elevation",
        size: "920 KB",
        createdAt: new Date().toISOString()
      },
      {
        id: `t-render-${template.id}`,
        name: `${template.name}_Presentation_Render.png`,
        type: "image/png",
        url: "/images/showcase/scandinavian_apartment.png",
        category: "render",
        size: "1.5 MB",
        createdAt: new Date().toISOString()
      }
    ];

    setPreviewAssets(templateAssets);
    
    if (mode) {
      const found = templateAssets.find(a => a.category === mode);
      setPreviewInitialAssetId(found?.id);
    } else {
      setPreviewInitialAssetId(templateAssets[0].id);
    }
  };

  const filtered = mockTemplates.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.style.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleUseTemplate = async (template: typeof mockTemplates[0]) => {
    const project = await createProject({
      name: template.name,
      description: template.description,
      floors: template.floors,
      style: template.style,
    });
    addToast(`Template "${template.name}" applied successfully`, "success");
    router.push(`/workspace/2d?project=${project.id}`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <LayoutTemplate className="w-6 h-6 text-primary" />
          Template Library
        </h1>
        <p className="text-slate-500 text-sm mt-1">Start with a pre-designed template and customize it to your needs.</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search templates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow text-sm"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <LayoutTemplate className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-1">No templates found</h3>
          <p className="text-slate-500 text-sm">Try a different search term.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {filtered.map((template, i) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={template.id}
            >
              <Card className="group h-full flex flex-col overflow-hidden hover:shadow-lg hover:border-primary/20 transition-all duration-300">
                <div className="aspect-video w-full bg-gradient-to-br from-primary/5 to-primary/20 flex items-center justify-center relative overflow-hidden">
                  <Building2 className="w-12 h-12 text-primary/30 group-hover:scale-110 transition-transform" />
                  {template.category === "Premium" && (
                    <div className="absolute top-3 right-3 z-10">
                      <Badge variant="warning">
                        <Star className="w-3 h-3" />
                        Premium
                      </Badge>
                    </div>
                  )}
                  {/* Floating Hover Controls */}
                  <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-10">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="text-xs font-semibold rounded-lg shadow-sm"
                      onClick={() => handlePreviewTemplate(template, "blueprint")}
                    >
                      2D Layout
                    </Button>
                    <Button
                      size="sm"
                      className="text-xs font-semibold rounded-lg shadow-sm"
                      onClick={() => handlePreviewTemplate(template, "3d")}
                    >
                      3D Model
                    </Button>
                  </div>
                </div>
                <CardContent className="flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold">{template.name}</h3>
                    <Badge>{template.style}</Badge>
                  </div>
                  <p className="text-sm text-slate-500 mb-4 flex-1">{template.description}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
                    <span className="flex items-center gap-1"><Home className="w-3 h-3" />{template.rooms} rooms</span>
                    <span className="flex items-center gap-1"><Layers className="w-3 h-3" />{template.floors} floor{template.floors > 1 ? "s" : ""}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 text-xs"
                      onClick={() => handlePreviewTemplate(template)}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Preview
                    </Button>
                    <Button
                      className="flex-1 text-xs"
                      onClick={() => handleUseTemplate(template)}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Use Layout
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
      {/* Interactive Template Preview Modal */}
      {previewAssets && (
        <AssetViewer
          assets={previewAssets}
          initialAssetId={previewInitialAssetId}
          onClose={() => setPreviewAssets(null)}
        />
      )}
    </div>
  );
}
