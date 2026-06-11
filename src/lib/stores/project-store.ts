import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Room {
  id: string; name: string; width: number; length: number; level: number;
  area?: number; ceiling?: number; type?: string; color?: string;
}
export interface CostEstimate {
  id?: string; foundation: number; concrete: number; steel: number; brick: number;
  flooring: number; plumbing: number; electrical: number; labor: number;
  total: number; contingency?: number; designFees?: number;
}
export interface Material {
  id: string; name: string; type: string; cost: number; unit: string;
  brand?: string; color?: string; sustainability?: number; inStock?: boolean;
}
export interface Project {
  id: string; name: string; description: string; userId: string;
  plotLength: number; plotWidth: number; facing: string; floors: number;
  budgetTier: string; style: string; vastu: boolean;
  status: "draft" | "completed" | "generating" | "archived";
  thumbnail?: string; createdAt: string; updatedAt: string; teamId?: string;
  rooms: Room[]; materials: Material[]; costEstimate?: CostEstimate;
  tags?: string[]; shared?: boolean; shareUrl?: string; viewCount?: number;
  vastuScore?: number; sustainabilityScore?: number; stars?: number;
}

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  setCurrentProject: (id: string) => void;
  createProject: (data: Partial<Project>) => Promise<Project>;
  duplicateProject: (id: string) => Promise<Project | null>;
  deleteProject: (id: string) => Promise<void>;
  updateProject: (id: string, data: Partial<Project>) => void;
  generatePlan: (id: string) => Promise<void>;
  addRoom: (projectId: string, room: { name: string; width: number; length: number; level: number }) => void;
  removeRoom: (projectId: string, roomId: string) => void;
  fetchProjects: () => Promise<void>;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [],
      currentProject: null,
      isLoading: false,

      fetchProjects: async () => {
        try {
          const res = await fetch("/api/projects");
          const data = await res.json();
          if (res.ok && data.projects) {
            set({ projects: data.projects });
          }
        } catch {}
      },

      setCurrentProject: (id: string) => {
        const project = get().projects.find((p) => p.id === id) || null;
        set({ currentProject: project });
      },

      createProject: async (data) => {
        set({ isLoading: true });
        try {
          const res = await fetch("/api/projects", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
          const result = await res.json();
          if (!res.ok) throw new Error(result.error);
          const project = result.project;
          set((state) => ({
            projects: [project, ...state.projects],
            currentProject: project,
            isLoading: false,
          }));
          return project;
        } catch {
          set({ isLoading: false });
          throw new Error("Failed to create project");
        }
      },

      duplicateProject: async (id) => {
        try {
          const res = await fetch(`/api/projects/${id}/duplicate`, { method: "POST" });
          const data = await res.json();
          if (!res.ok) return null;
          const dup = data.project;
          set((state) => ({ projects: [dup, ...state.projects], currentProject: dup }));
          return dup;
        } catch {
          return null;
        }
      },

      deleteProject: async (id) => {
        try {
          await fetch(`/api/projects/${id}`, { method: "DELETE" });
          set((state) => ({
            projects: state.projects.filter((p) => p.id !== id),
            currentProject: state.currentProject?.id === id ? null : state.currentProject,
          }));
        } catch {}
      },

      updateProject: (id, data) => {
        set((state) => ({
          projects: state.projects.map((p) => (p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p)),
          currentProject: state.currentProject?.id === id ? { ...state.currentProject, ...data } : state.currentProject,
        }));
      },

      generatePlan: async (id) => {
        set({ isLoading: true });
        try {
          const res = await fetch(`/api/projects/${id}/generate`, { method: "POST" });
          const data = await res.json();
          if (res.ok && data.project) {
            set((state) => ({
              projects: state.projects.map((p) => p.id === id ? data.project : p),
              isLoading: false,
            }));
          }
        } catch {
          set({ isLoading: false });
        }
      },

      addRoom: (projectId, room) => {
        const newRoom: Room = { id: `r${Date.now()}`, ...room };
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId ? { ...p, rooms: [...p.rooms, newRoom] } : p
          ),
          currentProject:
            state.currentProject?.id === projectId
              ? { ...state.currentProject, rooms: [...state.currentProject.rooms, newRoom] }
              : state.currentProject,
        }));
      },

      removeRoom: (projectId, roomId) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId ? { ...p, rooms: p.rooms.filter((r) => r.id !== roomId) } : p
          ),
          currentProject:
            state.currentProject?.id === projectId
              ? { ...state.currentProject, rooms: state.currentProject.rooms.filter((r) => r.id !== roomId) }
              : state.currentProject,
        }));
      },
    }),
    { name: "project-storage" }
  )
);
