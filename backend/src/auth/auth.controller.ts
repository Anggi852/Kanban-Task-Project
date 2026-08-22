import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Ip,
  Headers,
  Res,
  Get,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
  ApiExcludeEndpoint,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDTO } from './dto/login.dto';
import { RegisterDTO } from './dto/register.dto';
import type { Request, Response } from 'express';
import { RefreshDto } from './dto/refresh.dto';
import { Cookie } from './decorator/cookie.decorator';
import { googleOAuthConstants } from './contants';

const ACCESS_TOKEN_MAX_AGE = 15 * 60 * 1000;
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User registered, tokens set as cookies',
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async register(
    @Res({ passthrough: true }) res: Response,
    @Body() dto: RegisterDTO,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const result = await this.authService.register(dto, userAgent, ip);
    this.setAuthCookies(res, result.data.user.tokens);
    return result;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in and receive tokens' })
  @ApiResponse({
    status: 200,
    description: 'Login successful, tokens returned and set as cookies',
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Res({ passthrough: true }) res: Response,
    @Body() dto: LoginDTO,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const { refreshToken, accessToken } = await this.authService.login(
      dto,
      userAgent,
      ip,
    );

    this.setAuthCookies(res, { accessToken, refreshToken });

    return {
      data: {
        accessToken,
        refreshToken,
      },
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiCookieAuth('refresh_token')
  @ApiOperation({ summary: 'Rotate refresh token using refresh_token cookie' })
  @ApiResponse({ status: 202, description: 'New token pair issued' })
  @ApiResponse({ status: 401, description: 'Missing or invalid refresh token' })
  async refresh(
    @Cookie('refresh_token') getRefreshToken: string,
    @Res({ passthrough: true }) res: Response,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    if (!getRefreshToken)
      throw new UnauthorizedException('Refresh token missing');

    const { refreshToken, accessToken } = await this.authService.refresh(
      getRefreshToken,
      userAgent,
      ip,
    );

    this.setAuthCookies(res, { accessToken, refreshToken });

    return {
      data: {
        accessToken,
        refreshToken,
      },
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth('refresh_token')
  @ApiOperation({ summary: 'Log out and clear auth cookies' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  async logout(
    @Cookie('refresh_token') refreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.logout(refreshToken);

    const cookieOptions = {
      httpOnly: true,
      sameSite: 'lax' as const,
      path: '/',
    };
    res.clearCookie('access_token', cookieOptions);
    res.clearCookie('refresh_token', cookieOptions);

    return result;
  }

  @Get('me')
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Get current user from access_token cookie' })
  @ApiResponse({ status: 200, description: 'Current user data' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  me(@Cookie('access_token') accessToken: string) {
    return this.authService.me(accessToken);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Start Google OAuth login (redirects to Google)' })
  // The guard redirects to Google; this handler is never actually reached.
  googleAuth() {
    return;
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiExcludeEndpoint()
  async googleAuthCallback(
    @Req() req: Request,
    @Res() res: Response,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    try {
      const user = req.user as {
        id: string;
        email: string;
        name: string | null;
      };
      const tokens = await this.authService.googleLogin(user, userAgent, ip);
      this.setAuthCookies(res, tokens);
      res.redirect(`${googleOAuthConstants.frontendUrl}/dashboard`);
    } catch {
      res.redirect(`${googleOAuthConstants.frontendUrl}/login?error=oauth`);
    }
  }

  private setAuthCookies(
    res: Response,
    tokens: { accessToken: string; refreshToken: string },
  ) {
    res.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: ACCESS_TOKEN_MAX_AGE,
    });
    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: REFRESH_TOKEN_MAX_AGE,
    });
  }
}
