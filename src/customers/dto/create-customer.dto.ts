import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty({ description: 'Customer full name', example: 'Alice Johnson' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Customer email address', example: 'alice@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
