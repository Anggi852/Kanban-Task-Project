import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { createPrismaMock, PrismaMock } from '../test/prisma.mock';

jest.mock('bcryptjs', () => ({
  hash: jest.fn(async () => 'new-hash'),
  compare: jest.fn(async () => true),
}));
import bcrypt from 'bcryptjs';

const compare = bcrypt.compare as jest.Mock;

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaMock;

  beforeEach(async () => {
    prisma = createPrismaMock();
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get(UsersService);
    compare.mockReset();
    compare.mockResolvedValue(true);
  });

  describe('findById', () => {
    it('returns the user when found', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'a@b.com',
        name: 'A',
      });
      await expect(service.findById('u1')).resolves.toMatchObject({ id: 'u1' });
    });

    it('throws NotFound when missing', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.findById('x')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('updateProfile', () => {
    it('updates the trimmed name', async () => {
      prisma.user.update.mockResolvedValue({ id: 'u1', name: 'New' });
      await service.updateProfile('u1', { name: '  New  ' });
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'u1' }, data: { name: 'New' } }),
      );
    });

    it('skips the update when there is nothing to change', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'a@b.com',
        name: 'A',
      });
      await service.updateProfile('u1', {});
      expect(prisma.user.update).not.toHaveBeenCalled();
      expect(prisma.user.findUnique).toHaveBeenCalled();
    });
  });

  describe('changePassword', () => {
    const dto = { currentPassword: 'old', newPassword: 'brand-new' } as never;

    it('throws NotFound when the user is missing', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.changePassword('x', dto)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('rejects OAuth-only accounts without a password', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', password: null });
      await expect(service.changePassword('u1', dto)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(compare).not.toHaveBeenCalled();
    });

    it('rejects an incorrect current password', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', password: 'hash' });
      compare.mockResolvedValue(false);
      await expect(service.changePassword('u1', dto)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('rejects reusing the same password', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', password: 'hash' });
      await expect(
        service.changePassword('u1', {
          currentPassword: 'same',
          newPassword: 'same',
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('hashes the new password and revokes refresh tokens', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', password: 'hash' });
      const result = await service.changePassword('u1', dto);
      expect(result).toEqual({ changed: true });
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: { password: 'new-hash' },
      });
      expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'u1' },
      });
    });
  });
});
