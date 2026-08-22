import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from '../prisma/prisma.service';
import { createPrismaMock, PrismaMock } from '../test/prisma.mock';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let prisma: PrismaMock;

  beforeEach(async () => {
    prisma = createPrismaMock();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get(AnalyticsService);
  });

  describe('summary', () => {
    it('scopes counts to the user and computes the completion rate', async () => {
      prisma.board.count.mockResolvedValue(2);
      prisma.task.count.mockResolvedValueOnce(5).mockResolvedValueOnce(1);

      const result = await service.summary('u1');

      expect(prisma.board.count).toHaveBeenCalledWith({
        where: { userId: 'u1' },
      });
      expect(result).toEqual({
        totalBoards: 2,
        totalTasks: 5,
        completedTasks: 1,
        completionRate: 0.2,
      });
    });

    it('returns a 0 completion rate when there are no tasks', async () => {
      prisma.board.count.mockResolvedValue(0);
      prisma.task.count.mockResolvedValueOnce(0).mockResolvedValueOnce(0);
      const result = await service.summary('u1');
      expect(result.completionRate).toBe(0);
    });

    it('enforces ownership when a boardId is supplied', async () => {
      prisma.board.findUnique.mockResolvedValue({ userId: 'other' });
      await expect(service.summary('u1', 'b1')).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });

    it('throws NotFound for an unknown boardId', async () => {
      prisma.board.findUnique.mockResolvedValue(null);
      await expect(service.summary('u1', 'bX')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('distribution', () => {
    it('aggregates task counts by column type', async () => {
      prisma.column.findMany.mockResolvedValue([
        { type: 'TODO', _count: { tasks: 3 } },
        { type: 'TODO', _count: { tasks: 1 } },
        { type: 'DONE', _count: { tasks: 2 } },
      ]);

      const result = await service.distribution('u1');

      expect(result).toEqual([
        { status: 'TODO', count: 4 },
        { status: 'IN_PROGRESS', count: 0 },
        { status: 'DONE', count: 2 },
      ]);
    });
  });

  describe('trend', () => {
    it('returns one bucket per day, all zero when there is no activity', async () => {
      prisma.column.findMany.mockResolvedValue([]);
      prisma.activity.findMany.mockResolvedValue([]);

      const result = await service.trend('u1', 7);

      expect(result).toHaveLength(7);
      expect(result.every((p) => p.completed === 0)).toBe(true);
    });
  });
});
