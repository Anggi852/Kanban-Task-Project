import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';
import { TaskPriority } from '../../generated/prisma/enums';

export class CreateTaskDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  columnId: string;

  @ApiProperty({ example: 'Implement login page', maxLength: 200 })
  @IsString()
  @Length(1, 200)
  title: string;

  @ApiPropertyOptional({
    example: 'Implement OAuth and local login',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @Length(0, 2000)
  description?: string;

  @ApiPropertyOptional({ enum: TaskPriority, enumName: 'TaskPriority' })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiPropertyOptional({ example: '2024-12-31T23:59:59.000Z' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
