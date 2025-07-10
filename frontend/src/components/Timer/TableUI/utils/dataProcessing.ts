import type { Task, UserGroup } from "../types/TaskHistoryTypes";

export const processTasksData = (
  filteredTasks: any[],
  tableFilters: any,
  isAdmin: boolean
): (Task[] | UserGroup[]) => {
  let tasks = [...filteredTasks];

  // Filter by username if specified
  if (tableFilters.username && tableFilters.username.trim()) {
    const searchTerm = tableFilters.username.toLowerCase().trim();
    tasks = tasks.filter(task => {
      const username = task.username || task.userEmail?.split('@')[0] || '';
      const userEmail = task.userEmail || task.createdBy || '';
      return username.toLowerCase().includes(searchTerm) || 
             userEmail.toLowerCase().includes(searchTerm);
    });
  }

  // Filter by task name if specified
  if (tableFilters.taskName && tableFilters.taskName.trim()) {
    const searchTerm = tableFilters.taskName.toLowerCase().trim();
    tasks = tasks.filter(task => 
      task.taskName.toLowerCase().includes(searchTerm)
    );
  }

  // Filter by type
  if (tableFilters.type !== 'all') {
    tasks = tasks.filter(task => task.type === tableFilters.type);
  }

  // Filter by status
  if (tableFilters.status !== 'all') {
    tasks = tasks.filter(task => task.status === tableFilters.status);
  }

  // Filter by date range - ENHANCED with custom date support
  if (tableFilters.dateRange !== 'all') {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    tasks = tasks.filter(task => {
      const taskDate = new Date(task.createdAt || task.startDate || task.startTime);
      
      switch (tableFilters.dateRange) {
        case 'today':
          return taskDate >= startOfToday;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return taskDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return taskDate >= monthAgo;
        case 'custom':
          if (tableFilters.customStartDate && tableFilters.customEndDate) {
            const startDate = new Date(tableFilters.customStartDate);
            const endDate = new Date(tableFilters.customEndDate);
            endDate.setHours(23, 59, 59, 999); // Include the entire end date
            return taskDate >= startDate && taskDate <= endDate;
          }
          return true;
        default:
          return true;
      }
    });
  }

  if (isAdmin) {
    // Group tasks by user for admin view
    const userGroups = new Map<string, UserGroup>();
    
    tasks.forEach(task => {
      const userEmail = task.userEmail || task.createdBy || 'unknown@unknown.com';
      const username = task.username || userEmail.split('@')[0] || 'Unknown User';
      
      if (!userGroups.has(userEmail)) {
        userGroups.set(userEmail, {
          userEmail,
          username,
          tasks: [],
          totalTasks: 0,
          completedTasks: 0,
          activeTasks: 0,
          assignedTasks: 0,
          selfCreatedTasks: 0,
          totalDuration: 0
        });
      }
      
      const userGroup = userGroups.get(userEmail)!;
      userGroup.tasks.push(task);
      userGroup.totalTasks++;
      userGroup.totalDuration += task.totalDuration || 0;
      
      if (task.status === 'ended') {
        userGroup.completedTasks++;
      } else if (['started', 'paused', 'resumed'].includes(task.status)) {
        userGroup.activeTasks++;
      }
      
      if (task.isAssigned) {
        userGroup.assignedTasks++;
      } else {
        userGroup.selfCreatedTasks++;
      }
    });
    
    return Array.from(userGroups.values()).sort((a, b) => 
      a.username.localeCompare(b.username)
    );
  } else {
    // Return individual tasks for regular users
    return tasks.sort((a, b) => 
      new Date(b.createdAt || b.startDate || b.startTime).getTime() - 
      new Date(a.createdAt || a.startDate || a.startTime).getTime()
    );
  }
};

export const getFilteredTasksCount = (
  filteredTasks: any[],
  tableFilters: any
): number => {
  return processTasksData(filteredTasks, tableFilters, false).length;
};
