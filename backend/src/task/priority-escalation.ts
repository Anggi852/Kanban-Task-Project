import { TaskPriority } from '../generated/prisma/enums';

// Numeric rank so priorities can be compared / maxed.
export const PRIORITY_RANK: Record<TaskPriority, number> = {
  LOW: 0,
  MEDIUM: 1,
  HIGH: 2,
};

const HOUR = 60 * 60 * 1000;
export const ESCALATE_HIGH_WITHIN_MS = 24 * HOUR; // ≤ 24h → HIGH
export const ESCALATE_MEDIUM_WITHIN_MS = 72 * HOUR; // ≤ 72h → at least MEDIUM

/**
 * The minimum priority a task should have purely based on how close its
 * deadline is. Overdue tasks (negative diff) fall under the ≤24h branch and
 * become HIGH. Returns `null` when the deadline is far enough away to impose
 * no floor.
 */
export function deadlineFloor(
  dueDate: Date | null,
  now: Date = new Date(),
): TaskPriority | null {
  if (!dueDate) return null;
  const diff = dueDate.getTime() - now.getTime();
  if (diff <= ESCALATE_HIGH_WITHIN_MS) return 'HIGH';
  if (diff <= ESCALATE_MEDIUM_WITHIN_MS) return 'MEDIUM';
  return null;
}

/**
 * Effective priority = the higher of the user's manual priority and the
 * deadline-imposed floor. Never drops below `basePriority`, so a manual HIGH
 * stays HIGH even with a distant deadline.
 */
export function escalatePriority(
  basePriority: TaskPriority,
  dueDate: Date | null,
  now: Date = new Date(),
): TaskPriority {
  const floor = deadlineFloor(dueDate, now);
  if (!floor) return basePriority;
  return PRIORITY_RANK[floor] > PRIORITY_RANK[basePriority]
    ? floor
    : basePriority;
}
