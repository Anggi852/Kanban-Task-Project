import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';
import { SummaryQueryDto } from './dto/summary-query.dto';
import { TrendQueryDto } from './dto/trend-query.dto';

@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get task counts grouped by status' })
  @ApiResponse({ status: 200, description: 'Summary statistics' })
  summary(@Req() req: Request, @Query() query: SummaryQueryDto) {
    return this.analyticsService.summary(this.userId(req), query.boardId);
  }

  @Get('trend')
  @ApiOperation({ summary: 'Get daily task completion trend' })
  @ApiResponse({ status: 200, description: 'Trend data per day' })
  trend(@Req() req: Request, @Query() query: TrendQueryDto) {
    return this.analyticsService.trend(
      this.userId(req),
      query.days ?? 14,
      query.boardId,
      query.tz,
    );
  }

  @Get('distribution')
  @ApiOperation({ summary: 'Get task distribution by priority' })
  @ApiResponse({ status: 200, description: 'Distribution data' })
  distribution(@Req() req: Request, @Query() query: SummaryQueryDto) {
    return this.analyticsService.distribution(this.userId(req), query.boardId);
  }

  private userId(req: Request) {
    return (req.user as { id: string }).id;
  }
}
