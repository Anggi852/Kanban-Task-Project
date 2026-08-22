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
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

@ApiTags('Boards')
@ApiBearerAuth()
@Controller('boards')
@UseGuards(JwtAuthGuard)
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new board' })
  @ApiResponse({ status: 201, description: 'Board created' })
  create(@Req() req: Request, @Body() dto: CreateBoardDto) {
    return this.boardsService.create(this.userId(req), dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all boards for the authenticated user' })
  @ApiResponse({ status: 200, description: 'List of boards' })
  findAll(@Req() req: Request) {
    return this.boardsService.findAllForUser(this.userId(req));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single board with its columns and tasks' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Board detail' })
  @ApiResponse({ status: 404, description: 'Board not found' })
  findOne(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string) {
    return this.boardsService.findOneForUser(this.userId(req), id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a board' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Board updated' })
  update(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBoardDto,
  ) {
    return this.boardsService.update(this.userId(req), id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a board' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Board deleted' })
  remove(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string) {
    return this.boardsService.remove(this.userId(req), id);
  }

  private userId(req: Request) {
    return (req.user as { id: string }).id;
  }
}
