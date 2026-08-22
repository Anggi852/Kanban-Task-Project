import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { ColumnType } from '../../generated/prisma/enums';

export class UpdateColumnDto {
  @ApiPropertyOptional({ example: 'In Review', maxLength: 50 })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  name?: string;

  @ApiPropertyOptional({ enum: ColumnType, enumName: 'ColumnType' })
  @IsOptional()
  @IsEnum(ColumnType)
  type?: ColumnType;
}
