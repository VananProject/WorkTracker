export interface TaskTimes {
  startTime?: string;
  pauseTime?: string;
  resumeTime?: string;
  endTime?: string;
}

export interface Task {
  taskId: string;
  taskName: string;
  type: 'task' | 'meeting';
  status: 'started' | 'paused' | 'resumed' | 'ended';
  startDate: string;
  endDate?: string;
  times: TaskTimes;
}

export interface TimerState {
  currentTask: Task | null;
  isRunning: boolean;
  elapsedTime: number;
  alarmTime: number | null;
  showTaskNameInput: boolean;
  taskName: string;
  showAlarmDialog: boolean;
  error: string | null;
}

export type TimerAction =
  | { type: 'START_TASK'; payload: { type: 'task' | 'meeting'; startTime?: string } }
  | { type: 'PAUSE_TASK' }
  | { type: 'RESUME_TASK' }
  | { type: 'STOP_TASK' }
  | { type: 'RESET_TASK' }
  | { type: 'SET_TASK_NAME'; payload: string }
  | { type: 'SAVE_TASK' }
  | { type: 'SET_ALARM'; payload: number }
  | { type: 'CLEAR_ALARM' }
  | { type: 'TICK' }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SHOW_TASK_INPUT' }
  | { type: 'HIDE_TASK_INPUT' }
  | { type: 'SHOW_ALARM_DIALOG' }
  | { type: 'HIDE_ALARM_DIALOG' };
