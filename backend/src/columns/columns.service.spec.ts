import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ColumnsService } from './columns.service';
import { PrismaService } from '../prisma/prisma.service';
import { createPrismaMock, PrismaMock } from '../test/prisma.mock';

describe('ColumnsService', () => {
  let service: ColumnsService;
  let prisma: PrismaMock;

  beforeEach(async () => {
    prisma = createPrismaMock();
    const module: TestingModule = await Test.createTestingModule({
      providers: [ColumnsService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get(ColumnsService);
  });

  describe('create', () => {
    it('rejects creating on a board owned by another user', async () => {
      prisma.board.findUnique.mockResolvedValue({ userId: 'other' });
      await expect(
        service.create('u1', { boardId: 'b1', name: 'Todo' }),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('appends the column at the end (position = count) with default type', async () => {
      prisma.board.findUnique.mockResolvedValue({ userId: 'u1' });
      prisma.column.count.mockResolvedValue(2);
      prisma.column.create.mockResolvedValue({ id: 'c1' });

      await service.create('u1', { boardId: 'b1', name: 'Backlog' });

      expect(prisma.column.create).toHaveBeenCalledWith({
        data: { boardId: 'b1', name: 'Backlog', type: 'TODO', position: 2 },
      });
    });
  });

  describe('update', () => {
    it('throws NotFound when the column is missing', async () => {
      prisma.column.findUnique.mockResolvedValue(null);
      await expect(
        service.update('u1', 'c1', { name: 'x' }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('updates name and type for the owner', async () => {
      prisma.column.findUnique.mockResolvedValue({
        id: 'c1',
        board: { userId: 'u1' },
      });
      prisma.column.update.mockResolvedValue({ id: 'c1' });
      await service.update('u1', 'c1', {
        name: 'Doing',
        type: 'IN_PROGRESS',
      } as never);
      expect(prisma.column.update).toHaveBeenCalledWith({
        where: { id: 'c1' },
        data: { name: 'Doing', type: 'IN_PROGRESS' },
      });
    });
  });

  describe('remove', () => {
    it('deletes and compacts positions of later columns', async () => {
      prisma.column.findUnique.mockResolvedValue({
        id: 'c1',
        boardId: 'b1',
        position: 1,
        board: { userId: 'u1' },
      });
      const result = await service.remove('u1', 'c1');

      expect(prisma.column.delete).toHaveBeenCalledWith({
        where: { id: 'c1' },
      });
      expect(prisma.column.updateMany).toHaveBeenCalledWith({
        where: { boardId: 'b1', position: { gt: 1 } },
        data: { position: { decrement: 1 } },
      });
      expect(result).toEqual({ id: 'c1', deleted: true });
    });
  });

  describe('reorder', () => {
    function ownedColumn(position: number) {
      return { id: 'c1', boardId: 'b1', position, board: { userId: 'u1' } };
    }

    it('is a no-op when the target equals the current position', async () => {
      prisma.column.findUnique.mockResolvedValue(ownedColumn(1));
      prisma.column.count.mockResolvedValue(3);
      await service.reorder('u1', 'c1', 1);
      expect(prisma.column.updateMany).not.toHaveBeenCalled();
      expect(prisma.column.update).not.toHaveBeenCalled();
    });

    it('shifts columns down when moving to a higher position', async () => {
      prisma.column.findUnique.mockResolvedValue(ownedColumn(0));
      prisma.column.count.mockResolvedValue(3);
      prisma.column.update.mockResolvedValue({ id: 'c1', position: 2 });

      await service.reorder('u1', 'c1', 2);

      expect(prisma.column.updateMany).toHaveBeenCalledWith({
        where: { boardId: 'b1', position: { gt: 0, lte: 2 } },
        data: { position: { decrement: 1 } },
      });
      expect(prisma.column.update).toHaveBeenCalledWith({
        where: { id: 'c1' },
        data: { position: 2 },
      });
    });

    it('clamps an out-of-range target to the last index', async () => {
      prisma.column.findUnique.mockResolvedValue(ownedColumn(0));
      prisma.column.count.mockResolvedValue(3); // valid range 0..2
      prisma.column.update.mockResolvedValue({ id: 'c1', position: 2 });

      await service.reorder('u1', 'c1', 99);

      expect(prisma.column.update).toHaveBeenCalledWith({
        where: { id: 'c1' },
        data: { position: 2 },
      });
    });
  });
});
