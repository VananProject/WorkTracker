import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();
const taskController = new TaskController();

// Apply authentication to all routes
router.use(authenticateToken);

// User-specific routes
router.get('/user', taskController.getUserTasks.bind(taskController));
router.get('/admin', taskController.getAdminTasks.bind(taskController));

// Existing routes with authentication
router.get('/', taskController.getAllTasks.bind(taskController));
router.get('/assigned', taskController.getAssignedTasks.bind(taskController));
router.get('/active', taskController.getActiveTasks.bind(taskController));
router.get('/date-range', taskController.getTasksByDateRange.bind(taskController));
router.get('/debug', taskController.debugTasks.bind(taskController));
router.get('/:taskId', taskController.getTaskById.bind(taskController));

// Add this new route after your existing routes
router.post('/create-completed', taskController.createCompletedTask.bind(taskController));

router.post('/', taskController.createTask.bind(taskController));
router.post('/start', taskController.startTask.bind(taskController));
router.post('/assign', taskController.assignTask.bind(taskController));
router.post('/create-assignment',  taskController.createTaskAssignment.bind(taskController));
router.put('/start-assigned/:taskId', taskController.startAssignedTask.bind(taskController));
router.put('/pause/:taskId', taskController.pauseTask.bind(taskController));
router.put('/resume/:taskId', taskController.resumeTask.bind(taskController));
router.put('/end/:taskId', taskController.endTask.bind(taskController));

// Add these routes
router.put('/:taskId', taskController.updateTask.bind(taskController));
router.put('/:taskId/recurring', taskController.updateRecurringSettings.bind(taskController));


router.get('/pending-approval', async (req, res) => {
  await taskController.getPendingApprovalTasks(req, res);
});

router.put('/:taskId/approve', async (req, res) => {
  await taskController.approveTask(req, res);
});

router.put('/:taskId/reject', async (req, res) => {
  await taskController.rejectTask(req, res);
});
// Add these routes to your existing task routes

// Task Mapping Routes
router.get('/mappings/:userEmail', taskController.getTaskMappings.bind(taskController));
router.post('/mappings',  taskController.saveTaskMapping.bind(taskController));
router.put('/mappings/:id',  taskController.updateTaskMapping.bind(taskController));
router.delete('/mappings/:id',  taskController.deleteTaskMapping.bind(taskController));
router.get('/level-stats/:userEmail',  taskController.getTaskLevelStats.bind(taskController));
router.get('/level-report/:userEmail',  taskController.exportTaskLevelReport.bind(taskController));

export default router;
