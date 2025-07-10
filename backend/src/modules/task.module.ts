import { TaskController } from '../controllers/task.controller';
import { TaskService } from '../services/task.service';
import { TaskRepository } from '../repositories/task.repository';
import { UserRepository } from '../repositories/user.repository';

export class TaskModule {
  private static instance: TaskModule;
  private taskController: TaskController;
  private taskService: TaskService;
  private taskRepository: TaskRepository;
  private userRepository: UserRepository;

  private constructor() {
    this.taskRepository = new TaskRepository();
    this.userRepository = new UserRepository();
    this.taskService = new TaskService();
    this.taskController = new TaskController();
  }

  public static getInstance(): TaskModule {
    if (!TaskModule.instance) {
      TaskModule.instance = new TaskModule();
    }
    return TaskModule.instance;
  }

  public getController(): TaskController {
    this.taskController.taskService = this.taskService;
    return this.taskController;
  }

  public getService(): TaskService {
    return this.taskService;
  }

  public getTaskRepository(): TaskRepository {
    return this.taskRepository;
  }

  public getUserRepository(): UserRepository {
    return this.userRepository;
  }
}
