import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { BoardsService } from './boards.service';
import { PrismaService } from '../prisma/prisma.service';
import { createPrismaMock, PrismaMock } from '../test/prisma.mock';
import { describe, beforeEach, it, expect } from '@jest/globals'; // TAMBAHKAN BARIS INI
describe('BoardsService', () => {
  let service: BoardsService;
  let prisma: PrismaMock;

  beforeEach(async () => {
    prisma = createPrismaMock();
    const module: TestingModule = await Test.createTestingModule({
      providers: [BoardsService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get(BoardsService);
  });

  describe('create', () => {
    it('creates a board with the three default columns', async () => {
      prisma.board.create.mockResolvedValue({ id: 'b1' });
      await service.create('u1', { name: 'My board' });

      const arg = prisma.board.create.mock.calls[0][0];
      expect(arg.data).toMatchObject({ name: 'My board', userId: 'u1' });
      expect(arg.data.columns.create).toHaveLength(3);
      expect(arg.data.columns.create.map((c: any) => c.type)).toEqual([
        'TODO',
        'IN_PROGRESS',
        'DONE',
      ]);
    });
  });

  describe('findOneForUser', () => {
    it('throws NotFound when the board does not exist', async () => {
      prisma.board.findUnique.mockResolvedValue(null);
      await expect(service.findOneForUser('u1', 'b1')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('throws Forbidden when owned by another user', async () => {
      prisma.board.findUnique.mockResolvedValue({ id: 'b1', userId: 'other' });
      await expect(service.findOneForUser('u1', 'b1')).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });

    it('returns the board for the owner', async () => {
      const board = { id: 'b1', userId: 'u1', columns: [] };
      prisma.board.findUnique.mockResolvedValue(board);
      await expect(service.findOneForUser('u1', 'b1')).resolves.toBe(board);
    });
  });

  describe('update', () => {
    it('checks ownership before updating', async () => {
      prisma.board.findUnique.mockResolvedValue({ userId: 'other' });
      await expect(
        service.update('u1', 'b1', { name: 'x' }),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(prisma.board.update).not.toHaveBeenCalled();
    });

    it('updates the name for the owner', async () => {
      prisma.board.findUnique.mockResolvedValue({ userId: 'u1' });
      prisma.board.update.mockResolvedValue({ id: 'b1', name: 'x' });
      await service.update('u1', 'b1', { name: 'x' });
      expect(prisma.board.update).toHaveBeenCalledWith({
        where: { id: 'b1' },
        data: { name: 'x' },
      });
    });
  });

  describe('remove', () => {
    it('deletes the board for the owner', async () => {
      prisma.board.findUnique.mockResolvedValue({ userId: 'u1' });
      const result = await service.remove('u1', 'b1');
      expect(prisma.board.delete).toHaveBeenCalledWith({ where: { id: 'b1' } });
      expect(result).toEqual({ id: 'b1', deleted: true });
    });

    it('refuses to delete a board owned by someone else', async () => {
      prisma.board.findUnique.mockResolvedValue({ userId: 'other' });
      await expect(service.remove('u1', 'b1')).rejects.toBeInstanceOf(
        ForbiddenException,
      );
      expect(prisma.board.delete).not.toHaveBeenCalled();
    });
  });
});
