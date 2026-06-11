"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  LayoutTemplate, Layers, Home, ArrowRight, Search,
  Building2, Star, Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import { mockTemplates } from "@/lib/api/mock-db";
import { useProjectStore } from "@/lib/stores/project-store";
import { useUIStore } from "@/lib/stores/ui-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function TemplatesPage() {
  const router = useRouter();
  const { createProject } = useProjectStore();
  const { addToast } = useUIStore();
  const [search, setSearch] = React.useState("");

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
              <Card className="group h-full flex flex-col overflow-hidden">
                <div className="aspect-video w-full bg-gradient-to-br from-primary/5 to-primary/20 flex items-center justify-center relative">
                  <Building2 className="w-12 h-12 text-primary/30" />
                  {template.category === "Premium" && (
                    <div className="absolute top-3 right-3">
                      <Badge variant="warning">
                        <Star className="w-3 h-3" />
                        Premium
                      </Badge>
                    </div>
                  )}
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
                  <Button className="w-full" onClick={() => handleUseTemplate(template)}>
                    <Sparkles className="w-4 h-4" />
                    Use Template
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
