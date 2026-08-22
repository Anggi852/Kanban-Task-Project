import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { createPrismaMock, PrismaMock } from '../test/prisma.mock';

jest.mock('bcryptjs', () => ({
  hash: jest.fn(async () => 'hashed-pw'),
  compare: jest.fn(async () => true),
}));
import bcrypt from 'bcryptjs';

const hash = bcrypt.hash as jest.Mock;
const compare = bcrypt.compare as jest.Mock;

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaMock;
  let jwt: { sign: jest.Mock; verifyAsync: jest.Mock };

  beforeEach(async () => {
    process.env.SALT_ROUND = '10';
    prisma = createPrismaMock();
    jwt = { sign: jest.fn(() => 'token'), verifyAsync: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwt },
      ],
    }).compile();

    service = module.get(AuthService);
    hash.mockClear();
    compare.mockClear();
    hash.mockResolvedValue('hashed-pw');
    compare.mockResolvedValue(true);
  });

  describe('register', () => {
    it('hashes the password, creates the user and returns tokens', async () => {
      prisma.user.create.mockResolvedValue({
        id: 'u1',
        email: 'a@b.com',
        name: 'A',
      });

      const result = await service.register(
        { name: 'A', email: 'a@b.com', password: 'plain' },
        'agent',
        '1.1.1.1',
      );

      expect(hash).toHaveBeenCalledWith('plain', 10);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: { name: 'A', email: 'a@b.com', password: 'hashed-pw' },
      });
      expect(prisma.refreshToken.create).toHaveBeenCalled();
      expect(result.data.user).toMatchObject({
        id: 'u1',
        email: 'a@b.com',
        tokens: { accessToken: 'token', refreshToken: 'token' },
      });
    });

    it('throws ConflictException on duplicate', async () => {
      prisma.user.create.mockRejectedValue(new Error('unique'));
      await expect(
        service.register(
          { email: 'a@b.com', password: 'x' } as never,
          'a',
          'i',
        ),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('login', () => {
    it('throws when the email is unknown', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(
        service.login({ email: 'x@y.com', password: 'p' }, 'a', 'i'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rejects OAuth-only accounts (null password)', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'g@x.com',
        password: null,
      });
      await expect(
        service.login({ email: 'g@x.com', password: 'p' }, 'a', 'i'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(compare).not.toHaveBeenCalled();
    });

    it('rejects an invalid password', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'a@b.com',
        password: 'hash',
      });
      compare.mockResolvedValue(false);
      await expect(
        service.login({ email: 'a@b.com', password: 'wrong' }, 'a', 'i'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('returns tokens on success', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'a@b.com',
        name: 'A',
        password: 'hash',
      });
      const result = await service.login(
        { email: 'a@b.com', password: 'right' },
        'a',
        'i',
      );
      expect(result).toEqual({ accessToken: 'token', refreshToken: 'token' });
      expect(prisma.refreshToken.create).toHaveBeenCalled();
    });
  });

  describe('validateGoogleUser', () => {
    const profile = {
      googleId: 'g1',
      email: 'a@b.com',
      name: 'A',
      avatarUrl: 'pic',
    };

    it('returns the existing user matched by googleId', async () => {
      prisma.user.findUnique.mockResolvedValueOnce({
        id: 'u1',
        googleId: 'g1',
      });
      const user = await service.validateGoogleUser(profile);
      expect(user).toEqual({ id: 'u1', googleId: 'g1' });
      expect(prisma.user.update).not.toHaveBeenCalled();
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('links to an existing account matched by email', async () => {
      prisma.user.findUnique
        .mockResolvedValueOnce(null) // by googleId
        .mockResolvedValueOnce({
          id: 'u1',
          email: 'a@b.com',
          name: null,
          avatarUrl: null,
        }); // by email
      prisma.user.update.mockResolvedValue({ id: 'u1', googleId: 'g1' });

      await service.validateGoogleUser(profile);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: { googleId: 'g1', avatarUrl: 'pic', name: 'A' },
      });
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('creates a new password-less account when nothing matches', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({ id: 'u2' });

      await service.validateGoogleUser(profile);

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'a@b.com',
          name: 'A',
          provider: 'google',
          googleId: 'g1',
          avatarUrl: 'pic',
        },
      });
    });
  });

  describe('refresh', () => {
    it('rejects a missing or expired token', async () => {
      prisma.refreshToken.findUnique.mockResolvedValue(null);
      await expect(service.refresh('tok', 'a', 'i')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );

      prisma.refreshToken.findUnique.mockResolvedValue({
        userId: 'u1',
        expiresAt: new Date(Date.now() - 1000),
      });
      await expect(service.refresh('tok', 'a', 'i')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('rotates the token (deletes old, issues new pair)', async () => {
      prisma.refreshToken.findUnique.mockResolvedValue({
        userId: 'u1',
        expiresAt: new Date(Date.now() + 100000),
      });
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'a@b.com',
        name: 'A',
      });

      const result = await service.refresh('old', 'a', 'i');

      expect(prisma.refreshToken.delete).toHaveBeenCalledWith({
        where: { token: 'old' },
      });
      expect(result).toEqual({ accessToken: 'token', refreshToken: 'token' });
    });
  });

  describe('logout', () => {
    it('deletes the refresh token when present', async () => {
      await service.logout('tok');
      expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { token: 'tok' },
      });
    });

    it('is a no-op when no token is given', async () => {
      await service.logout(undefined);
      expect(prisma.refreshToken.deleteMany).not.toHaveBeenCalled();
    });
  });

  describe('me', () => {
    it('returns the user for a valid token', async () => {
      jwt.verifyAsync.mockResolvedValue({ sub: 'u1' });
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'a@b.com',
        name: 'A',
      });
      await expect(service.me('tok')).resolves.toEqual({
        id: 'u1',
        email: 'a@b.com',
        name: 'A',
      });
    });

    it('throws when the token is invalid', async () => {
      jwt.verifyAsync.mockRejectedValue(new Error('bad'));
      await expect(service.me('tok')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('throws when the user no longer exists', async () => {
      jwt.verifyAsync.mockResolvedValue({ sub: 'gone' });
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.me('tok')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });
  });
});
