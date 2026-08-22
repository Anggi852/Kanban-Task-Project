import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { ActivitiesService } from '../activities/activities.service';
import {
  ESCALATE_MEDIUM_WITHIN_MS,
  escalatePriority,
} from './priority-escalation';

/**
 * Periodically raises task priority as deadlines approach. Persisting the
 * change (rather than only computing it on read) keeps the board, analytics
 * and activity feed consistent and lets the escalation be recorded as history.
 */
@Injectable()
export class PriorityEscalationService {
  private readonly logger = new Logger(PriorityEscalationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly activities: ActivitiesService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleDeadlineEscalation(): Promise<void> {
    await this.run();
  }

  /** Exposed for manual triggering / tests. Returns how many tasks changed. */
  async run(now: Date = new Date()): Promise<number> {
    try {
      // Only tasks that can still escalate: have a deadline within (or past) the
      // widest window and live in a non-DONE column.
      const horizon = new Date(now.getTime() + ESCALATE_MEDIUM_WITHIN_MS);
      const candidates = await this.prisma.task.findMany({
        where: {
          dueDate: { not: null, lte: horizon },
          column: { type: { not: 'DONE' } },
        },
        select: {
          id: true,
          priority: true,
          basePriority: true,
          dueDate: true,
          title: true,
          column: { select: { boardId: true } },
        },
      });

      let changed = 0;
      for (const task of candidates) {
        const next = escalatePriority(task.basePriority, task.dueDate, now);
        if (next === task.priority) continue;

        await this.prisma.task.update({
          where: { id: task.id },
          data: { priority: next },
        });

        await this.activities.log({
          boardId: task.column.boardId,
          action: 'TASK_UPDATED',
          taskId: task.id,
          metadata: {
            auto: true,
            reason: 'deadline',
            title: task.title,
            changes: { priority: { from: task.priority, to: next } },
          },
        });

        changed++;
      }

      if (changed > 0) {
        this.logger.log(
          `Deadline escalation raised priority on ${changed} task(s)`,
        );
      }
      return changed;
    } catch (error) {
      const err = error as Error;
      this.logger.warn(`Skipping priority escalation due to database connection issue: ${err.message}`);
      return 0;
    }
  }
}