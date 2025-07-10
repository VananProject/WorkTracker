export interface TaskMapping {
  id: string;
  taskName: string;
  level: 'L1' | 'L2' | 'L3' | 'L4';
  category?: string;
  description?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskLevelStats {
  L1: number;
  L2: number;
  L3: number;
  L4: number;
  total: number;
}

export interface TaskMappingFilter {
  level?: 'L1' | 'L2' | 'L3' | 'L4';
  search?: string;
  createdBy?: string;
}

export class TaskMappingService {
  private static readonly STORAGE_KEY = 'task_mappings';
  
  // Get all task mappings
  static getAllMappings(): TaskMapping[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading task mappings:', error);
      return [];
    }
  }
  
  // Get mappings by user
  static getMappingsByUser(userEmail: string): TaskMapping[] {
    return this.getAllMappings().filter(mapping => mapping.createdBy === userEmail);
  }
  
  // Save task mapping
  static saveMapping(mapping: Omit<TaskMapping, 'id' | 'createdAt' | 'updatedAt'>): TaskMapping {
    const mappings = this.getAllMappings();
    const newMapping: TaskMapping = {
      ...mapping,
      id: `mapping_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mappings.push(newMapping);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(mappings));
    return newMapping;
  }
  
  // Update task mapping
  static updateMapping(id: string, updates: Partial<TaskMapping>): TaskMapping | null {
    const mappings = this.getAllMappings();
    const index = mappings.findIndex(m => m.id === id);
    
    if (index === -1) return null;
    
    mappings[index] = {
      ...mappings[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(mappings));
    return mappings[index];
  }
  
  // Delete task mapping
  static deleteMapping(id: string): boolean {
    const mappings = this.getAllMappings();
    const filtered = mappings.filter(m => m.id !== id);
    
    if (filtered.length === mappings.length) return false;
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
    return true;
  }
  
  // Get task level by name
  static getTaskLevel(taskName: string, userEmail: string): 'L1' | 'L2' | 'L3' | 'L4' | null {
    const mappings = this.getMappingsByUser(userEmail);
    const mapping = mappings.find(m => m.taskName.toLowerCase() === taskName.toLowerCase());
    return mapping?.level || null;
  }
  
  // Get level statistics
  static getLevelStats(userEmail: string): TaskLevelStats {
    const mappings = this.getMappingsByUser(userEmail);
    const stats: TaskLevelStats = { L1: 0, L2: 0, L3: 0, L4: 0, total: 0 };
    
    mappings.forEach(mapping => {
      stats[mapping.level]++;
      stats.total++;
    });
    
    return stats;
  }
  
  // Filter mappings
  static filterMappings(mappings: TaskMapping[], filter: TaskMappingFilter): TaskMapping[] {
    return mappings.filter(mapping => {
      if (filter.level && mapping.level !== filter.level) return false;
      if (filter.createdBy && mapping.createdBy !== filter.createdBy) return false;
      if (filter.search && !mapping.taskName.toLowerCase().includes(filter.search.toLowerCase())) return false;
      return true;
    });
  }
}
