import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard';
import { ActivitiesService } from './activities.service';

@ApiTags('Activities')
@ApiBearerAuth()
@Controller('boards/:boardId/activities')
@UseGuards(JwtAuthGuard)
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Get()
  @ApiOperation({ summary: 'List activity log for a board' })
  @ApiParam({ name: 'boardId', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Activity list' })
  list(@Req() req: Request, @Param('boardId', ParseUUIDPipe) boardId: string) {
    const userId = (req.user as { id: string }).id;
    return this.activitiesService.listForBoard(userId, boardId);
  }
}
