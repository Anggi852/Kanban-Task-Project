import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class CreateBoardDto {
  @ApiProperty({ example: 'My Project', maxLength: 100 })
  @IsString()
  @Length(1, 100)
  name!: string;
}
