import { TaskRepository } from '../repositories/task.repository';
import { UserRepository } from '../repositories/user.repository';
import { Task } from '../entities/Task.entity';
import { CreateTaskDto, AssignTaskDto, UpdateTaskDto, CreateTaskMappingDto, TaskLevelStatsDto, UpdateTaskMappingDto } from '../dto/task.dto';
import TaskMapping, { ITaskMapping } from '@models/TaskMapping';

export class TaskService {
  private taskRepository: TaskRepository;
  private userRepository: UserRepository;

  constructor() {
    this.taskRepository = new TaskRepository();
    this.userRepository = new UserRepository();
  }
async createTaskMapping(mappingData: CreateTaskMappingDto & { createdBy: string }): Promise<{
  success: boolean;
  data?: ITaskMapping;
  message: string;
}> {
  try {
    // Check if mapping already exists
    const existingMapping = await TaskMapping.findOne({
      taskName: mappingData.taskName.trim(),
      createdBy: mappingData.createdBy
    });

    if (existingMapping) {
      return {
        success: false,
        message: 'Task mapping already exists for this task'
      };
    }

    const mapping = await this.taskRepository.createTaskMapping(mappingData);
    
    return {
      success: true,
      data: mapping,
      message: 'Task mapping created successfully'
    };
  } catch (error) {
    console.error('TaskService.createTaskMapping error:', error);
    return {
      success: false,
      message: 'Failed to create task mapping'
    };
  }
}

async getTaskMappingsByUser(userEmail: string): Promise<{
  success: boolean;
  data?: ITaskMapping[];
  message: string;
}> {
  try {
    const mappings = await this.taskRepository.getTaskMappingsByUser(userEmail);
    
    return {
      success: true,
      data: mappings,
      message: `Found ${mappings.length} task mappings`
    };
  } catch (error) {
    console.error('TaskService.getTaskMappingsByUser error:', error);
    return {
      success: false,
      message: 'Failed to fetch task mappings'
    };
  }
}

async updateTaskMapping(id: string, updateData: UpdateTaskMappingDto): Promise<{
  success: boolean;
  data?: ITaskMapping;
  message: string;
}> {
  try {
    const mapping = await this.taskRepository.updateTaskMapping(id, updateData);
    
    if (!mapping) {
      return {
        success: false,
        message: 'Task mapping not found'
      };
    }
    
    return {
      success: true,
      data: mapping,
      message: 'Task mapping updated successfully'
    };
  } catch (error) {
    console.error('TaskService.updateTaskMapping error:', error);
    return {
      success: false,
      message: 'Failed to update task mapping'
    };
  }
}

async deleteTaskMapping(id: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const deleted = await this.taskRepository.deleteTaskMapping(id);
    
    if (!deleted) {
      return {
        success: false,
        message: 'Task mapping not found'
      };
    }
    
    return {
      success: true,
      message: 'Task mapping deleted successfully'
    };
  } catch (error) {
    console.error('TaskService.deleteTaskMapping error:', error);
    return {
      success: false,
      message: 'Failed to delete task mapping'
    };
  }
}

// Update the getTaskLevelStats method to use the correct repository method

async getTaskLevelStats(userEmail: string): Promise<{
  success: boolean;
  data?: TaskLevelStatsDto;
  message: string;
}> {
  try {
    // Get mapping statistics
    const mappingStats = await this.taskRepository.getTaskLevelStatsByUser(userEmail);
    
    // ✅ Use the correct method name
    const userTasks = await this.taskRepository.getTasksByUser(userEmail);
    
    // Get mappings to categorize tasks
    const mappings = await this.taskRepository.getTaskMappingsByUser(userEmail);
    const taskNameToLevel = mappings.reduce((acc, mapping) => {
      acc[mapping.taskName.toLowerCase()] = mapping.level;
      return acc;
    }, {} as Record<string, string>);

    // Calculate task statistics
    const taskLevelCounts = { L1: 0, L2: 0, L3: 0, L4: 0, unmapped: 0 };
    const taskLevelDuration = { L1: 0, L2: 0, L3: 0, L4: 0, unmapped: 0 };

    userTasks.forEach((task: { taskName: string; totalDuration: number; }) => {
      const level = taskNameToLevel[task.taskName.toLowerCase()];
      const duration = task.totalDuration || 0;

      if (level) {
        taskLevelCounts[level as keyof typeof taskLevelCounts]++;
        taskLevelDuration[level as keyof typeof taskLevelDuration] += duration;
      } else {
        taskLevelCounts.unmapped++;
        taskLevelDuration.unmapped += duration;
      }
    });

    const stats: TaskLevelStatsDto = {
      mappingCounts: {
        L1: mappingStats.find((s: { _id: string; }) => s._id === 'L1')?.count || 0,
        L2: mappingStats.find((s: { _id: string; }) => s._id === 'L2')?.count || 0,
        L3: mappingStats.find((s: { _id: string; }) => s._id === 'L3')?.count || 0,
        L4: mappingStats.find((s: { _id: string; }) => s._id === 'L4')?.count || 0,
        total: mappings.length
      },
      taskCounts: taskLevelCounts,
      taskDurations: taskLevelDuration,
      totalTasks: userTasks.length,
      totalDuration: userTasks.reduce((sum: any, task: { totalDuration: any; }) => sum + (task.totalDuration || 0), 0)
    };
    
    return {
      success: true,
      data: stats,
      message: 'Task level statistics retrieved successfully'
    };
  } catch (error) {
    console.error('TaskService.getTaskLevelStats error:', error);
    return {
      success: false,
      message: 'Failed to get task level statistics'
    };
  }
}

  async getAllTasks(): Promise<Task[]> {
    try {
      return await this.taskRepository.findAll();
    } catch (error: any) {
      throw new Error(`Failed to get all tasks: ${error.message}`);
    }
  }

  async getTaskById(taskId: string): Promise<Task | null> {
    try {
      return await this.taskRepository.findByTaskId(taskId);
    } catch (error: any) {
      throw new Error(`Failed to get task by ID: ${error.message}`);
    }
  }

  async getAssignedTasks(): Promise<Task[]> {
    try {
      return await this.taskRepository.findAssigned();
    } catch (error: any) {
      throw new Error(`Failed to get assigned tasks: ${error.message}`);
    }
  }

  async getActiveTasks(): Promise<Task[]> {
    try {
      return await this.taskRepository.findActive();
    } catch (error: any) {
      throw new Error(`Failed to get active tasks: ${error.message}`);
    }
  }

  async getTasksByDateRange(startDate: string, endDate: string): Promise<Task[]> {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate + 'T23:59:59.999Z');
      return await this.taskRepository.findByDateRange(start, end);
    } catch (error: any) {
      throw new Error(`Failed to get tasks by date range: ${error.message}`);
    }
  }

  async createTask(taskDto: CreateTaskDto): Promise<{ success: boolean; message: string; data?: Task; error?: string }> {
    try {
      // Validation
      if (!taskDto.taskId || !taskDto.taskName || !taskDto.type) {
        return {
          success: false,
          message: 'Missing required fields: taskId, taskName, and type are required'
        };
      }

      if (!['task', 'meeting'].includes(taskDto.type)) {
        return {
          success: false,
          message: 'Invalid type. Must be either "task" or "meeting"'
        };
      }

      const task = await this.taskRepository.create({
        taskId: taskDto.taskId,
        taskName: taskDto.taskName,
        type: taskDto.type,
        status: taskDto.status || 'started',
        startDate: taskDto.startDate || new Date(),
        totalDuration: taskDto.totalDuration || 0,
        activities: taskDto.activities || [],
        description: taskDto.description || ''
      });

      return {
        success: true,
        message: 'Task created successfully',
        data: task
      };
    } catch (error: any) {
      if (error.message.includes('duplicate key')) {
        return {
          success: false,
          message: 'Task with this ID already exists'
        };
      }
      
      return {
        success: false,
        message: 'Failed to create task',
        error: error.message
      };
    }
  }


  async getPendingApprovalTasks(): Promise<any> {
    try {
      console.log('🔍 TaskService: Getting pending approval tasks...');
      const tasks = await this.taskRepository.findPendingApproval();
      
      console.log(`✅ Found ${tasks.length} tasks pending approval`);
      
      return {
        success: true,
        data: tasks,
        message: `Found ${tasks.length} tasks pending approval`
      };
    } catch (error: any) {
      console.error('❌ TaskService: Error getting pending approval tasks:', error);
      return {
        success: false,
        message: 'Failed to get pending approval tasks',
        error: error.message,
        data: []
      };
    }
  }

  async approveTask(taskId: string, approvedBy: string, comments?: string): Promise<any> {
    try {
      console.log('🚀 TaskService: Approving task:', { taskId, approvedBy, comments });
      
      // Check if task exists
      const existingTask = await this.taskRepository.findByTaskId(taskId);
      if (!existingTask) {
        return {
          success: false,
          message: 'Task not found'
        };
      }

      console.log('📋 Found task to approve:', {
        taskId: existingTask.taskId,
        taskName: existingTask.taskName,
        status: existingTask.status,
        approvalNeeded: existingTask.approvalNeeded
      });

      // Check if task needs approval
      if (!existingTask.approvalNeeded) {
        return {
          success: false,
          message: 'Task does not require approval'
        };
      }

      // Check if already approved
      if (existingTask.isApproved) {
        return {
          success: false,
          message: 'Task is already approved'
        };
      }

      // Approve the task
      const approvedTask = await this.taskRepository.approveTask(taskId, approvedBy, comments);
      
      if (!approvedTask) {
        return {
          success: false,
          message: 'Failed to approve task'
        };
      }

      console.log('✅ Task approved successfully:', {
        taskId: approvedTask.taskId,
        approvedBy: approvedTask.approvedBy,
        approvedAt: approvedTask.approvedAt
      });

      return {
        success: true,
        data: approvedTask,
        message: 'Task approved successfully'
      };
    } catch (error: any) {
      console.error('❌ TaskService: Error approving task:', error);
      return {
        success: false,
        message: 'Failed to approve task',
        error: error.message
      };
    }
  }

  async rejectTask(taskId: string, rejectedBy: string, reason?: string): Promise<any> {
    try {
      console.log('🚀 TaskService: Rejecting task:', { taskId, rejectedBy, reason });
      
      // Check if task exists
      const existingTask = await this.taskRepository.findByTaskId(taskId);
      if (!existingTask) {
        return {
          success: false,
          message: 'Task not found'
        };
      }

      console.log('📋 Found task to reject:', {
        taskId: existingTask.taskId,
        taskName: existingTask.taskName,
        status: existingTask.status,
        approvalNeeded: existingTask.approvalNeeded
      });

      // Check if task needs approval
      if (!existingTask.approvalNeeded) {
        return {
          success: false,
          message: 'Task does not require approval'
        };
      }

      // Check if already processed
      if (existingTask.isApproved || existingTask.rejectedBy) {
        return {
          success: false,
          message: 'Task has already been processed'
        };
      }

      // Reject the task
      const rejectedTask = await this.taskRepository.rejectTask(taskId, rejectedBy, reason);
      
      if (!rejectedTask) {
        return {
          success: false,
          message: 'Failed to reject task'
        };
      }

      console.log('✅ Task rejected successfully:', {
        taskId: rejectedTask.taskId,
        rejectedBy: rejectedTask.rejectedBy,
        rejectedAt: rejectedTask.rejectedAt
      });

      return {
        success: true,
        data: rejectedTask,
        message: 'Task rejected successfully'
      };
    } catch (error: any) {
      console.error('❌ TaskService: Error rejecting task:', error);
      return {
        success: false,
        message: 'Failed to reject task',
        error: error.message
      };
    }
  }

  async assignTask(taskData: any): Promise<any> {
    try {
      console.log('🚀 TaskService: Assigning task:', taskData);
      
      // Create task assignment logic here
      const task = await this.taskRepository.create(taskData);
      
      return {
        success: true,
        data: task,
        message: 'Task assigned successfully'
      };
    } catch (error: any) {
      console.error('❌ TaskService: Error assigning task:', error);
      return {
        success: false,
        message: 'Failed to assign task',
        error: error.message
      };
    }
  }
// Update task completion logic to check for approval
async updateTaskStatus(taskId: string, status: string, userEmail: string): Promise<any> {
  try {
    const task = await this.taskRepository.findByTaskId(taskId);
    
    if (!task) {
      return {
        success: false,
        message: 'Task not found'
      };
    }
    
    // If task requires approval and is being completed, set status to 'completed' instead of 'ended'
    if (task.approvalNeeded && status === 'ended') {
      status = 'completed'; // Waiting for approval
    }
    
    const updatedTask = await this.taskRepository.update(taskId, { 
      status,
      ...(status === 'ended' && { endDate: new Date() })
    });
    
    return {
      success: true,
      data: updatedTask,
      message: task.approvalNeeded && status === 'completed' 
        ? 'Task completed and sent for approval' 
        : 'Task status updated successfully'
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to update task status'
    };
  }
}

  // async updateTaskStatus(taskId: string, updateDto: UpdateTaskDto): Promise<{ success: boolean; message: string; data?: Task; error?: string }> {
  //   try {
  //     const task = await this.taskRepository.findByTaskId(taskId);
  //     if (!task) {
  //       return {
  //         success: false,
  //         message: 'Task not found'
  //       };
  //     }

  //     const updateData: Partial<Task> = {
  //       status: updateDto.status,
  //       totalDuration: updateDto.elapsedTime || task.totalDuration
  //     };

  //     if (updateDto.status === 'ended') {
  //       updateData.endDate = updateDto.endDate || new Date();
  //     }

  //     // Add activity
  //     if (updateDto.status) {
  //       const activity = {
  //         action: updateDto.status,
  //         timestamp: updateDto.timestamp || new Date(),
  //         duration: updateDto.elapsedTime || 0
  //       };

  //       await this.taskRepository.addActivity(taskId, activity);
  //     }

  //     const updatedTask = await this.taskRepository.update(taskId, updateData);

  //     return {
  //       success: true,
  //       message: `Task ${updateDto.status} successfully`,
  //       data: updatedTask!
  //     };
  //   } catch (error: any) {
  //     return {
  //       success: false,
  //       message: `Failed to ${updateDto.status} task`,
  //       error: error.message
  //     };
  //   }
  // }

  async startAssignedTask(taskId: string): Promise<{ success: boolean; message: string; data?: Task; error?: string }> {
    try {
      const task = await this.taskRepository.findAssignedByTaskId(taskId);
      if (!task) {
        return {
          success: false,
          message: 'Assigned task not found'
        };
      }

      // Add activity
      await this.taskRepository.addActivity(taskId, {
        action: 'started',
        timestamp: new Date(),
        duration: 0
      });

      const updatedTask = await this.taskRepository.update(taskId, { status: 'started' });

      return {
        success: true,
        message: 'Assigned task started successfully',
        data: updatedTask!
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to start assigned task',
        error: error.message
      };
    }
  }


async updateTask(taskId: string, updateData: any, userEmail: string): Promise<any> {
  try {
    console.log('🔄 TaskService.updateTask:', { taskId, userEmail, updateData });
    
    const task = await this.taskRepository.findByTaskId(taskId);
    
    if (!task) {
      throw new Error('Task not found');
    }

    // Check permissions
    const canUpdate = task.userEmail === userEmail || 
                     task.assignedToEmail === userEmail ||
                     task.createdBy === userEmail;
    
    if (!canUpdate) {
      throw new Error('Permission denied');
    }

    const updatedTask = await this.taskRepository.updateTask(taskId, updateData);
    
    console.log('✅ Task updated successfully');
    return updatedTask;
  } catch (error: any) {
    console.error('❌ Error in updateTask service:', error);
    throw error;
  }
}

async updateRecurringSettings(taskId: string, recurringData: any, userEmail: string): Promise<any> {
  try {
    console.log('🔄 TaskService.updateRecurringSettings:', { taskId, userEmail });
    return await this.updateTask(taskId, recurringData, userEmail);
  } catch (error) {
    console.error('❌ Error updating recurring settings:', error);
    throw error;
  }
}


private validateRecurringData(data: any): void {
  if (!data.recurringType) {
    throw new Error('Recurring type is required');
  }

  if (data.recurringType === 'schedule' && !data.recurringPattern?.frequency) {
    throw new Error('Frequency is required for schedule-based recurring tasks');
  }

  const validFrequencies = ['daily', 'weekly', 'monthly', 'custom'];
  if (data.recurringPattern?.frequency && !validFrequencies.includes(data.recurringPattern.frequency)) {
    throw new Error('Invalid frequency. Must be one of: daily, weekly, monthly, custom');
  }
}




}
