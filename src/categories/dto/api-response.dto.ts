import { ApiProperty } from '@nestjs/swagger';

export class ApiSuccessResponse<T> {
  @ApiProperty({
    description: 'Request success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Success message',
    example: 'Operation completed successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Response data',
  })
  data: T;

  constructor(message: string, data: T) {
    this.success = true;
    this.message = message;
    this.data = data;
  }
}

export class ApiErrorResponse {
  @ApiProperty({
    description: 'Request success status',
    example: false,
  })
  success: boolean;

  @ApiProperty({
    description: 'Error message',
    example: 'An error occurred',
  })
  message: string;

  @ApiProperty({
    description: 'Error details (optional)',
    required: false,
  })
  error?: string;

  @ApiProperty({
    description: 'HTTP status code',
    example: 400,
  })
  statusCode: number;

  constructor(message: string, statusCode: number, error?: string) {
    this.success = false;
    this.message = message;
    this.statusCode = statusCode;
    this.error = error;
  }
}