import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import Task, { ITask } from "../models/Task";
import User from "../models/User";
import TaskMapping, { ITaskMapping } from '../models/TaskMapping';
import * as XLSX from 'xlsx';
import { TaskService } from '../services/task.service';
export class TaskController {
    private taskService: TaskService;

  constructor() {
    this.taskService = new TaskService(); // Add this line
  }
  // taskService: any;
  private async getUserTelegram(email: string): Promise<string | undefined> {
    try {
      const user = await User.findOne({ email });
      console.log(`🔍 Getting telegram for ${email}:`, {
        found: !!user,
        telegramNumber: user?.telegramNumber,
        telegram: user?.telegram,
        phone: user?.phone,
      });

      return user?.telegramNumber || user?.telegram || user?.phone;
    } catch (error) {
      console.warn(`Could not fetch telegram for ${email}:`, error);
      return undefined;
    }
  }

  // Get tasks for current user only
  async getUserTasks(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userEmail = req.user?.email;

      if (!userEmail) {
        res.status(401).json({
          success: false,
          message: "User email not found",
        });
        return;
      }

      console.log(`🔍 Loading tasks for user: ${userEmail}`);

      // Get ALL tasks related to this user - NO ROLE RESTRICTIONS
      const tasks = await Task.find({
        $or: [
          { createdBy: userEmail },
          { userEmail: userEmail },
          { assignedToEmail: userEmail },
        ],
      }).sort({ createdAt: -1 });

      console.log(`📊 Found ${tasks.length} tasks for user: ${userEmail}`);
      console.log(`📋 Task breakdown:`, {
        createdByMe: tasks.filter((t) => t.createdBy === userEmail).length,
        assignedToMe: tasks.filter((t) => t.assignedToEmail === userEmail)
          .length,
        assignedByMe: tasks.filter((t) => t.assignedBy?.email === userEmail)
          .length,
        ownedByMe: tasks.filter((t) => t.userEmail === userEmail).length,
      });

      res.json({
        success: true,
        data: tasks,
        message: `Found ${tasks.length} tasks for user`,
      });
    } catch (error) {
      console.error("Error fetching user tasks:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch user tasks",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async getAdminTasks(req: AuthRequest, res: Response): Promise<void> {
    try {
      // Check if user is admin
      if (!req.user || req.user.role !== "admin") {
        res.status(403).json({
          success: false,
          message: "Admin access required",
        });
        return;
      }

      console.log(`🔍 Admin loading all tasks`);

      const tasks = await Task.find({}).sort({ createdAt: -1 });

      console.log(`📊 Found ${tasks.length} total tasks for admin view`);

      res.json({
        success: true,
        data: tasks,
        message: `Found ${tasks.length} total tasks`,
      });
    } catch (error) {
      console.error("Error fetching admin tasks:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch admin tasks",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // Update existing getAllTasks to be user-aware
  async getAllTasks(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userEmail = req.user?.email;
      const isAdmin = req.user?.role === "admin";

      if (!userEmail) {
        res.status(401).json({
          success: false,
          message: "User authentication required",
        });
        return;
      }

      let tasks;
      if (isAdmin) {
        // Admin gets all tasks
        tasks = await Task.find({})
          .populate("userId", "username email")
          .sort({ createdAt: -1 });
        console.log(`📊 Admin loaded ${tasks.length} total tasks`);
      } else {
        // Regular user gets only their tasks
        tasks = await Task.find({
          $or: [
            { createdBy: userEmail },
            { userEmail: userEmail },
            { assignedToEmail: userEmail },
          ],
        })
          .populate("userId", "username email")
          .sort({ createdAt: -1 });
        console.log(`📊 User ${userEmail} loaded ${tasks.length} tasks`);
      }

      res.json({
        success: true,
        data: tasks,
        message: `Found ${tasks.length} tasks`,
        userRole: isAdmin ? "admin" : "user",
      });
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch tasks",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // Update getAssignedTasks to be user-aware
  async getAssignedTasks(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userEmail = req.user?.email;
      const isAdmin = req.user?.role === "admin";

      if (!userEmail) {
        res.status(401).json({
          success: false,
          message: "User authentication required",
        });
        return;
      }

      let tasks;
      if (isAdmin) {
        // Admin sees all assigned tasks
        tasks = await Task.find({ isAssigned: true }).sort({ createdAt: -1 });
      } else {
        // Regular user sees only tasks assigned to them
        tasks = await Task.find({
          isAssigned: true,
          assignedToEmail: userEmail,
        }).sort({ createdAt: -1 });
      }
      console.log(
        `📊 Found ${tasks.length} assigned tasks for ${
          isAdmin ? "admin" : userEmail
        }`
      );

      res.json({
        success: true,
        data: tasks,
        message: `Found ${tasks.length} assigned tasks`,
      });
    } catch (error) {
      console.error("Error fetching assigned tasks:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch assigned tasks",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // Update getActiveTasks to be user-aware
  async getActiveTasks(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userEmail = req.user?.email;
      const isAdmin = req.user?.role === "admin";

      if (!userEmail) {
        res.status(401).json({
          success: false,
          message: "User authentication required",
        });
        return;
      }

      let query: any = {
        status: { $in: ["started", "paused", "resumed"] },
      };

      if (!isAdmin) {
        // Regular user sees only their active tasks
        query.$or = [
          { createdBy: userEmail },
          { userEmail: userEmail },
          { assignedToEmail: userEmail },
        ];
      }

      const tasks = await Task.find(query).sort({ createdAt: -1 });

      console.log(
        `🔄 Found ${tasks.length} active tasks for ${userEmail} (Admin: ${isAdmin})`
      );

      res.json({
        success: true,
        data: tasks,
        message: `Found ${tasks.length} active tasks`,
      });
    } catch (error) {
      console.error("Error fetching active tasks:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch active tasks",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async updateTask(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { taskId } = req.params;
      const updateData = req.body;
      const userEmail = req.user?.email;

      console.log("📝 TaskController.updateTask:", {
        taskId,
        userEmail,
        updateData,
      });

      if (!userEmail) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      // Find task
      const task = await Task.findOne({ taskId });

      if (!task) {
        res.status(404).json({
          success: false,
          message: "Task not found",
        });
        return;
      }

      // Check permissions
      const canUpdate =
        task.userEmail === userEmail ||
        task.assignedToEmail === userEmail ||
        task.createdBy === userEmail;

      if (!canUpdate) {
        res.status(403).json({
          success: false,
          message: "Permission denied",
        });
        return;
      }

      // Prepare update data - handle nested objects properly
      const updateFields: any = {};

      // Handle each field individually to avoid casting issues
      Object.keys(updateData).forEach((key) => {
        if (key === "recurringPattern" && typeof updateData[key] === "object") {
          // Keep recurringPattern as object
          updateFields[key] = updateData[key];
        } else if (
          key === "endConditions" &&
          typeof updateData[key] === "object"
        ) {
          // Keep endConditions as object
          updateFields[key] = updateData[key];
        } else if (
          key === "recurrenceSettings" &&
          typeof updateData[key] === "object"
        ) {
          // Keep recurrenceSettings as object
          updateFields[key] = updateData[key];
        } else {
          updateFields[key] = updateData[key];
        }
      });

      updateFields.updatedAt = new Date();

      // Update task
      const updatedTask = await Task.findOneAndUpdate(
        { taskId },
        { $set: updateFields },
        {
          new: true,
          runValidators: false, // Disable validators to avoid type conflicts
        }
      );

      console.log("✅ Task updated successfully");

      res.status(200).json({
        success: true,
        message: "Task updated successfully",
        data: updatedTask,
      });
    } catch (error: any) {
      console.error("❌ TaskController.updateTask error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  async updateRecurringSettings(
    req: AuthRequest,
    res: Response
  ): Promise<void> {
    try {
      const { taskId } = req.params;
      const recurringData = req.body;
      const userEmail = req.user?.email;

      console.log("🔄 TaskController.updateRecurringSettings:", {
        taskId,
        userEmail,
        recurringData,
      });

      if (!userEmail) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      // Find and update task
      const task = await Task.findOne({ taskId });

      if (!task) {
        res.status(404).json({
          success: false,
          message: "Task not found",
        });
        return;
      }

      // Check permissions
      const canUpdate =
        task.userEmail === userEmail ||
        task.assignedToEmail === userEmail ||
        task.createdBy === userEmail;

      if (!canUpdate) {
        res.status(403).json({
          success: false,
          message: "Permission denied",
        });
        return;
      }

      // Update with recurring settings
      const updatedTask = await Task.findOneAndUpdate(
        { taskId },
        {
          $set: {
            ...recurringData,
            updatedAt: new Date(),
          },
        },
        { new: true }
      );

      res.status(200).json({
        success: true,
        message: "Recurring settings updated successfully",
        data: updatedTask,
      });
    } catch (error: any) {
      console.error("❌ TaskController.updateRecurringSettings error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update recurring settings",
        error: error.message,
      });
    }
  }

  // Add user context to task creation
  async startTask(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userEmail = req.user?.email;
      const userId = req.user?._id;
      const userTelegram = await this.getUserTelegram(userEmail!);
      if (!userEmail) {
        res.status(401).json({
          success: false,
          message: "User authentication required",
        });
        return;
      }

      console.log("Starting task with data:", req.body);

      const taskData = {
        ...req.body,
        status: "started",
        totalDuration: 0,
        createdBy: userEmail,
        userEmail: userEmail,
        userId: userId?.toString(),
        isAssigned: false,
        username: req.user?.username,
        userTelegram,
        telegramNumber: req.body.telegramNumber || userTelegram,
        isRecurring: req.body.isRecurring || false,
        recurringType: req.body.recurringType,
        recurringStatus: req.body.recurringStatus,
        recurringPattern: req.body.recurringPattern,
        recurringCount: req.body.recurringCount || 0,
        nextRun: req.body.nextRun,
        lastRun: req.body.lastRun,
        recurringInterval: req.body.recurringInterval,
        recurringCron: req.body.recurringCron,
        activities: [
          {
            action: "started" as const,
            timestamp: new Date(),
            duration: 0,
          },
        ],
      };

      if (!taskData.taskId || !taskData.taskName || !taskData.type) {
        res.status(400).json({
          success: false,
          message:
            "Missing required fields: taskId, taskName, and type are required",
          received: taskData,
        });
        return;
      }

      if (!["task", "meeting"].includes(taskData.type)) {
        res.status(400).json({
          success: false,
          message: 'Invalid type. Must be either "task" or "meeting"',
        });
        return;
      }

      const newTask = new Task(taskData);
      await newTask.save();

      console.log(`✅ Task created by user: ${userEmail}`);

      res.status(201).json({
        success: true,
        message: "Task started successfully",
        data: newTask,
      });
    } catch (error: any) {
      console.error("Error starting task:", error);

      if (error.message.includes("duplicate key")) {
        res.status(400).json({
          success: false,
          message: "Task with this ID already exists",
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: "Failed to start task",
        error: error.message,
      });
    }
  }

  // Pause task with user permission check
  async pauseTask(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { taskId } = req.params;
      const { elapsedTime, timestamp } = req.body;
      const userEmail = req.user?.email;
      const isAdmin = req.user?.role === "admin";

      console.log(`Pausing task ${taskId} with elapsed time:`, elapsedTime);

      // Find task and verify ownership
      const task = await Task.findOne({ taskId });

      if (!task) {
        res.status(404).json({
          success: false,
          message: "Task not found",
        });
        return;
      }

      // Check if user has permission to modify this task
      const hasPermission =
        isAdmin ||
        task.createdBy === userEmail ||
        task.userEmail === userEmail ||
        task.assignedToEmail === userEmail;

      if (!hasPermission) {
        res.status(403).json({
          success: false,
          message: "Permission denied: You can only modify your own tasks",
        });
        return;
      }

      // Update task
      task.status = "paused";
      task.totalDuration = elapsedTime || 0;
      task.activities.push({
        action: "paused",
        timestamp: timestamp ? new Date(timestamp) : new Date(),
        duration: elapsedTime || 0,
      });

      await task.save();

      res.json({
        success: true,
        message: "Task paused successfully",
        data: task,
      });
    } catch (error: any) {
      console.error("Error pausing task:", error);
      res.status(500).json({
        success: false,
        message: "Failed to pause task",
        error: error.message,
      });
    }
  }

  // Resume task with user permission check
  async resumeTask(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { taskId } = req.params;
      const { elapsedTime, timestamp } = req.body;
      const userEmail = req.user?.email;
      const isAdmin = req.user?.role === "admin";

      console.log(`Resuming task ${taskId} with elapsed time:`, elapsedTime);

      const task = await Task.findOne({ taskId });

      if (!task) {
        res.status(404).json({
          success: false,
          message: "Task not found",
        });
        return;
      }

      // Check permissions
      const hasPermission =
        isAdmin ||
        task.createdBy === userEmail ||
        task.userEmail === userEmail ||
        task.assignedToEmail === userEmail;

      if (!hasPermission) {
        res.status(403).json({
          success: false,
          message: "Permission denied: You can only modify your own tasks",
        });
        return;
      }

      task.status = "resumed";
      task.totalDuration = elapsedTime || 0;
      task.activities.push({
        action: "resumed",
        timestamp: timestamp ? new Date(timestamp) : new Date(),
        duration: elapsedTime || 0,
      });

      await task.save();

      res.json({
        success: true,
        data: task,
        message: "Task resumed successfully",
      });
    } catch (error) {
      console.error("Error resuming task:", error);
      res.status(500).json({
        success: false,
        message: "Failed to resume task",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // End task with user permission check
async endTask(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { taskId } = req.params;
    const { elapsedTime, endDate, timestamp, description } = req.body; // Add description
    const userEmail = req.user?.email;
    const isAdmin = req.user?.role === "admin";

    console.log(`Ending task ${taskId} with elapsed time:`, elapsedTime);
    console.log(`Task description:`, description); // Log description

    const task = await Task.findOne({ taskId });

    if (!task) {
      res.status(404).json({
        success: false,
        message: "Task not found",
      });
      return;
    }

    // Check permissions
    const hasPermission =
      isAdmin ||
      task.createdBy === userEmail ||
      task.userEmail === userEmail ||
      task.assignedToEmail === userEmail;

    if (!hasPermission) {
      res.status(403).json({
        success: false,
        message: "Permission denied: You can only modify your own tasks",
      });
      return;
    }

    task.status = "ended";
    task.endDate = endDate || new Date().toISOString();
    
    // Only update description if it's provided and not empty
    if (description && description.trim().length > 0) {
      task.description = description.trim();
    }

    task.activities.push({
      action: "ended",
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      duration: elapsedTime || 0,
    });

    // Calculate total duration
    const totalDuration = task.activities.reduce(
      (total: any, activity: { duration: any }) => {
        return total + (activity.duration || 0);
      },
      0
    );
    task.totalDuration = totalDuration;

    await task.save();

    console.log(`✅ Task ended successfully with description: "${task.description}"`);

    res.json({
      success: true,
      data: task,
      message: "Task ended successfully",
    });
  } catch (error) {
    console.error("Error ending task:", error);
    res.status(500).json({
      success: false,
      message: "Failed to end task",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
// Get task mappings for user
async getTaskMappings(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { userEmail } = req.params;
    const requestingUser = req.user?.email;

    // Users can only access their own mappings unless they're admin
    if (requestingUser !== userEmail && req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Access denied'
      });
      return;
    }

    const mappings = await TaskMapping.find({ createdBy: userEmail })
      .sort({ createdAt: -1 });

    console.log(`📊 Found ${mappings.length} task mappings for ${userEmail}`);

    res.json({
      success: true,
      data: mappings,
      message: `Found ${mappings.length} task mappings`
    });
  } catch (error) {
    console.error('Error fetching task mappings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch task mappings',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Save task mapping
async saveTaskMapping(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { taskName, level, category, description } = req.body;
    const userEmail = req.user?.email;

    if (!userEmail) {
      res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
      return;
    }

    if (!taskName || !level) {
      res.status(400).json({
        success: false,
        message: 'Task name and level are required'
      });
      return;
    }

    // Check if mapping already exists
    const existingMapping = await TaskMapping.findOne({
      taskName: taskName.trim(),
      createdBy: userEmail
    });

    if (existingMapping) {
      res.status(400).json({
        success: false,
        message: 'Task mapping already exists for this task'
      });
      return;
    }

    const mapping = new TaskMapping({
      taskName: taskName.trim(),
      level,
      category: category?.trim(),
      description: description?.trim(),
      createdBy: userEmail
    });

    await mapping.save();

    console.log(`✅ Task mapping created: ${taskName} -> ${level} by ${userEmail}`);

    res.status(201).json({
      success: true,
      data: mapping,
      message: 'Task mapping created successfully'
    });
  } catch (error) {
    console.error('Error saving task mapping:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save task mapping',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Update task mapping
async updateTaskMapping(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { taskName, level, category, description } = req.body;
    const userEmail = req.user?.email;

    if (!userEmail) {
      res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
      return;
    }

    const mapping = await TaskMapping.findById(id);

    if (!mapping) {
      res.status(404).json({
        success: false,
        message: 'Task mapping not found'
      });
      return;
    }

    // Check ownership
    if (mapping.createdBy !== userEmail && req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Access denied'
      });
      return;
    }

    // Update fields
    if (taskName) mapping.taskName = taskName.trim();
    if (level) mapping.level = level;
    if (category !== undefined) mapping.category = category?.trim();
    if (description !== undefined) mapping.description = description?.trim();

    await mapping.save();

    console.log(`✅ Task mapping updated: ${mapping.taskName} -> ${mapping.level} by ${userEmail}`);

    res.json({
      success: true,
      data: mapping,
      message: 'Task mapping updated successfully'
    });
  } catch (error) {
    console.error('Error updating task mapping:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update task mapping',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Delete task mapping
async deleteTaskMapping(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userEmail = req.user?.email;

    if (!userEmail) {
      res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
      return;
    }

    const mapping = await TaskMapping.findById(id);

    if (!mapping) {
      res.status(404).json({
        success: false,
        message: 'Task mapping not found'
      });
      return;
    }

    // Check ownership
    if (mapping.createdBy !== userEmail && req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Access denied'
      });
      return;
    }

    await TaskMapping.findByIdAndDelete(id);

    console.log(`✅ Task mapping deleted: ${mapping.taskName} by ${userEmail}`);

    res.json({
      success: true,
      message: 'Task mapping deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting task mapping:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete task mapping',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Get task level statistics
async getTaskLevelStats(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { userEmail } = req.params;
    const requestingUser = req.user?.email;

    // Users can only access their own stats unless they're admin
    if (requestingUser !== userEmail && req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Access denied'
      });
      return;
    }

    // Get mapping statistics
    const mappingStats = await TaskMapping.aggregate([
      { $match: { createdBy: userEmail } },
      { $group: { _id: '$level', count: { $sum: 1 } } }
    ]);

    // Get actual task statistics based on mappings
    const mappings = await TaskMapping.find({ createdBy: userEmail });
    const taskNameToLevel = mappings.reduce((acc, mapping) => {
      acc[mapping.taskName.toLowerCase()] = mapping.level;
      return acc;
    }, {} as Record<string, string>);

    // Get user's tasks and categorize them
    const userTasks = await Task.find({
      $or: [
        { createdBy: userEmail },
        { userEmail: userEmail },
        { assignedToEmail: userEmail }
      ]
    });

    const taskLevelCounts = { L1: 0, L2: 0, L3: 0, L4: 0, unmapped: 0 };
    const taskLevelDuration = { L1: 0, L2: 0, L3: 0, L4: 0, unmapped: 0 };

    userTasks.forEach(task => {
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

    const stats = {
      mappingCounts: {
        L1: mappingStats.find(s => s._id === 'L1')?.count || 0,
        L2: mappingStats.find(s => s._id === 'L2')?.count || 0,
        L3: mappingStats.find(s => s._id === 'L3')?.count || 0,
        L4: mappingStats.find(s => s._id === 'L4')?.count || 0,
        total: mappings.length
      },
      taskCounts: taskLevelCounts,
      taskDurations: taskLevelDuration,
      totalTasks: userTasks.length,
      totalDuration: userTasks.reduce((sum, task) => sum + (task.totalDuration || 0), 0)
    };

    console.log(`📊 Generated task level stats for ${userEmail}:`, stats);

    res.json({
      success: true,
      data: stats,
      message: 'Task level statistics retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching task level stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch task level statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Export task level report
async exportTaskLevelReport(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { userEmail } = req.params;
    const requestingUser = req.user?.email;

    // Users can only export their own reports unless they're admin
    if (requestingUser !== userEmail && req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Access denied'
      });
      return;
    }

    // Get mappings and tasks
    const mappings = await TaskMapping.find({ createdBy: userEmail });
    const taskNameToLevel = mappings.reduce((acc, mapping) => {
      acc[mapping.taskName.toLowerCase()] = {
        level: mapping.level,
        category: mapping.category,
        description: mapping.description
      };
      return acc;
    }, {} as Record<string, any>);

    // Get user's tasks
    const userTasks = await Task.find({
      $or: [
        { createdBy: userEmail },
        { userEmail: userEmail },
        { assignedToEmail: userEmail }
      ]
    }).sort({ startDate: -1 });

    // Prepare data for Excel
    const reportData = userTasks.map(task => {
      const mapping = taskNameToLevel[task.taskName.toLowerCase()];
      const duration = task.totalDuration || 0;
      const hours = Math.floor(duration / 3600);
      const minutes = Math.floor((duration % 3600) / 60);
      const seconds = duration % 60;

      return {
        'Task Name': task.taskName,
        'Task Type': task.type,
        'Level': mapping?.level || 'Unmapped',
        'Category': mapping?.category || '-',
        'Status': task.status,
        'Start Date': task.startDate ? new Date(task.startDate).toLocaleDateString() : '-',
        'End Date': task.endDate ? new Date(task.endDate).toLocaleDateString() : '-',
        'Duration (HH:MM:SS)': `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
        'Duration (Seconds)': duration,
        'Description': task.description || '-',
        'Assigned By': task.assignedByEmail || task.createdBy || '-',
        'Assigned To': task.assignedToEmail || task.userEmail || '-'
      };
    });

    // Create summary data
    const summaryData = [
      { 'Level': 'L1', 'Task Count': 0, 'Total Duration (Hours)': 0 },
      { 'Level': 'L2', 'Task Count': 0, 'Total Duration (Hours)': 0 },
      { 'Level': 'L3', 'Task Count': 0, 'Total Duration (Hours)': 0 },
      { 'Level': 'L4', 'Task Count': 0, 'Total Duration (Hours)': 0 },
      { 'Level': 'Unmapped', 'Task Count': 0, 'Total Duration (Hours)': 0 }
    ];

    reportData.forEach(task => {
      const level = task.Level;
      const duration = task['Duration (Seconds)'];
      const summaryItem = summaryData.find(s => s.Level === level);
      if (summaryItem) {
        summaryItem['Task Count']++;
        summaryItem['Total Duration (Hours)'] += Math.round((duration / 3600) * 100) / 100;
      }
    });

    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Add summary sheet
    const summaryWs = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
    
    // Add detailed data sheet
    const detailWs = XLSX.utils.json_to_sheet(reportData);
    XLSX.utils.book_append_sheet(wb, detailWs, 'Task Details');
    
    // Add mappings sheet
    const mappingData = mappings.map(mapping => ({
      'Task Name': mapping.taskName,
      'Level': mapping.level,
      'Category': mapping.category || '-',
      'Description': mapping.description || '-',
      'Created Date': new Date(mapping.createdAt).toLocaleDateString()
    }));
    const mappingWs = XLSX.utils.json_to_sheet(mappingData);
    XLSX.utils.book_append_sheet(wb, mappingWs, 'Task Mappings');

    // Generate Excel buffer
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });

    // Set response headers
    const fileName = `task-level-report-${userEmail.split('@')[0]}-${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    console.log(`📊 Generated Excel report for ${userEmail}: ${reportData.length} tasks`);

    res.send(excelBuffer);
  } catch (error) {
    console.error('Error exporting task level report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export task level report',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}


  // Update the assignTask method as well
  // async assignTask(req: AuthRequest, res: Response): Promise<void> {
  //   try {
  //     // Allow all authenticated users, not just admins
  //     if (!req.user) {
  //       res.status(401).json({
  //         success: false,
  //         message: 'Authentication required'
  //       });
  //       return;
  //     }

  //     const { taskName, type, assignedToEmail, description, estimatedTime, dueDate } = req.body;
  //     const assignedBy = req.user;

  //     console.log('🎯 === ASSIGN ROUTE HIT ===');
  //     console.log('📝 Request body:', JSON.stringify(req.body, null, 2));
  //     console.log('👤 Assigned by user role:', assignedBy.role);

  //     // Validation
  //     if (!taskName || !type || !assignedToEmail) {
  //       console.log('❌ Missing required fields');
  //       res.status(400).json({
  //         success: false,
  //         message: 'Task name, type, and assigned user email are required'
  //       });
  //       return;
  //     }

  //     // Verify assigned user exists
  //     const assignedUser = await User.findOne({ email: assignedToEmail });
  //     if (!assignedUser) {
  //       res.status(400).json({
  //         success: false,
  //         message: 'Assigned user not found'
  //       });
  //       return;
  //     }

  //     const taskData = {
  //       taskId: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  //       taskName,
  //       type: type || 'task',
  //       description,
  //       estimatedTime,
  //       dueDate,
  //       status: 'assigned' as const,
  //       isAssigned: true,

  //       // Enhanced assignment tracking
  //       assignedToEmail: assignedToEmail,
  //       assignedToName: assignedUser.username || assignedToEmail.split('@')[0],
  //       assignedBy: {
  //         userId: assignedBy._id.toString(),
  //         username: assignedBy.username,
  //         email: assignedBy.email
  //       },
  //       assignedByEmail: assignedBy.email, // ADD THIS FIELD

  //       createdBy: assignedBy.email,
  //       userEmail: assignedToEmail,
  //       username: assignedUser.username || assignedToEmail.split('@')[0],

  //       startDate: new Date().toISOString(),
  //       createdAt: new Date(),
  //       assignedAt: new Date(),
  //       totalDuration: 0,
  //       activities: [{
  //         action: 'assigned' as const,
  //         timestamp: new Date(),
  //         duration: 0,
  //         assignedBy: assignedBy.email,
  //         assignedTo: assignedToEmail
  //       }]
  //     };

  //     const task = new Task(taskData);
  //     await task.save();

  //     console.log(`✅ Task assigned by ${assignedBy.role} ${assignedBy.email} to ${assignedToEmail}`);
  //     console.log(`📋 Task data saved:`, { estimatedTime, dueDate, assignedByEmail: assignedBy.email });

  //     res.json({
  //       success: true,
  //       data: task,
  //       message: 'Task assigned successfully'
  //     });
  //   } catch (error) {
  //     console.error('Error assigning task:', error);
  //     res.status(500).json({
  //       success: false,
  //       message: 'Failed to assign task',
  //       error: error instanceof Error ? error.message : 'Unknown error'
  //     });
  //   }
  // }

  // Start assigned task
  async startAssignedTask(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { taskId } = req.params;
      const userEmail = req.user?.email;

      const task = await Task.findOne({ taskId });

      if (!task) {
        res.status(404).json({
          success: false,
          message: "Task not found",
        });
        return;
      }

      // Check if task is assigned to this user
      if (!task.isAssigned || task.assignedToEmail !== userEmail) {
        res.status(403).json({
          success: false,
          message: "This task is not assigned to you",
        });
        return;
      }

      task.status = "started";
      task.activities.push({
        action: "started",
        timestamp: new Date(),
        duration: 0,
      });

      await task.save();

      res.json({
        success: true,
        data: task,
        message: "Assigned task started successfully",
      });
    } catch (error) {
      console.error("Error starting assigned task:", error);
      res.status(500).json({
        success: false,
        message: "Failed to start assigned task",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // Debug tasks (admin only)
  async debugTasks(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== "admin") {
        res.status(403).json({
          success: false,
          message: "Admin access required",
        });
        return;
      }

      const tasks = await Task.find({}).limit(10);

      res.json({
        success: true,
        data: tasks,
        message: "Debug data retrieved",
        totalCount: await Task.countDocuments(),
      });
    } catch (error) {
      console.error("Error in debug tasks:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve debug data",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // Get task by ID with permission check
  async getTaskById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { taskId } = req.params;
      const userEmail = req.user?.email;
      const isAdmin = req.user?.role === "admin";

      const task = await Task.findOne({ taskId });

      if (!task) {
        res.status(404).json({
          success: false,
          message: "Task not found",
        });
        return;
      }

      // Check permissions
      const hasPermission =
        isAdmin ||
        task.createdBy === userEmail ||
        task.userEmail === userEmail ||
        task.assignedToEmail === userEmail;

      if (!hasPermission) {
        res.status(403).json({
          success: false,
          message: "Permission denied: You can only view your own tasks",
        });
        return;
      }

      res.json({
        success: true,
        data: task,
        message: "Task retrieved successfully",
      });
    } catch (error) {
      console.error("Error fetching task by ID:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch task",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // Get tasks by date range with user filtering
  async getTasksByDateRange(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.query;
      const userEmail = req.user?.email;
      const isAdmin = req.user?.role === "admin";

      if (!startDate || !endDate) {
        res.status(400).json({
          success: false,
          message: "Start date and end date are required",
        });
        return;
      }

      let query: any = {
        createdAt: {
          $gte: new Date(startDate as string),
          $lte: new Date(endDate as string),
        },
      };

      if (!isAdmin) {
        query.$or = [
          { createdBy: userEmail },
          { userEmail: userEmail },
          { assignedToEmail: userEmail },
        ];
      }

      const tasks = await Task.find(query).sort({ createdAt: -1 });

      res.json({
        success: true,
        data: tasks,
        message: `Found ${tasks.length} tasks in date range`,
        dateRange: { startDate, endDate },
        userRole: isAdmin ? "admin" : "user",
      });
    } catch (error) {
      console.error("Error fetching tasks by date range:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch tasks by date range",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // Create task (legacy method)
  async createTask(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userEmail = req.user?.email;
      const userId = req.user?._id;

      if (!userEmail) {
        res.status(401).json({
          success: false,
          message: "User authentication required",
        });
        return;
      }

      const taskData = {
        ...req.body,
        createdBy: userEmail,
        userEmail: userEmail,
        username: req.user?.username,
        userId: userId?.toString(),
        isAssigned: false,
        taskId:
          req.body.taskId ||
          `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };

      const task = new Task(taskData);
      await task.save();

      console.log(`✅ Task created by user: ${userEmail}`);

      res.json({
        success: true,
        data: task,
        message: "Task created successfully",
      });
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create task",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

 async assignTask(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
        });
        return;
      }

      const {
        taskName,
        type,
        assignedToEmail,
        description,
        estimatedTime,
        dueDate,
        priority,
        status,
        isRecurring,
        recurringOptions,
        approvalNeeded, // ✅ Extract approvalNeeded from request
      } = req.body;

      const assignedBy = req.user;

      console.log("📝 Creating task assignment:", {
        taskName,
        assignedBy: assignedBy.email,
        assignedTo: assignedToEmail,
        isRecurring,
        approvalNeeded, // ✅ Log approval status
      });

      // ✅ Fetch telegram numbers
      const [assignedByTelegram, assignedToTelegram] = await Promise.all([
        this.getUserTelegram(assignedBy.email),
        this.getUserTelegram(assignedToEmail),
      ]);

      // Validation
      if (!taskName || !type || !assignedToEmail) {
        res.status(400).json({
          success: false,
          message: "Task name, type, and assigned user email are required",
        });
        return;
      }

      // Verify assigned user exists
      const assignedUser = await User.findOne({ email: assignedToEmail });
      if (!assignedUser) {
        res.status(400).json({
          success: false,
          message: "Assigned user not found",
        });
        return;
      }

      // Process recurring options
      let processedRecurringOptions = null;
      if (isRecurring && recurringOptions) {
        processedRecurringOptions = {
          ...recurringOptions,
          endDate: recurringOptions.endDate
            ? typeof recurringOptions.endDate === "string"
              ? recurringOptions.endDate
              : new Date(recurringOptions.endDate).toISOString()
            : null,
        };
      }

      // ✅ Prepare comprehensive task data for service
      const taskAssignmentData = {
        taskName,
        type: type || "task",
        assignedToEmail,
        description,
        estimatedTime,
        dueDate,
        priority: priority || "medium",
        status: status || "assigned",
        
        // ✅ CRITICAL: Include approval fields
        approvalNeeded: approvalNeeded || false,
        
        // Telegram data
        assignedByTelegram: assignedByTelegram || "",
        assignedToTelegram: assignedToTelegram || "",
        telegramNumber: assignedByTelegram || assignedToTelegram || "",
        
        // Assignment tracking
        assignedToName: assignedUser.username || assignedToEmail.split("@")[0],
        assignedBy: {
          userId: assignedBy._id.toString(),
          username: assignedBy.username,
          email: assignedBy.email,
          telegramNumber: assignedByTelegram || "",
        },
        assignedByEmail: assignedBy.email,
        createdBy: assignedBy.email,
        userEmail: assignedToEmail,
        username: assignedUser.username || assignedToEmail.split("@")[0],
        
        // Recurring fields
        isRecurring: isRecurring || false,
        recurringOptions: processedRecurringOptions,
        recurringStatus: isRecurring ? "active" : undefined,
        recurringType: isRecurring ? recurringOptions?.repeatType || "schedule" : undefined,
        recurringCount: isRecurring ? recurringOptions?.repeatCount || 0 : 0,
      };

      // ✅ Use TaskService instead of direct model creation
      const result = await this.taskService.assignTask(taskAssignmentData);

      if (result.success) {
        console.log(`✅ Task assigned successfully:`, {
          taskId: result.data?.taskId,
          taskName: result.data?.taskName,
          approvalNeeded: result.data?.approvalNeeded, // ✅ Log approval status
          assignedByTelegram: assignedByTelegram || "None",
          assignedToTelegram: assignedToTelegram || "None",
        });

        res.json({
          success: true,
          data: result.data,
          message: `${isRecurring ? "Recurring " : ""}Task assigned successfully`,
          telegramInfo: {
            assignedByTelegram: assignedByTelegram || null,
            assignedToTelegram: assignedToTelegram || null,
            telegramIncluded: !!(assignedByTelegram || assignedToTelegram),
          },
        });
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Error assigning task:", error);
      res.status(500).json({
        success: false,
        message: "Failed to assign task",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
  // ✅ Update createTaskAssignment method similarly
  async createTaskAssignment(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userEmail = req.user?.email;
      const userId = req.user?._id;

      if (!userEmail) {
        res.status(401).json({
          success: false,
          message: "User authentication required",
        });
        return;
      }

      const {
        taskName,
        type,
        assignedToEmail,
        description,
        estimatedTime,
        dueDate,
        priority,
        status,
        isRecurring,
        recurringOptions,
          approvalNeeded, 
      } = req.body;

      console.log("📝 Creating task assignment:", {
        taskName,
        assignedBy: userEmail,
        assignedTo: assignedToEmail,
        isRecurring,
          approvalNeeded, 
      });

      // Validation
      if (!taskName || !type || !assignedToEmail) {
        res.status(400).json({
          success: false,
          message: "Task name, type, and assigned user email are required",
        });
        return;
      }

      // Verify assigned user exists
      const assignedUser = await User.findOne({ email: assignedToEmail });
      if (!assignedUser) {
        res.status(400).json({
          success: false,
          message: "Assigned user not found",
        });
        return;
      }

      // ✅ Automatically fetch telegram numbers for both users
      console.log("🔍 Fetching telegram numbers for task assignment...");
      const [assignedByTelegram, assignedToTelegram] = await Promise.all([
        this.getUserTelegram(userEmail),
        this.getUserTelegram(assignedToEmail),
      ]);

      console.log("📱 Telegram numbers found:", {
        assignedBy: userEmail,
        assignedByTelegram: assignedByTelegram || "Not found",
        assignedTo: assignedToEmail,
        assignedToTelegram: assignedToTelegram || "Not found",
      });

      // Process recurring options
      let processedRecurringOptions = null;
      if (isRecurring && recurringOptions) {
        processedRecurringOptions = {
          ...recurringOptions,
          endDate: recurringOptions.endDate
            ? typeof recurringOptions.endDate === "string"
              ? recurringOptions.endDate
              : new Date(recurringOptions.endDate).toISOString()
            : null,
        };
      }

      const taskData = {
        taskId: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        taskName,
        type: type || "task",
        description,
        estimatedTime,
        dueDate,
        priority: priority || "medium",
        status: status || "assigned",
        isAssigned: true,
 approvalNeeded: approvalNeeded || false,
      isApproved: false,
      approvalComments: '',
        // ✅ Automatically include telegram numbers in payload
        assignedByTelegram: assignedByTelegram || "",
        assignedToTelegram: assignedToTelegram || "",
        telegramNumber: assignedByTelegram || assignedToTelegram || "", // Primary contact

        // Assignment tracking
        assignedToEmail: assignedToEmail,
        assignedToName: assignedUser.username || assignedToEmail.split("@")[0],
        assignedBy: {
          userId: userId?.toString(),
          username: req.user?.username || userEmail.split("@")[0],
          email: userEmail,
          telegramNumber: assignedByTelegram || "", // ✅ Include in assignedBy object
        },
        assignedByEmail: userEmail,

        // Task ownership
        createdBy: userEmail,
        userEmail: assignedToEmail,
        username: assignedUser.username || assignedToEmail.split("@")[0],

        // Timestamps
        startDate: new Date().toISOString(),
        createdAt: new Date(),
        assignedAt: new Date(),
        totalDuration: 0,

        // Recurring task fields
        isRecurring: isRecurring || false,
        recurringOptions: processedRecurringOptions,
        recurringStatus: isRecurring ? "active" : undefined,
        recurringType: isRecurring
          ? recurringOptions?.repeatType || "schedule"
          : undefined,
        recurringCount: isRecurring ? recurringOptions?.repeatCount || 0 : 0,

        activities: [
          {
            action: "assigned" as const,
            timestamp: new Date(),
            duration: 0,
            assignedBy: userEmail,
            assignedTo: assignedToEmail,
            assignedByTelegram: assignedByTelegram || "", // ✅ Include in activity
            assignedToTelegram: assignedToTelegram || "",
          },
        ],
      };

      const task = new Task(taskData);
      await task.save();

      console.log(
        `✅ Task assignment created successfully with telegram numbers:`,
        {
          taskId: task.taskId,
          taskName: task.taskName,
           approvalNeeded: task.approvalNeeded,
          assignedByTelegram: assignedByTelegram || "None",
          assignedToTelegram: assignedToTelegram || "None",
          primaryTelegram: taskData.telegramNumber || "None",
        }
      );

      res.json({
        success: true,
        data: task,
        message: `${isRecurring ? "Recurring " : ""}Task assigned successfully`,
        telegramInfo: {
          assignedByTelegram: assignedByTelegram || null,
          assignedToTelegram: assignedToTelegram || null,
          telegramIncluded: !!(assignedByTelegram || assignedToTelegram),
        },
      });
    } catch (error) {
      console.error("Error creating task assignment:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create task assignment",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // Add approval endpoints
  async getPendingApprovalTasks(req: any, res: any): Promise<void> {
    try {
      console.log('🔍 Getting pending approval tasks...');
      
      // ✅ Direct database query instead of taskService
      const tasks = await Task.find({
        approvalNeeded: true,
        status: { $in: ['ended', 'completed'] },
        isApproved: { $ne: true }
      }).sort({ endDate: -1 });
      
      console.log(`✅ Found ${tasks.length} tasks pending approval`);
      
      res.status(200).json({
        success: true,
        data: tasks,
        message: `Found ${tasks.length} tasks pending approval`
      });
    } catch (error: any) {
      console.error('❌ Error in getPendingApprovalTasks controller:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  async approveTask(req: any, res: any): Promise<void> {
    try {
      const { taskId } = req.params;
      const { approvedBy, comments } = req.body;
      
      console.log('🚀 Approving task in controller:', { taskId, approvedBy, comments });
      
      // ✅ Validate required fields
      if (!taskId) {
        res.status(400).json({
          success: false,
          message: 'Task ID is required'
        });
        return;
      }
      
      if (!approvedBy) {
        res.status(400).json({
          success: false,
          message: 'Approved by field is required'
        });
        return;
      }
      
      // ✅ Direct database operations instead of taskService
      const existingTask = await Task.findOne({ taskId });
      
      if (!existingTask) {
        res.status(404).json({
          success: false,
          message: 'Task not found'
        });
        return;
      }

      console.log('📋 Found task to approve:', {
        taskId: existingTask.taskId,
        taskName: existingTask.taskName,
        status: existingTask.status,
        approvalNeeded: existingTask.approvalNeeded
      });

      // Check if task needs approval
      if (!existingTask.approvalNeeded) {
        res.status(400).json({
          success: false,
          message: 'Task does not require approval'
        });
        return;
      }

      // Check if already approved
      if (existingTask.isApproved) {
        res.status(400).json({
          success: false,
          message: 'Task is already approved'
        });
        return;
      }

      // ✅ Update task directly using Mongoose model
      const approvedTask = await Task.findOneAndUpdate(
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
        { new: true }
      );
      
      if (!approvedTask) {
        res.status(500).json({
          success: false,
          message: 'Failed to approve task'
        });
        return;
      }

      console.log('✅ Task approved successfully:', {
        taskId: approvedTask.taskId,
        approvedBy: approvedTask.approvedBy,
        approvedAt: approvedTask.approvedAt
      });

      res.status(200).json({
        success: true,
        data: approvedTask,
        message: 'Task approved successfully'
      });
    } catch (error: any) {
      console.error('❌ Error in approveTask controller:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
// Add this new method to your TaskController class
async createCompletedTask(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userEmail = req.user?.email;
    const userId = req.user?._id;
    const userTelegram = await this.getUserTelegram(userEmail!);

    if (!userEmail) {
      res.status(401).json({
        success: false,
        message: "User authentication required",
      });
      return;
    }

    console.log("Creating completed task with data:", req.body);

    const taskData = {
      ...req.body,
      status: "ended", // ✅ Set status as ended
      createdBy: userEmail,
      userEmail: userEmail,
      userId: userId?.toString(),
      isAssigned: false,
      username: req.user?.username,
      userTelegram,
      telegramNumber: req.body.telegramNumber || userTelegram,
      
      // ✅ Ensure we have the required activities for a completed task
      activities: req.body.activities || [
        {
          action: "started" as const,
          timestamp: new Date(req.body.startDate),
          duration: 0,
        },
        {
          action: "ended" as const,
          timestamp: new Date(req.body.endDate || new Date()),
          duration: req.body.totalDuration || 0,
        }
      ],
    };

    // Validation
    if (!taskData.taskId || !taskData.taskName || !taskData.type) {
      res.status(400).json({
        success: false,
        message: "Missing required fields: taskId, taskName, and type are required",
        received: taskData,
      });
      return;
    }

    if (!["task", "meeting"].includes(taskData.type)) {
      res.status(400).json({
        success: false,
        message: 'Invalid type. Must be either "task" or "meeting"',
      });
      return;
    }

    // ✅ Ensure we have start and end dates
    if (!taskData.startDate) {
      res.status(400).json({
        success: false,
        message: "Start date is required for completed tasks",
      });
      return;
    }

    const newTask = new Task(taskData);
    await newTask.save();

    console.log(`✅ Completed task created by user: ${userEmail}`);

    res.status(201).json({
      success: true,
      message: "Completed task created successfully",
      data: newTask,
    });
  } catch (error: any) {
    console.error("Error creating completed task:", error);

    if (error.message.includes("duplicate key")) {
      res.status(400).json({
        success: false,
        message: "Task with this ID already exists",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Failed to create completed task",
      error: error.message,
    });
  }
}

  async rejectTask(req: any, res: any): Promise<void> {
    try {
      const { taskId } = req.params;
      const { rejectedBy, reason } = req.body;
      
      console.log('🚀 Rejecting task in controller:', { taskId, rejectedBy, reason });
      
      // ✅ Validate required fields
      if (!taskId) {
        res.status(400).json({
          success: false,
          message: 'Task ID is required'
        });
        return;
      }
      
      if (!rejectedBy) {
        res.status(400).json({
          success: false,
          message: 'Rejected by field is required'
        });
        return;
      }
      
      // ✅ Direct database operations instead of taskService
      const existingTask = await Task.findOne({ taskId });
      
      if (!existingTask) {
        res.status(404).json({
          success: false,
          message: 'Task not found'
        });
        return;
      }

      console.log('📋 Found task to reject:', {
        taskId: existingTask.taskId,
        taskName: existingTask.taskName,
        status: existingTask.status,
        approvalNeeded: existingTask.approvalNeeded
      });

      // Check if task needs approval
      if (!existingTask.approvalNeeded) {
        res.status(400).json({
          success: false,
          message: 'Task does not require approval'
        });
        return;
      }

      // Check if already processed
      if (existingTask.isApproved || existingTask.rejectedBy) {
        res.status(400).json({
          success: false,
          message: 'Task has already been processed'
        });
        return;
      }

      // ✅ Update task directly using Mongoose model
      const rejectedTask = await Task.findOneAndUpdate(
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
        { new: true }
      );
      
      if (!rejectedTask) {
        res.status(500).json({
          success: false,
          message: 'Failed to reject task'
        });
        return;
      }

      console.log('✅ Task rejected successfully:', {
        taskId: rejectedTask.taskId,
        rejectedBy: rejectedTask.rejectedBy,
        rejectedAt: rejectedTask.rejectedAt
      });

      res.status(200).json({
        success: true,
        data: rejectedTask,
        message: 'Task rejected successfully'
      });
    } catch (error: any) {
      console.error('❌ Error in rejectTask controller:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

// Add these methods to your TaskController class
// Add these methods to your existing TaskController class
async editTask(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { taskId } = req.params;
    const updateData = req.body;
    const userEmail = req.user?.email;
    
    console.log('🔄 TaskController.editTask:', { taskId, updateData, userEmail });
    
    if (!taskId) {
      res.status(400).json({
        success: false,
        message: 'Task ID is required'
      });
      return;
    }

    if (!userEmail) {
      res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
      return;
    }

    // Find the task first
    const existingTask = await Task.findOne({ taskId });
    
    if (!existingTask) {
      res.status(404).json({
        success: false,
        message: 'Task not found'
      });
      return;
    }

    // Check permissions - user can only edit their own tasks or if they're admin
    const canEdit = 
      existingTask.createdBy === userEmail ||
      existingTask.userEmail === userEmail ||
      existingTask.assignedToEmail === userEmail ||
      req.user?.role === 'admin';

    if (!canEdit) {
      res.status(403).json({
        success: false,
        message: 'Permission denied: You can only edit your own tasks'
      });
      return;
    }

    // Update the task
    const updatedTask = await Task.findOneAndUpdate(
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
      res.status(500).json({
        success: false,
        message: 'Failed to update task'
      });
      return;
    }

    console.log('✅ Task updated successfully:', taskId);
    
    res.json({
      success: true,
      message: 'Task updated successfully',
      data: updatedTask
    });
  } catch (error) {
    console.error('❌ Error editing task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update task',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async deleteTask(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { taskId } = req.params;
    const userEmail = req.user?.email;
    
    console.log('🗑️ TaskController.deleteTask:', { taskId, userEmail });
    
    if (!taskId) {
      res.status(400).json({
        success: false,
        message: 'Task ID is required'
      });
      return;
    }

    if (!userEmail) {
      res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
      return;
    }

    // Find the task first
    const existingTask = await Task.findOne({ taskId });
    
    if (!existingTask) {
      res.status(404).json({
        success: false,
        message: 'Task not found'
      });
      return;
    }

    // Check permissions - user can only delete their own tasks or if they're admin
    const canDelete = 
      existingTask.createdBy === userEmail ||
      existingTask.userEmail === userEmail ||
      existingTask.assignedToEmail === userEmail ||
      req.user?.role === 'admin';

    if (!canDelete) {
      res.status(403).json({
        success: false,
        message: 'Permission denied: You can only delete your own tasks'
      });
      return;
    }

    // Delete the task
    const deletedTask = await Task.findOneAndDelete({ taskId });
    
    if (!deletedTask) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete task'
      });
      return;
    }

    console.log('✅ Task deleted successfully:', taskId);
    
    res.json({
      success: true,
      message: 'Task deleted successfully',
      data: { taskId }
    });
  } catch (error) {
    console.error('❌ Error deleting task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete task',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}






}
