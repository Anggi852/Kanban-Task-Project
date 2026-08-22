import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class SummaryQueryDto {
  @ApiPropertyOptional({ format: 'uuid', description: 'Filter by board ID' })
  @IsOptional()
  @IsUUID()
  boardId?: string;
}
