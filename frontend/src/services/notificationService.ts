class NotificationService {
  setAlarmInterval(minutes: number, arg1: () => void) {
      throw new Error('Method not implemented.');
  }
  clearAlarmInterval() {
      throw new Error('Method not implemented.');
  }
  private pausedTaskTimers: Map<string, number> = new Map();

  // Request notification permission
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  // Show notification for paused task - ONLY for current user
  showPausedTaskNotification(taskName: string, pausedMinutes: number, currentUserEmail: string, taskOwnerEmail: string): void {
    // Only show notification if the task belongs to the current user
    if (currentUserEmail !== taskOwnerEmail) {
      console.log(`Skipping notification for task "${taskName}" - not owned by current user`);
      return;
    }

    if (Notification.permission === 'granted') {
      const notification = new Notification('⏸️ Your Paused Task Reminder', {
        body: `Your task "${taskName}" has been paused for ${pausedMinutes} minutes. Consider resuming or stopping it.`,
        icon: '/favicon.ico',
        tag: `paused-task-reminder-${taskName}`,
        requireInteraction: true
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Auto close after 10 seconds
      setTimeout(() => {
        notification.close();
      }, 10000);
    }
  }

  // Start monitoring a paused task - ONLY for current user
  startPausedTaskMonitoring(taskId: string, taskName: string, currentUserEmail: string, taskOwnerEmail: string, pausedAt?: Date): void {
    // Only monitor if the task belongs to the current user
    if (currentUserEmail !== taskOwnerEmail) {
      console.log(`Skipping monitoring for task "${taskName}" - not owned by current user`);
      return;
    }

    // Clear existing timer if any
    this.stopPausedTaskMonitoring(taskId);

    const pausedTime = pausedAt || new Date();
    
    // Calculate time until first notification (30 minutes from pause time)
    const now = new Date();
    const timeSincePaused = now.getTime() - pausedTime.getTime();
    const thirtyMinutes = 30 * 60 * 1000; // 30 minutes in milliseconds
    
    let timeUntilFirstNotification = thirtyMinutes - timeSincePaused;
    
    // If already past 30 minutes, show notification immediately and set up recurring
    if (timeUntilFirstNotification <= 0) {
      const minutesPaused = Math.floor(timeSincePaused / (60 * 1000));
      this.showPausedTaskNotification(taskName, minutesPaused, currentUserEmail, taskOwnerEmail);
      timeUntilFirstNotification = thirtyMinutes; // Next notification in 30 minutes
    }

    // Set timer for first/next notification
    const timer = window.setTimeout(() => {
      const currentTime = new Date();
      const totalPausedTime = currentTime.getTime() - pausedTime.getTime();
      const minutesPaused = Math.floor(totalPausedTime / (60 * 1000));
      
      this.showPausedTaskNotification(taskName, minutesPaused, currentUserEmail, taskOwnerEmail);
      
      // Set recurring timer for every 30 minutes
      const recurringTimer = window.setInterval(() => {
        const now = new Date();
        const totalTime = now.getTime() - pausedTime.getTime();
        const minutes = Math.floor(totalTime / (60 * 1000));
        this.showPausedTaskNotification(taskName, minutes, currentUserEmail, taskOwnerEmail);
      }, thirtyMinutes);

      this.pausedTaskTimers.set(taskId, recurringTimer);
    }, timeUntilFirstNotification);

    this.pausedTaskTimers.set(taskId, timer);
  }

  // Stop monitoring a paused task
  stopPausedTaskMonitoring(taskId: string): void {
    const timer = this.pausedTaskTimers.get(taskId);
    if (timer) {
      window.clearTimeout(timer);
      window.clearInterval(timer);
      this.pausedTaskTimers.delete(taskId);
    }
  }

  // Clear all timers
  clearAllTimers(): void {
    this.pausedTaskTimers.forEach((timer) => {
      window.clearTimeout(timer);
      window.clearInterval(timer);
    });
    this.pausedTaskTimers.clear();
  }

  // Get all monitored tasks
  getMonitoredTasks(): string[] {
    return Array.from(this.pausedTaskTimers.keys());
  }
}

export const notificationService = new NotificationService();
