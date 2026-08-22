import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ColumnType } from '../generated/prisma/enums';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

const DEFAULT_COLUMNS: { name: string; type: ColumnType; position: number }[] =
  [
    { name: 'Todo', type: 'TODO', position: 0 },
    { name: 'Doing', type: 'IN_PROGRESS', position: 1 },
    { name: 'Done', type: 'DONE', position: 2 },
  ];

@Injectable()
export class BoardsService {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: string, dto: CreateBoardDto) {
    return this.prisma.board.create({
      data: {
        name: dto.name,
        userId,
        columns: { create: DEFAULT_COLUMNS },
      },
      include: { columns: { orderBy: { position: 'asc' } } },
    });
  }

  findAllForUser(userId: string) {
    return this.prisma.board.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        columns: {
          orderBy: { position: 'asc' },
          include: { tasks: { orderBy: { position: 'asc' } } },
        },
      },
    });
  }

  async findOneForUser(userId: string, boardId: string) {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
      include: {
        columns: {
          orderBy: { position: 'asc' },
          include: { tasks: { orderBy: { position: 'asc' } } },
        },
      },
    });
    if (!board) throw new NotFoundException('Board not found');
    if (board.userId !== userId) throw new ForbiddenException('Forbidden');
    return board;
  }

  async update(userId: string, boardId: string, dto: UpdateBoardDto) {
    await this.assertOwnership(userId, boardId);
    return this.prisma.board.update({
      where: { id: boardId },
      data: { name: dto.name },
    });
  }

  async remove(userId: string, boardId: string) {
    await this.assertOwnership(userId, boardId);
    await this.prisma.board.delete({ where: { id: boardId } });
    return { id: boardId, deleted: true };
  }

  private async assertOwnership(userId: string, boardId: string) {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
      select: { userId: true },
    });
    if (!board) throw new NotFoundException('Board not found');
    if (board.userId !== userId) throw new ForbiddenException('Forbidden');
  }
}
