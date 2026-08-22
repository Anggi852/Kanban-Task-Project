import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  @Length(1, 200)
  currentPassword: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @Length(8, 200)
  newPassword: string;
}
