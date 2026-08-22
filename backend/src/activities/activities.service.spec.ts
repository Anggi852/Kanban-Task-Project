import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ActivitiesService } from './activities.service';
import { PrismaService } from '../prisma/prisma.service';
import { createPrismaMock, PrismaMock } from '../test/prisma.mock';

describe('ActivitiesService', () => {
  let service: ActivitiesService;
  let prisma: PrismaMock;

  beforeEach(async () => {
    prisma = createPrismaMock();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivitiesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get(ActivitiesService);
  });

  describe('log', () => {
    it('records the activity', async () => {
      await service.log({
        boardId: 'b1',
        action: 'TASK_CREATED',
        taskId: 't1',
      });
      expect(prisma.activity.create).toHaveBeenCalledWith({
        data: {
          boardId: 'b1',
          action: 'TASK_CREATED',
          taskId: 't1',
          metadata: null,
        },
      });
    });

    it('never throws when persistence fails (best-effort logging)', async () => {
      prisma.activity.create.mockRejectedValue(new Error('db down'));
      await expect(
        service.log({ boardId: 'b1', action: 'TASK_UPDATED' }),
      ).resolves.toBeUndefined();
    });
  });

  describe('listForBoard', () => {
    it('throws NotFound when the board is missing', async () => {
      prisma.board.findUnique.mockResolvedValue(null);
      await expect(service.listForBoard('u1', 'b1')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('throws Forbidden for a board owned by another user', async () => {
      prisma.board.findUnique.mockResolvedValue({ userId: 'other' });
      await expect(service.listForBoard('u1', 'b1')).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });

    it('returns activities for the owner', async () => {
      prisma.board.findUnique.mockResolvedValue({ userId: 'u1' });
      prisma.activity.findMany.mockResolvedValue([{ id: 'a1' }]);
      await expect(service.listForBoard('u1', 'b1')).resolves.toEqual([
        { id: 'a1' },
      ]);
      expect(prisma.activity.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { boardId: 'b1' }, take: 50 }),
      );
    });
  });

  describe('listForUser', () => {
    it('scopes to the user and applies cursor pagination', async () => {
      prisma.activity.findMany.mockResolvedValue([]);
      await service.listForUser('u1', 10, 'cursor-id');
      expect(prisma.activity.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { board: { userId: 'u1' } },
          take: 10,
          skip: 1,
          cursor: { id: 'cursor-id' },
        }),
      );
    });
  });
});
