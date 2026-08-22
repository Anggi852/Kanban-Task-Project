import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async summary(userId: string, boardId?: string) {
    const boardFilter = await this.resolveBoardFilter(userId, boardId);

    const [totalBoards, totalTasks, completedTasks] = await Promise.all([
      this.prisma.board.count({ where: { userId } }),
      this.prisma.task.count({
        where: { column: { board: boardFilter } },
      }),
      this.prisma.task.count({
        where: {
          column: { type: 'DONE', board: boardFilter },
        },
      }),
    ]);

    const completionRate = totalTasks === 0 ? 0 : completedTasks / totalTasks;

    return {
      totalBoards,
      totalTasks,
      completedTasks,
      completionRate: Number(completionRate.toFixed(4)),
    };
  }

  async distribution(userId: string, boardId?: string) {
    const boardFilter = await this.resolveBoardFilter(userId, boardId);

    const columns = await this.prisma.column.findMany({
      where: { board: boardFilter },
      select: { type: true, _count: { select: { tasks: true } } },
    });

    const counts: Record<'TODO' | 'IN_PROGRESS' | 'DONE', number> = {
      TODO: 0,
      IN_PROGRESS: 0,
      DONE: 0,
    };
    for (const c of columns) {
      counts[c.type] += c._count.tasks;
    }

    return [
      { status: 'TODO' as const, count: counts.TODO },
      { status: 'IN_PROGRESS' as const, count: counts.IN_PROGRESS },
      { status: 'DONE' as const, count: counts.DONE },
    ];
  }

  async trend(userId: string, days = 14, boardId?: string, tz?: string) {
    const boardFilter = await this.resolveBoardFilter(userId, boardId);

    const doneColumns = await this.prisma.column.findMany({
      where: { board: boardFilter, type: 'DONE' },
      select: { id: true },
    });
    const doneIds = new Set(doneColumns.map((c) => c.id));

    const keys = buildDateKeys(days, tz);
    const queryFloor = new Date(`${keys[0]}T00:00:00Z`);
    queryFloor.setUTCDate(queryFloor.getUTCDate() - 1);

    const activities = await this.prisma.activity.findMany({
      where: {
        board: boardFilter,
        action: { in: ['TASK_MOVED', 'TASK_CREATED'] },
        createdAt: { gte: queryFloor },
      },
      select: { action: true, metadata: true, createdAt: true },
    });

    const buckets = new Map<string, number>();
    for (const k of keys) buckets.set(k, 0);

    for (const a of activities) {
      const meta = a.metadata as Record<string, unknown> | null;
      if (!meta) continue;
      const destination =
        a.action === 'TASK_MOVED'
          ? (meta.toColumnId as string | undefined)
          : a.action === 'TASK_CREATED'
            ? (meta.columnId as string | undefined)
            : undefined;
      if (!destination || !doneIds.has(destination)) continue;

      const key = dateKey(a.createdAt, tz);
      if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }

    return keys.map((date) => ({ date, completed: buckets.get(date) ?? 0 }));
  }

  private async resolveBoardFilter(userId: string, boardId?: string) {
    if (!boardId) return { userId };

    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
      select: { userId: true },
    });
    if (!board) throw new NotFoundException('Board not found');
    if (board.userId !== userId) throw new ForbiddenException('Forbidden');
    return { id: boardId, userId };
  }
}

function dateKey(date: Date, tz?: string): string {
  if (!tz) return date.toISOString().slice(0, 10);
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

function buildDateKeys(days: number, tz?: string): string[] {
  const todayKey = dateKey(new Date(), tz);
  const cursor = new Date(`${todayKey}T00:00:00Z`);
  const keys: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(cursor);
    d.setUTCDate(d.getUTCDate() - i);
    keys.push(d.toISOString().slice(0, 10));
  }
  return keys;
}
