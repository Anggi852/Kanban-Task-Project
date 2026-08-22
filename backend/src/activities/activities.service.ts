import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityAction } from '../generated/prisma/enums';

interface LogParams {
  boardId: string;
  action: ActivityAction;
  taskId?: string | null;
  metadata?: Record<string, unknown> | null;
}

@Injectable()
export class ActivitiesService {
  private readonly logger = new Logger(ActivitiesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async log({ boardId, action, taskId = null, metadata = null }: LogParams) {
    try {
      await this.prisma.activity.create({
        data: {
          boardId,
          action,
          taskId,
          metadata: metadata as any,
        },
      });
    } catch (err) {
      this.logger.error(
        `Failed to record activity ${action} for board ${boardId}`,
        err as Error,
      );
    }
  }

  async listForBoard(userId: string, boardId: string, limit = 50) {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
      select: { userId: true },
    });
    if (!board) throw new NotFoundException('Board not found');
    if (board.userId !== userId) throw new ForbiddenException('Forbidden');

    return this.prisma.activity.findMany({
      where: { boardId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async listForUser(userId: string, limit = 100, cursor?: string) {
    return this.prisma.activity.findMany({
      where: { board: { userId } },
      orderBy: { createdAt: 'desc' },
      take: limit,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      include: {
        board: { select: { id: true, name: true } },
      },
    });
  }
}
