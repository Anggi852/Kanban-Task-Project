import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID, Length } from 'class-validator';
import { ColumnType } from '../../generated/prisma/enums';

export class CreateColumnDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  boardId: string;

  @ApiProperty({ example: 'In Progress', maxLength: 50 })
  @IsString()
  @Length(1, 50)
  name: string;

  @ApiPropertyOptional({ enum: ColumnType, enumName: 'ColumnType' })
  @IsOptional()
  @IsEnum(ColumnType)
  type?: ColumnType;
}
