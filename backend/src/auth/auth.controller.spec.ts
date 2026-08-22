import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { Request, Response } from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { googleOAuthConstants } from './contants';

function mockRes() {
  return {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
    redirect: jest.fn(),
  } as unknown as Response & {
    cookie: jest.Mock;
    clearCookie: jest.Mock;
    redirect: jest.Mock;
  };
}

describe('AuthController', () => {
  let controller: AuthController;
  let auth: Record<string, jest.Mock>;

  beforeEach(async () => {
    auth = {
      register: jest.fn(),
      login: jest.fn(),
      refresh: jest.fn(),
      logout: jest.fn(),
      me: jest.fn(),
      googleLogin: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: auth }],
    }).compile();
    controller = module.get(AuthController);
  });

  it('register sets both auth cookies and returns the service result', async () => {
    const result = {
      data: { user: { tokens: { accessToken: 'a', refreshToken: 'r' } } },
    };
    auth.register.mockResolvedValue(result);
    const res = mockRes();

    const out = await controller.register(res, {} as never, 'ip', 'agent');

    expect(out).toBe(result);
    expect(res.cookie).toHaveBeenCalledWith(
      'access_token',
      'a',
      expect.objectContaining({ httpOnly: true }),
    );
    expect(res.cookie).toHaveBeenCalledWith(
      'refresh_token',
      'r',
      expect.objectContaining({ httpOnly: true }),
    );
  });

  it('login sets cookies and returns tokens in the body', async () => {
    auth.login.mockResolvedValue({ accessToken: 'a', refreshToken: 'r' });
    const res = mockRes();

    const out = await controller.login(res, {} as never, 'ip', 'agent');

    expect(res.cookie).toHaveBeenCalledTimes(2);
    expect(out).toEqual({ data: { accessToken: 'a', refreshToken: 'r' } });
  });

  it('refresh rejects a missing refresh-token cookie', async () => {
    const res = mockRes();
    await expect(
      controller.refresh(undefined as never, res, 'ip', 'agent'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(auth.refresh).not.toHaveBeenCalled();
  });

  it('logout clears both cookies', async () => {
    auth.logout.mockResolvedValue({ message: 'ok' });
    const res = mockRes();

    await controller.logout('tok', res);

    expect(auth.logout).toHaveBeenCalledWith('tok');
    expect(res.clearCookie).toHaveBeenCalledWith(
      'access_token',
      expect.any(Object),
    );
    expect(res.clearCookie).toHaveBeenCalledWith(
      'refresh_token',
      expect.any(Object),
    );
  });

  it('google callback issues tokens and redirects to the dashboard', async () => {
    auth.googleLogin.mockResolvedValue({ accessToken: 'a', refreshToken: 'r' });
    const req = {
      user: { id: 'u1', email: 'a@b.com', name: 'A' },
    } as unknown as Request;
    const res = mockRes();

    await controller.googleAuthCallback(req, res, 'ip', 'agent');

    expect(auth.googleLogin).toHaveBeenCalledWith(req.user, 'agent', 'ip');
    expect(res.cookie).toHaveBeenCalledTimes(2);
    expect(res.redirect).toHaveBeenCalledWith(
      `${googleOAuthConstants.frontendUrl}/dashboard`,
    );
  });

  it('google callback redirects to the login error page on failure', async () => {
    auth.googleLogin.mockRejectedValue(new Error('boom'));
    const req = { user: { id: 'u1' } } as unknown as Request;
    const res = mockRes();

    await controller.googleAuthCallback(req, res, 'ip', 'agent');

    expect(res.redirect).toHaveBeenCalledWith(
      `${googleOAuthConstants.frontendUrl}/login?error=oauth`,
    );
  });

  it('me delegates to the service', () => {
    auth.me.mockReturnValue({ id: 'u1' });
    expect(controller.me('tok')).toEqual({ id: 'u1' });
    expect(auth.me).toHaveBeenCalledWith('tok');
  });
});
