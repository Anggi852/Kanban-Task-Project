import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
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
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { MoveTaskDto } from './dto/move-task.dto';
import { ReorderTaskDto } from './dto/reorder-task.dto';

@ApiTags('Tasks')
@ApiBearerAuth()
@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({ status: 201, description: 'Task created' })
  create(@Req() req: Request, @Body() dto: CreateTaskDto) {
    return this.taskService.create(this.userId(req), dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a task by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Task detail' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  findOne(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string) {
    return this.taskService.findOne(this.userId(req), id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a task' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Task updated' })
  update(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.taskService.update(this.userId(req), id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a task' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Task deleted' })
  remove(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string) {
    return this.taskService.remove(this.userId(req), id);
  }

  @Post(':id/move')
  @ApiOperation({ summary: 'Move a task to a different column' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 201, description: 'Task moved' })
  move(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: MoveTaskDto,
  ) {
    return this.taskService.move(this.userId(req), id, dto);
  }

  @Post(':id/reorder')
  @ApiOperation({ summary: 'Change the position of a task within its column' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 201, description: 'Task reordered' })
  reorder(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReorderTaskDto,
  ) {
    return this.taskService.reorder(this.userId(req), id, dto.position);
  }

  private userId(req: Request) {
    return (req.user as { id: string }).id;
  }
}
