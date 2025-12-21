import { type BrandProject, type InsertBrandProject, type ArchivedEntry, type InsertArchivedEntry } from "@shared/schema";

// Storage interface for brand projects and archived entries
export interface IStorage {
  // Brand Projects
  getBrandProject(id: number): Promise<BrandProject | undefined>;
  getBrandProjectsBySearch(query: string): Promise<BrandProject[]>;
  createBrandProject(project: InsertBrandProject): Promise<BrandProject>;
  updateBrandProject(project: BrandProject): Promise<void>;
  deleteBrandProject(id: number): Promise<void>;
  getAllBrandProjects(): Promise<BrandProject[]>;
  
  // Archived Entries
  getArchivedEntry(id: number): Promise<ArchivedEntry | undefined>;
  getArchivedEntriesBySearch(query: string): Promise<ArchivedEntry[]>;
  getArchivedEntriesByCategory(category: string): Promise<ArchivedEntry[]>;
  createArchivedEntry(entry: InsertArchivedEntry): Promise<ArchivedEntry>;
  updateArchivedEntry(entry: ArchivedEntry): Promise<void>;
  deleteArchivedEntry(id: number): Promise<void>;
  getAllArchivedEntries(): Promise<ArchivedEntry[]>;
}

export class MemStorage implements IStorage {
  private projects: Map<number, BrandProject>;
  private entries: Map<number, ArchivedEntry>;
  private nextProjectId: number;
  private nextEntryId: number;

  constructor() {
    this.projects = new Map();
    this.entries = new Map();
    this.nextProjectId = 1;
    this.nextEntryId = 1;
  }

  // Brand Projects methods
  async getBrandProject(id: number): Promise<BrandProject | undefined> {
    return this.projects.get(id);
  }

  async getBrandProjectsBySearch(query: string): Promise<BrandProject[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.projects.values()).filter(project => {
      return (
        project.name.toLowerCase().includes(lowerQuery) ||
        (project.description && project.description.toLowerCase().includes(lowerQuery)) ||
        (project.industry && project.industry.toLowerCase().includes(lowerQuery))
      );
    });
  }

  async createBrandProject(insertProject: InsertBrandProject): Promise<BrandProject> {
    const id = this.nextProjectId++;
    const now = new Date();
    const project: BrandProject = { 
      ...insertProject, 
      id,
      rating: 0,
      exported: false,
      edited: false,
      createdAt: now,
      updatedAt: now
    };
    this.projects.set(id, project);
    return project;
  }

  async updateBrandProject(project: BrandProject): Promise<void> {
    if (project.id) {
      const updatedProject = {
        ...project,
        edited: true,
        updatedAt: new Date()
      };
      this.projects.set(project.id, updatedProject);
    }
  }

  async deleteBrandProject(id: number): Promise<void> {
    this.projects.delete(id);
  }

  async getAllBrandProjects(): Promise<BrandProject[]> {
    return Array.from(this.projects.values());
  }

  // Archived Entries methods
  async getArchivedEntry(id: number): Promise<ArchivedEntry | undefined> {
    return this.entries.get(id);
  }

  async getArchivedEntriesBySearch(query: string): Promise<ArchivedEntry[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.entries.values()).filter(entry => {
      return (
        entry.filename.toLowerCase().includes(lowerQuery) ||
        entry.content.toLowerCase().includes(lowerQuery) ||
        entry.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
        (entry.category && entry.category.toLowerCase().includes(lowerQuery))
      );
    });
  }

  async getArchivedEntriesByCategory(category: string): Promise<ArchivedEntry[]> {
    return Array.from(this.entries.values()).filter(entry => 
      entry.category === category
    );
  }

  async createArchivedEntry(insertEntry: InsertArchivedEntry): Promise<ArchivedEntry> {
    const id = this.nextEntryId++;
    const entry: ArchivedEntry = { 
      ...insertEntry, 
      id,
      createdAt: new Date()
    };
    this.entries.set(id, entry);
    return entry;
  }

  async updateArchivedEntry(entry: ArchivedEntry): Promise<void> {
    if (entry.id) {
      this.entries.set(entry.id, entry);
    }
  }

  async deleteArchivedEntry(id: number): Promise<void> {
    this.entries.delete(id);
  }

  async getAllArchivedEntries(): Promise<ArchivedEntry[]> {
    return Array.from(this.entries.values());
  }

  // Additional methods needed by assistant
  async getAllArchiveEntries(): Promise<ArchivedEntry[]> {
    return this.getAllArchivedEntries();
  }

  async getArchiveEntriesByIds(ids: number[]): Promise<ArchivedEntry[]> {
    return Array.from(this.entries.values()).filter(entry => ids.includes(entry.id!));
  }

  async updateArchiveEntry(id: number, entry: Partial<ArchivedEntry>): Promise<ArchivedEntry | null> {
    const existing = this.entries.get(id);
    if (!existing) return null;
    
    const updated = { ...existing, ...entry };
    this.entries.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
