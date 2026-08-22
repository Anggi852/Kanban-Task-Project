import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TaskService } from './task.service';
import { PrismaService } from '../prisma/prisma.service';
import { ActivitiesService } from '../activities/activities.service';
import { createPrismaMock, PrismaMock } from '../test/prisma.mock';

describe('TaskService', () => {
  let service: TaskService;
  let prisma: PrismaMock;
  let activities: { log: jest.Mock };

  const ownedColumn = { id: 'col1', boardId: 'b1', board: { userId: 'u1' } };
  const ownedTask = (over: Record<string, unknown> = {}) => ({
    id: 't1',
    columnId: 'col1',
    position: 0,
    basePriority: 'MEDIUM',
    dueDate: null,
    column: { id: 'col1', boardId: 'b1', board: { userId: 'u1' } },
    ...over,
  });

  beforeEach(async () => {
    prisma = createPrismaMock();
    activities = { log: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        { provide: PrismaService, useValue: prisma },
        { provide: ActivitiesService, useValue: activities },
      ],
    }).compile();
    service = module.get(TaskService);
  });

  describe('create', () => {
    it('appends the task and logs a TASK_CREATED activity', async () => {
      prisma.column.findUnique.mockResolvedValue(ownedColumn);
      prisma.task.count.mockResolvedValue(3);
      prisma.task.create.mockResolvedValue({ id: 't1', title: 'New' });

      await service.create('u1', { columnId: 'col1', title: 'New' });

      expect(prisma.task.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          columnId: 'col1',
          title: 'New',
          basePriority: 'MEDIUM',
          priority: 'MEDIUM',
          position: 3,
        }),
      });
      expect(activities.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'TASK_CREATED', taskId: 't1' }),
      );
    });

    it('auto-escalates priority to HIGH when the deadline is within 24h', async () => {
      prisma.column.findUnique.mockResolvedValue(ownedColumn);
      prisma.task.count.mockResolvedValue(0);
      prisma.task.create.mockResolvedValue({ id: 't1' });

      const dueDate = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString();
      await service.create('u1', {
        columnId: 'col1',
        title: 'Soon',
        dueDate,
      });

      expect(prisma.task.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          basePriority: 'MEDIUM',
          priority: 'HIGH',
        }),
      });
    });

    it('rejects a column owned by another user', async () => {
      prisma.column.findUnique.mockResolvedValue({
        ...ownedColumn,
        board: { userId: 'other' },
      });
      await expect(
        service.create('u1', { columnId: 'col1', title: 'x' }),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('throws NotFound for a missing column', async () => {
      prisma.column.findUnique.mockResolvedValue(null);
      await expect(
        service.create('u1', { columnId: 'nope', title: 'x' }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('update', () => {
    it('resets basePriority and recomputes priority on a manual priority change', async () => {
      prisma.task.findUnique.mockResolvedValue(
        ownedTask({ basePriority: 'MEDIUM' }),
      );
      prisma.task.update.mockResolvedValue({ id: 't1' });

      await service.update('u1', 't1', { priority: 'LOW' } as never);

      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { id: 't1' },
        data: expect.objectContaining({ basePriority: 'LOW', priority: 'LOW' }),
      });
      expect(activities.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'TASK_UPDATED' }),
      );
    });

    it('updates only the provided scalar fields', async () => {
      prisma.task.findUnique.mockResolvedValue(ownedTask());
      prisma.task.update.mockResolvedValue({ id: 't1' });

      await service.update('u1', 't1', { title: 'Renamed' });

      const data = prisma.task.update.mock.calls[0][0].data;
      expect(data).toEqual({ title: 'Renamed' });
    });
  });

  describe('remove', () => {
    it('deletes the task, compacts positions and logs TASK_DELETED', async () => {
      prisma.task.findUnique.mockResolvedValue(
        ownedTask({ position: 1, title: 'Gone' }),
      );

      const result = await service.remove('u1', 't1');

      expect(prisma.task.delete).toHaveBeenCalledWith({ where: { id: 't1' } });
      expect(prisma.task.updateMany).toHaveBeenCalledWith({
        where: { columnId: 'col1', position: { gt: 1 } },
        data: { position: { decrement: 1 } },
      });
      expect(activities.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'TASK_DELETED' }),
      );
      expect(result).toEqual({ id: 't1', deleted: true });
    });
  });

  describe('reorder', () => {
    it('does nothing when the position is unchanged', async () => {
      prisma.task.findUnique.mockResolvedValue(ownedTask({ position: 1 }));
      prisma.task.count.mockResolvedValue(3);

      await service.reorder('u1', 't1', 1);

      expect(prisma.task.update).not.toHaveBeenCalled();
      expect(activities.log).not.toHaveBeenCalled();
    });

    it('shifts tasks and logs when the position changes', async () => {
      prisma.task.findUnique.mockResolvedValue(ownedTask({ position: 0 }));
      prisma.task.count.mockResolvedValue(3);
      prisma.task.update.mockResolvedValue({ id: 't1', position: 2 });

      await service.reorder('u1', 't1', 2);

      expect(prisma.task.updateMany).toHaveBeenCalledWith({
        where: { columnId: 'col1', position: { gt: 0, lte: 2 } },
        data: { position: { decrement: 1 } },
      });
      expect(activities.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'TASK_REORDERED' }),
      );
    });
  });

  describe('move', () => {
    it('delegates to reorder when the target column is the same', async () => {
      prisma.task.findUnique.mockResolvedValue(ownedTask({ position: 0 }));
      prisma.task.count.mockResolvedValue(2);
      prisma.task.update.mockResolvedValue({ id: 't1', position: 1 });

      await service.move('u1', 't1', {
        targetColumnId: 'col1',
        position: 1,
      });

      // reorder path runs (no cross-column move)
      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { id: 't1' },
        data: { position: 1 },
      });
    });

    it('rejects moving to a column on another board', async () => {
      prisma.task.findUnique.mockResolvedValue(ownedTask());
      prisma.column.findUnique.mockResolvedValue({
        id: 'col2',
        boardId: 'b2',
        board: { userId: 'u1' },
      });
      await expect(
        service.move('u1', 't1', {
          targetColumnId: 'col2',
          position: 0,
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('moves across columns and logs TASK_MOVED', async () => {
      prisma.task.findUnique.mockResolvedValue(ownedTask({ position: 0 }));
      prisma.column.findUnique.mockResolvedValue({
        id: 'col2',
        boardId: 'b1',
        board: { userId: 'u1' },
      });
      prisma.task.count.mockResolvedValue(1);
      prisma.task.update.mockResolvedValue({
        id: 't1',
        columnId: 'col2',
        position: 1,
      });

      await service.move('u1', 't1', {
        targetColumnId: 'col2',
        position: 5,
      });

      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { id: 't1' },
        data: { columnId: 'col2', position: 1 }, // clamped to target count
      });
      expect(activities.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'TASK_MOVED' }),
      );
    });
  });
});
