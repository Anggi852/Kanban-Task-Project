export type ColumnType = 'TODO' | 'IN_PROGRESS' | 'DONE'
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH'

export type ActivityAction =
  | 'TASK_CREATED'
  | 'TASK_UPDATED'
  | 'TASK_MOVED'
  | 'TASK_DELETED'
  | 'TASK_REORDERED'

export interface User {
  id: string
  email: string
  name: string | null
  createdAt?: string
  updatedAt?: string
}

export interface Task {
  id: string
  title: string
  description: string | null
  // Effective priority — may be auto-raised as the deadline nears.
  priority: TaskPriority
  // The user's manually-set priority. When `priority` outranks this, the
  // task was escalated automatically because its deadline is close.
  basePriority: TaskPriority
  position: number
  dueDate: string | null
  columnId: string
  createdAt: string
  updatedAt: string
}

export interface Column {
  id: string
  name: string
  position: number
  type: ColumnType
  boardId: string
  tasks?: Task[]
}

export interface Board {
  id: string
  name: string
  userId: string
  createdAt: string
  updatedAt: string
  columns?: Column[]
}

export interface Activity {
  id: string
  action: ActivityAction
  metadata: Record<string, unknown> | null
  boardId: string
  taskId: string | null
  createdAt: string
  board?: { id: string; name: string }
}

export interface AnalyticsSummary {
  totalBoards: number
  totalTasks: number
  completedTasks: number
  completionRate: number
}

export interface TrendPoint {
  date: string
  completed: number
}

export interface StatusDistributionPoint {
  status: ColumnType
  count: number
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginResponse {
  data: AuthTokens
}

export interface RegisterResponse {
  data: {
    user: {
      id: string
      name: string | null
      email: string
      tokens: AuthTokens
    }
  }
}
