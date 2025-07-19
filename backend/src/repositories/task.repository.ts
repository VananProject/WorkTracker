
const TaskModel = require('../models/Task');
const UserModel = require('../models/User');
import TaskMapping, { ITaskMapping } from '../models/TaskMapping';
import { Task } from '../entities/Task.entity';

export class TaskRepository {
 
  async findAll(): Promise<Task[]> {
    try {
      const tasks = await TaskModel.find({})
        .populate('assignedTo', 'username email')
        .populate('assignedBy', 'username email')
        .sort({ startDate: -1 });
      
      return tasks.map((task: any) => this.mapToEntity(task));
    } catch (error: any) {
      throw new Error(`Failed to find all tasks: ${error.message}`);
    }
  }

  async findByTaskId(taskId: string): Promise<any> {
    try {
      const task = await TaskModel.findOne({ taskId });
      return task;
    } catch (error: any) {
      throw new Error(`Failed to find task by ID: ${error.message}`);
    }
  }

  async findAssigned(): Promise<Task[]> {
    try {
      const tasks = await TaskModel.find({ 
        isAssigned: true,
        status: { $ne: 'ended' }
      })
      .populate('assignedTo', 'username email')
      .populate('assignedBy', 'username email')
      .sort({ startDate: -1 });
      
      return tasks.map((task: any) => this.mapToEntity(task));
    } catch (error: any) {
      throw new Error(`Failed to find assigned tasks: ${error.message}`);
    }
  }

  async findByUserEmail(userEmail: string): Promise<Task[]> {
    try {
      const tasks = await TaskModel.find({
        $or: [
            { createdByEmail: userEmail },
            { assignedToEmail: userEmail }
        ]
      })
      .populate('assignedTo', 'username email')
      .populate('assignedBy', 'username email')
      .sort({ startDate: -1 });
      
      return tasks.map((task: any) => this.mapToEntity(task));
    } catch (error: any) {
      throw new Error(`Failed to find tasks by user email: ${error.message}`);
    }
  }

  async findAssignedToUser(userEmail: string): Promise<Task[]> {
    try {
      const tasks = await TaskModel.find({ 
        assignedToEmail: userEmail,
        isAssigned: true,
        status: { $ne: 'ended' }
      })
      .populate('assignedTo', 'username email')
      .populate('assignedBy', 'username email')
      .sort({ startDate: -1 });
      
      return tasks.map((task: any) => this.mapToEntity(task));
    } catch (error: any) {
      throw new Error(`Failed to find assigned tasks for user: ${error.message}`);
    }
  }

  async findAllGroupedByUser(): Promise<any> {
    try {
      // Get all users
      const users = await UserModel.find({}, 'username email').sort({ username: 1 });
      
      const result = [];
      
      for (const user of users) {
        const userTasks = await TaskModel.find({
          $or: [
            { createdByEmail: user.email },
            { assignedToEmail: user.email }
          ]
        })
        .populate('assignedTo', 'username email')
        .populate('assignedBy', 'username email')
        .sort({ startDate: -1 });

        if (userTasks.length > 0) {
          result.push({
            user: {
              id: user._id,
              username: user.username,
              email: user.email
            },
            tasks: userTasks.map((task: any) => this.mapToEntity(task)),
            taskCount: userTasks.length,
            totalDuration: userTasks.reduce((sum: number, task: any) => sum + (task.totalDuration || 0), 0)
          });
        }
      }
      
      return result;
    } catch (error: any) {
      throw new Error(`Failed to find tasks grouped by user: ${error.message}`);
    }
  }

  async findActive(): Promise<Task[]> {
    try {
      const tasks = await TaskModel.find({
        status: { $in: ['started', 'paused', 'resumed'] }
      })
      .populate('assignedTo', 'username email')
      .populate('assignedBy', 'username email')
      .sort({ startDate: -1 });
      
      return tasks.map((task: any) => this.mapToEntity(task));
    } catch (error: any) {
      throw new Error(`Failed to find active tasks: ${error.message}`);
    }
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Task[]> {
    try {
      const tasks = await TaskModel.find({
        startDate: {
          $gte: startDate,
          $lte: endDate
        }
      })
      .populate('assignedTo', 'username email')
      .populate('assignedBy', 'username email')
      .sort({ startDate: -1 });
      
      return tasks.map((task: any) => this.mapToEntity(task));
    } catch (error: any) {
      throw new Error(`Failed to find tasks by date range: ${error.message}`);
    }
  }

  async create(taskData: Partial<Task>): Promise<Task> {
    try {
      const task = new TaskModel({
        taskId: taskData.taskId,
        taskName: taskData.taskName,
        type: taskData.type,
        status: taskData.status,
        startDate: taskData.startDate,
        endDate: taskData.endDate,
        totalDuration: taskData.totalDuration || 0,
        activities: taskData.activities || [],
        isAssigned: taskData.isAssigned || false,
        assignedTo: taskData.assignedTo,
        assignedToEmail: taskData.assignedToEmail,
        assignedBy: taskData.assignedBy,
        description: taskData.description || '',
        estimatedTime: taskData.estimatedTime,
        dueDate: taskData.dueDate,
        assignedByTelegram: taskData.assignedByTelegram,
        assignedToTelegram: taskData.assignedToTelegram,
        userTelegram: taskData.userTelegram,
        telegramNumber: taskData.telegramNumber,
        isRecurring: taskData.isRecurring || false,
        recurringType: taskData.recurringType,
        recurringStatus: taskData.recurringStatus,
        recurringPattern: taskData.recurringPattern,
        recurringCount: taskData.recurringCount || 0,
        nextRun: taskData.nextRun,
        lastRun: taskData.lastRun,
        recurringInterval: taskData.recurringInterval,
        recurringCron: taskData.recurringCron,
        approvalNeeded: taskData.approvalNeeded,
        isApproved: taskData.isApproved,
        approvedBy: taskData.approvedBy,
        approvedAt: taskData.approvedAt,
        rejectedBy: taskData.rejectedBy,
        rejectedAt: taskData.rejectedAt,
        approvalComments: taskData.approvalComments || ''
      });
      
      const savedTask = await task.save();
      return this.mapToEntity(savedTask);
    } catch (error: any) {
      throw new Error(`Failed to create task: ${error.message}`);
    }
  }

 // Make sure this method exists in your TaskRepository class
async updateTask(taskId: string, updateData: any): Promise<any> {
  try {
    console.log('📝 Updating task:', { taskId, updateData });
    
    const updatedTask = await TaskModel.findOneAndUpdate(
      { taskId },
      {
        $set: {
          ...updateData,
          updatedAt: new Date()
        }
      },
      { 
        new: true,
        runValidators: false
      }
    );

    if (!updatedTask) {
      throw new Error('Task not found');
    }

    console.log('✅ Task updated successfully:', updatedTask.taskId);
    return updatedTask;
  } catch (error) {
    console.error('❌ Error updating task in repository:', error);
    throw error;
  }
}


  async update(taskId: string, updateData: Partial<Task>): Promise<Task | null> {
    try {
      const updatedTask = await TaskModel.findOneAndUpdate(
        { taskId },
        {
          ...updateData,
          ...(updateData.telegramNumber !== undefined && { telegramNumber: updateData.telegramNumber }),
          updatedAt: new Date()
        },
        { new: true, runValidators: false }
      );
      
      if (updatedTask) {
        console.log('✅ Task updated with telegram data:', {
          taskId: updatedTask.taskId,
          telegramNumber: updatedTask.telegramNumber,
          assignedByTelegram: updatedTask.assignedByTelegram,
          assignedToTelegram: updatedTask.assignedToTelegram
        });
      }
      
      return updatedTask;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  async addActivity(taskId: string, activity: any): Promise<Task | null> {
    try {
      const task = await TaskModel.findOneAndUpdate(
        { taskId },
        { $push: { activities: activity } },
        { new: true, runValidators: false }
      )
      .populate('assignedTo', 'username email')
      .populate('assignedBy', 'username email');
      
      return task ? this.mapToEntity(task) : null;
    } catch (error: any) {
      throw new Error(`Failed to add activity to task: ${error.message}`);
    }
  }

  async findAssignedByTaskId(taskId: string): Promise<Task | null> {
    try {
      const task = await TaskModel.findOne({ taskId, isAssigned: true })
        .populate('assignedTo', 'username email')
        .populate('assignedBy', 'username email');
      
      return task ? this.mapToEntity(task) : null;
    } catch (error: any) {
      throw new Error(`Failed to find assigned task by ID: ${error.message}`);
    }
  }

  async findPendingApproval(): Promise<Task[]> {
    try {
      const tasks = await TaskModel.find({
        approvalNeeded: true,
        status: { $in: ['ended', 'completed'] },
        isApproved: { $ne: true }
      })
      .populate('assignedTo', 'username email')
      .populate('assignedBy', 'username email')
      .sort({ endDate: -1 });
      
      return tasks.map((task: any) => this.mapToEntity(task));
    } catch (error: any) {
      throw new Error(`Failed to find tasks pending approval: ${error.message}`);
    }
  }

  async approveTask(taskId: string, approvedBy: string, comments?: string): Promise<Task | null> {
    try {
      const updatedTask = await TaskModel.findOneAndUpdate(
        { taskId },
        {
          $set: {
            isApproved: true,
            approvedBy,
            approvedAt: new Date(),
            approvalComments: comments || '',
            status: 'approved',
            updatedAt: new Date()
          }
        },
        { new: true, runValidators: false }
      );
      
      return updatedTask ? this.mapToEntity(updatedTask) : null;
    } catch (error: any) {
      throw new Error(`Failed to approve task: ${error.message}`);
    }
  }

  async rejectTask(taskId: string, rejectedBy: string, reason?: string): Promise<Task | null> {
    try {
      const updatedTask = await TaskModel.findOneAndUpdate(
        { taskId },
        {
          $set: {
            isApproved: false,
            rejectedBy,
            rejectedAt: new Date(),
            approvalComments: reason || '',
            status: 'rejected',
            updatedAt: new Date()
          }
        },
        { new: true, runValidators: false }
      );
      
      return updatedTask ? this.mapToEntity(updatedTask) : null;
    } catch (error: any) {
      throw new Error(`Failed to reject task: ${error.message}`);
    }
  }

  // Add the delete method using TaskModel
  async deleteTask(taskId: string): Promise<boolean> {
    try {
      const result = await TaskModel.findOneAndDelete({ taskId });
      return !!result;
    } catch (error: any) {
      console.error('Error deleting task:', error);
      throw new Error(`Failed to delete task: ${error.message}`);
    }
  }

  async createTaskMapping(mappingData: {
    taskName: string;
    level: 'L1' | 'L2' | 'L3' | 'L4';
    category?: string;
    description?: string;
    createdBy: string;
  }): Promise<ITaskMapping> {
    const mapping = new TaskMapping(mappingData);
    return await mapping.save();
  }

  async getTaskMappingsByUser(userEmail: string): Promise<ITaskMapping[]> {
    return await TaskMapping.find({ createdBy: userEmail }).sort({ createdAt: -1 });
  }

  async getTaskMappingById(id: string): Promise<ITaskMapping | null> {
    return await TaskMapping.findById(id);
  }

  async updateTaskMapping(id: string, updateData: Partial<ITaskMapping>): Promise<ITaskMapping | null> {
    return await TaskMapping.findByIdAndUpdate(id, updateData, { new: true });
  }

  async deleteTaskMapping(id: string): Promise<boolean> {
    const result = await TaskMapping.findByIdAndDelete(id);
    return !!result;
  }

  async getTaskMappingByNameAndUser(taskName: string, userEmail: string): Promise<ITaskMapping | null> {
    return await TaskMapping.findOne({ 
      taskName: taskName.trim(), 
      createdBy: userEmail 
    });
  }

  async getTasksByUser(userEmail: string): Promise<any[]> {
    try {
      return await TaskModel.find({
        $or: [
          { createdBy: userEmail },
          { userEmail: userEmail },
          { assignedToEmail: userEmail }
        ]
      }).sort({ createdAt: -1 });
    } catch (error) {
      console.error('Error fetching tasks by user:', error);
      throw error;
    }
  }

  async getTaskLevelStatsByUser(userEmail: string): Promise<any> {
    return await TaskMapping.aggregate([
      { $match: { createdBy: userEmail } },
      { $group: { _id: '$level', count: { $sum: 1 } } }
    ]);
  }

   private mapToEntity(taskDoc: any): Task {
    return new Task({
      id: taskDoc._id?.toString(),
      taskId: taskDoc.taskId,
      taskName: taskDoc.taskName,
      type: taskDoc.type,
      status: taskDoc.status,
      startDate: taskDoc.startDate,
      endDate: taskDoc.endDate,
      totalDuration: taskDoc.totalDuration,
      activities: taskDoc.activities,
      isAssigned: taskDoc.isAssigned,
      assignedTo: taskDoc.assignedTo,
      assignedToEmail: taskDoc.assignedToEmail,
      assignedBy: taskDoc.assignedBy,
      description: taskDoc.description,
      estimatedTime: taskDoc.estimatedTime,
      dueDate: taskDoc.dueDate,
      priority: taskDoc.priority,
      createdAt: taskDoc.createdAt,
      updatedAt: taskDoc.updatedAt,
      assignedByTelegram: taskDoc.assignedByTelegram,
      assignedToTelegram: taskDoc.assignedToTelegram,
      userTelegram: taskDoc.userTelegram,
      telegramNumber: taskDoc.telegramNumber,
      isRecurring: taskDoc.isRecurring,
      recurringType: taskDoc.recurringType,
      recurringStatus: taskDoc.recurringStatus,
      recurringPattern: taskDoc.recurringPattern,
      recurringCount: taskDoc.recurringCount,
      nextRun: taskDoc.nextRun,
      lastRun: taskDoc.lastRun,
      recurringInterval: taskDoc.recurringInterval,
      recurringCron: taskDoc.recurringCron,
      recurringOptions: taskDoc.recurringOptions,
      userEmail: taskDoc.userEmail,
      approvalNeeded: taskDoc.approvalNeeded,
      isApproved: taskDoc.isApproved,
      approvedBy: taskDoc.approvedBy,
      approvedAt: taskDoc.approvedAt,
      rejectedBy: taskDoc.rejectedBy,
      rejectedAt: taskDoc.rejectedAt,
      approvalComments: taskDoc.approvalComments
    });
  }
}

