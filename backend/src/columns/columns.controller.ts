import {
  Body,
  Controller,
  Delete,
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
import { ColumnsService } from './columns.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { ReorderColumnDto } from './dto/reorder-column.dto';

@ApiTags('Columns')
@ApiBearerAuth()
@Controller('columns')
@UseGuards(JwtAuthGuard)
export class ColumnsController {
  constructor(private readonly columnsService: ColumnsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new column on a board' })
  @ApiResponse({ status: 201, description: 'Column created' })
  create(@Req() req: Request, @Body() dto: CreateColumnDto) {
    return this.columnsService.create(this.userId(req), dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a column' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Column updated' })
  update(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateColumnDto,
  ) {
    return this.columnsService.update(this.userId(req), id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a column' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Column deleted' })
  remove(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string) {
    return this.columnsService.remove(this.userId(req), id);
  }

  @Post(':id/reorder')
  @ApiOperation({ summary: 'Change the position of a column within its board' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 201, description: 'Column reordered' })
  reorder(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReorderColumnDto,
  ) {
    return this.columnsService.reorder(this.userId(req), id, dto.position);
  }

  private userId(req: Request) {
    return (req.user as { id: string }).id;
  }
}
