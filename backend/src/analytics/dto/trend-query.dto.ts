import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
} from 'class-validator';

export class TrendQueryDto {
  @ApiPropertyOptional({
    minimum: 1,
    maximum: 365,
    default: 14,
    description: 'Number of days to look back',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(365)
  days?: number;

  @ApiPropertyOptional({ format: 'uuid', description: 'Filter by board ID' })
  @IsOptional()
  @IsUUID()
  boardId?: string;

  @ApiPropertyOptional({
    example: 'Asia/Jakarta',
    description: 'IANA timezone string',
  })
  @IsOptional()
  @IsString()
  @Length(1, 64)
  tz?: string;
}
