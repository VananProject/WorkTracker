// import { useReducer } from 'react';

import React, { useEffect, useReducer } from "react";

interface TimerState {
  currentTask: any | null;
  isRunning: boolean;
  elapsedTime: number;
  alarmTime: number | null;
  lastAlarmTime: number;
  showTaskNameInput: boolean;
  taskName: string;
  taskType: 'task' | 'meeting' | null;
  showAlarmDialog: boolean;
  error: string | null;
  taskHistory: any[];
}

type TimerAction =
  | { type: 'START_TASK'; payload: { type: 'task' | 'meeting'; taskId: string; taskName: string } }
  // | { type: 'START_ASSIGNED_TASK'; payload: { task: any; taskId: string; taskName: string; type: 'task' | 'meeting' } }
  | { type: 'PAUSE_TASK' }
  | { type: 'START_ASSIGNED_TASK'; payload: any } 
  | { type: 'RESUME_TASK' }
  | { type: 'STOP_FROM_TABLE'; payload: { taskId: string } } // Add this line
  | { type: 'RESUME_FROM_TABLE'; payload: { task: any; elapsedTime: number } }
  | { type: 'STOP_TASK' }
  | { type: 'TICK' }
   | { type: 'SET_ELAPSED_TIME'; payload: number } // Add this
  | { type: 'RESTORE_TASK'; payload: { task: any; elapsedTime: number } } // Add this
  | { type: 'SET_ALARM'; payload: number }
  | { type: 'TRIGGER_ALARM' }
  | { type: 'SHOW_TASK_INPUT' }
  | { type: 'HIDE_TASK_INPUT' }
  | { type: 'SET_TASK_NAME'; payload: string }
  | { type: 'SET_TASK_TYPE'; payload: 'task' | 'meeting' }
  | { type: 'SHOW_ALARM_DIALOG' }
  | { type: 'HIDE_ALARM_DIALOG' }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESET_TASK' };

const initialState: TimerState = {
  currentTask: null,
  isRunning: false,
  elapsedTime: 0,
  alarmTime: null,
  lastAlarmTime: 0,
  showTaskNameInput: false,
  taskName: '',
  taskType: null,
  showAlarmDialog: false,
  error: null,
  taskHistory: [],
};
const STORAGE_KEY = 'timerState';

const loadState = (): TimerState => {
  const savedState = localStorage.getItem(STORAGE_KEY);
  if (savedState) {
    const parsedState = JSON.parse(savedState);
    // Ensure the elapsed time is accurate
    if (parsedState.isRunning) {
      const now = Date.now();
      const timeDiff = (now - parsedState.lastUpdated) / 1000;
      parsedState.elapsedTime += Math.floor(timeDiff);
    }
    return parsedState;
  }
  return initialState;
};

const saveState = (state: TimerState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({...state, lastUpdated: Date.now()}));
};

export const useTimerReducer = () => {
  const [state, dispatch] = useReducer(timerReducer, loadState());

  useEffect(() => {
    saveState(state);
  }, [state]);

  return [state, dispatch] as const;
};
export const timerReducer = (state: TimerState, action: TimerAction): TimerState => {
  console.log('🔄 Reducer Action:', action.type, action);
  
  switch (action.type) {
    case 'START_TASK':
    case 'START_ASSIGNED_TASK':
      console.log('🚀 Starting task in reducer:', action.payload);
      return {
        ...state,
        currentTask: {
          ...action.payload,
          status: action.payload.status || 'started'
        },
        isRunning: true,
        elapsedTime: action.payload.elapsedTime || 0,
        error: null
      };

   

    case 'PAUSE_TASK':
      return {
        ...state,
        isRunning: false,
        currentTask: state.currentTask ? {
          ...state.currentTask,
          status: 'paused'
        } : null
      };

    case 'RESUME_TASK':
      return {
        ...state,
        isRunning: true,
        currentTask: state.currentTask ? {
          ...state.currentTask,
          status: 'resumed'
        } : null
      };

    case 'RESUME_FROM_TABLE':
      return {
        ...state,
        currentTask: action.payload.task,
        isRunning: true,
        elapsedTime: action.payload.elapsedTime
      };

    case 'STOP_TASK':
      return {
        ...state,
        currentTask: null,
        isRunning: false,
        elapsedTime: 0
      };
        case 'STOP_FROM_TABLE':
      // If the stopped task is the current task, clear it
      const isCurrentTask = state.currentTask?.taskId === action.payload.taskId;
      
      return {
        ...state,
        currentTask: isCurrentTask ? null : state.currentTask,
        isRunning: isCurrentTask ? false : state.isRunning,
        elapsedTime: isCurrentTask ? 0 : state.elapsedTime,
        error: null
      };

    case 'TICK':
      return {
        ...state,
        elapsedTime: state.elapsedTime + 1
      };
          case 'SET_ELAPSED_TIME':
      return {
        ...state,
        elapsedTime: action.payload
      };

    case 'RESTORE_TASK':
      return {
        ...state,
        currentTask: action.payload.task,
        isRunning: true,
        elapsedTime: action.payload.elapsedTime,
        error: null
      };


    case 'SET_ALARM':
      return {
        ...state,
        alarmTime: action.payload
      };

    case 'TRIGGER_ALARM':
      return {
        ...state,
        lastAlarmTime: state.elapsedTime
      };

    case 'SHOW_TASK_INPUT':
      return {
        ...state,
        showTaskNameInput: true
      };

    case 'HIDE_TASK_INPUT':
      return {
        ...state,
        showTaskNameInput: false,
        taskName: ''
      };

    case 'SET_TASK_NAME':
      return {
        ...state,
        taskName: action.payload
      };

    case 'SET_TASK_TYPE':
      return {
        ...state,
        taskType: action.payload
      };

    case 'SHOW_ALARM_DIALOG':
      return {
        ...state,
        showAlarmDialog: true
      };

    case 'HIDE_ALARM_DIALOG':
      return {
        ...state,
        showAlarmDialog: false
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };

        case 'RESET_TASK':
      return {
        ...state,
        currentTask: null,
        isRunning: false,
        elapsedTime: 0,
        error: null
      };

    default:
      return state;
  }
};

// export const useTimerReducer = () => {
//   return React.useReducer(timerReducer, initialState);
// };

