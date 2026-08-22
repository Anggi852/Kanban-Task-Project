import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDTO } from './dto/register.dto';
import { LoginDTO } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import bcrypt from 'bcryptjs';
import 'dotenv/config';
import { jwtContants } from './contants';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtSerivce: JwtService,
  ) {}

  async register(dto: RegisterDTO, userAgent: string, ip: string) {
    const hashedPassword = await bcrypt.hash(
      dto.password,
      Number(process.env['SALT_ROUND']),
    );

    try {
      const user = await this.prisma.user.create({
        data: {
          name: dto.name,
          email: dto.email,
          password: hashedPassword,
        },
      });

      const tokens = await this.generateTokens(
        user.id,
        user.email,
        user.name,
        userAgent,
        ip,
      );

      return {
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            tokens: { ...tokens },
          },
        },
      };
    } catch (error) {
      throw new ConflictException('Duplicate data detected');
    }
  }

  async login(dto: LoginDTO, userAgent: string, ip: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    // Unified message on missing account vs wrong password to avoid email
    // enumeration. Status code is 401 so the client treats both as auth failure.
    if (!user) throw new UnauthorizedException('Invalid credentials');

    // OAuth-only accounts have no local password to compare against.
    if (!user.password) {
      throw new UnauthorizedException(
        'This account uses Google sign-in. Continue with Google.',
      );
    }

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const tokens = await this.generateTokens(
      user.id,
      user.email,
      user.name,
      userAgent,
      ip,
    );

    return {
      ...tokens,
    };
  }

  /**
   * Resolves a local user for a verified Google profile. Links to an existing
   * account by email (Google has already verified ownership), otherwise creates
   * a new password-less account.
   */
  async validateGoogleUser(profile: {
    googleId: string;
    email: string;
    name: string | null;
    avatarUrl: string | null;
  }) {
    const byGoogleId = await this.prisma.user.findUnique({
      where: { googleId: profile.googleId },
    });
    if (byGoogleId) return byGoogleId;

    const byEmail = await this.prisma.user.findUnique({
      where: { email: profile.email },
    });
    if (byEmail) {
      return this.prisma.user.update({
        where: { id: byEmail.id },
        data: {
          googleId: profile.googleId,
          avatarUrl: byEmail.avatarUrl ?? profile.avatarUrl,
          name: byEmail.name ?? profile.name,
        },
      });
    }

    return this.prisma.user.create({
      data: {
        email: profile.email,
        name: profile.name,
        provider: 'google',
        googleId: profile.googleId,
        avatarUrl: profile.avatarUrl,
      },
    });
  }

  /** Issues a token pair for an already-authenticated user (e.g. via Google). */
  async googleLogin(
    user: { id: string; email: string; name: string | null },
    userAgent: string,
    ip: string,
  ) {
    return this.generateTokens(user.id, user.email, user.name, userAgent, ip);
  }

  async refresh(refreshToken: string, userAgent: string, ip: string) {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });
    if (!stored || stored.expiresAt < new Date())
      throw new UnauthorizedException('Invalid or expired refresh token');

    await this.prisma.refreshToken.delete({ where: { token: refreshToken } });
    const user = await this.prisma.user.findUnique({
      where: { id: stored.userId },
    });

    return this.generateTokens(
      String(user?.id),
      String(user?.email),
      String(user?.name),
      userAgent,
      ip,
    );
  }

  async logout(refreshToken: string | undefined) {
    if (refreshToken) {
      await this.prisma.refreshToken.deleteMany({
        where: { token: refreshToken },
      });
    }
    return { message: 'Logged out successfully' };
  }

  async me(accessToken: string) {
    try {
      const payload = await this.jwtSerivce.verifyAsync(accessToken, {
        secret: jwtContants.secret,
      });

      const user = await this.prisma.user.findUnique({
        where: {
          id: payload.sub,
        },
        select: {
          id: true,
          email: true,
          name: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return user;
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }
  private async generateTokens(
    userId: string,
    email: string,
    userName: string | null,
    userAgent: string,
    ip: string,
  ) {
    const payload = { sub: userId, email, userName };

    const accessToken = this.jwtSerivce.sign(payload, {
      secret: jwtContants.secret,
      expiresIn: jwtContants.accessTokenTtl,
    });

    const refreshToken = this.jwtSerivce.sign(payload, {
      secret: jwtContants.secret,
      expiresIn: jwtContants.refreshTokenTtl,
    });

    const expiresAt = new Date(Date.now() + jwtContants.refreshTokenTtlMs);

    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        device: userAgent,
        ip,
        expiresAt,
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });

    return { accessToken, refreshToken };
  }
}
