import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';

@Injectable()
export class ColumnsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateColumnDto) {
    await this.assertBoardOwnership(userId, dto.boardId);

    return this.prisma.$transaction(async (tx) => {
      const count = await tx.column.count({ where: { boardId: dto.boardId } });
      return tx.column.create({
        data: {
          boardId: dto.boardId,
          name: dto.name,
          type: dto.type ?? 'TODO',
          position: count,
        },
      });
    });
  }

  async update(userId: string, columnId: string, dto: UpdateColumnDto) {
    await this.assertOwnership(userId, columnId);
    return this.prisma.column.update({
      where: { id: columnId },
      data: { name: dto.name, type: dto.type },
    });
  }

  async remove(userId: string, columnId: string) {
    const column = await this.loadOwnedColumn(userId, columnId);

    await this.prisma.$transaction(async (tx) => {
      await tx.column.delete({ where: { id: columnId } });
      await tx.column.updateMany({
        where: { boardId: column.boardId, position: { gt: column.position } },
        data: { position: { decrement: 1 } },
      });
    });

    return { id: columnId, deleted: true };
  }

  async reorder(userId: string, columnId: string, target: number) {
    const column = await this.loadOwnedColumn(userId, columnId);

    return this.prisma.$transaction(async (tx) => {
      const total = await tx.column.count({
        where: { boardId: column.boardId },
      });
      const clamped = Math.min(Math.max(target, 0), total - 1);
      if (clamped === column.position) return column;

      if (clamped > column.position) {
        await tx.column.updateMany({
          where: {
            boardId: column.boardId,
            position: { gt: column.position, lte: clamped },
          },
          data: { position: { decrement: 1 } },
        });
      } else {
        await tx.column.updateMany({
          where: {
            boardId: column.boardId,
            position: { gte: clamped, lt: column.position },
          },
          data: { position: { increment: 1 } },
        });
      }

      return tx.column.update({
        where: { id: columnId },
        data: { position: clamped },
      });
    });
  }

  private async loadOwnedColumn(userId: string, columnId: string) {
    const column = await this.prisma.column.findUnique({
      where: { id: columnId },
      include: { board: { select: { userId: true } } },
    });
    if (!column) throw new NotFoundException('Column not found');
    if (column.board.userId !== userId)
      throw new ForbiddenException('Forbidden');
    return column;
  }

  private async assertOwnership(userId: string, columnId: string) {
    await this.loadOwnedColumn(userId, columnId);
  }

  private async assertBoardOwnership(userId: string, boardId: string) {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
      select: { userId: true },
    });
    if (!board) throw new NotFoundException('Board not found');
    if (board.userId !== userId) throw new ForbiddenException('Forbidden');
  }
}
