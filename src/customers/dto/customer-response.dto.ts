import { ApiProperty } from '@nestjs/swagger';

export class CustomerResponseDto {
  @ApiProperty({ description: 'Unique customer identifier' })
  id: string;

  @ApiProperty({ description: 'Customer full name' })
  name: string;

  @ApiProperty({ description: 'Customer email address' })
  email: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}
