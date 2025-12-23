
export type TaskStatus = string;

export interface TaskActivity {
  taskId: string;
  actionType: string;
  action: string;
  actionTs: string;
  status?: TaskStatus;
  priority?: string;
  timestamp: string;
  user: string;
}

export interface Task {
  taskId: string;
  channelId: string;
  message: string;
  messageTimestamp: string;
  user: string;
  status: TaskStatus;
  priority: string;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
  lastAction: string;
  channelName?: string;
}

export interface DashboardStats {
  total: number;
  new: number;
  todo: number;
  pickedUp: number;
  done: number;
}
