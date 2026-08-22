import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'John Doe', maxLength: 80 })
  @IsOptional()
  @IsString()
  @Length(1, 80)
  name?: string;
}
