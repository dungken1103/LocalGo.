import { ApiProperty } from '@nestjs/swagger';

export class ApiSuccessResponse<T> {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Status code',
    example: 200,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Success message',
    example: 'Operation completed successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Response data',
  })
  data: T;

  @ApiProperty({
    description: 'Timestamp',
    example: '2023-01-01T00:00:00.000Z',
  })
  timestamp: string;

  constructor(data: T, message: string = 'Success', statusCode: number = 200) {
    this.success = true;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.timestamp = new Date().toISOString();
  }
}

export class ApiErrorResponse {
  @ApiProperty({
    description: 'Success status',
    example: false,
  })
  success: boolean;

  @ApiProperty({
    description: 'Error status code',
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Error message',
    example: 'Bad Request',
  })
  message: string;

  @ApiProperty({
    description: 'Detailed error information',
    example: 'Validation failed',
    required: false,
  })
  error?: string;

  @ApiProperty({
    description: 'Timestamp',
    example: '2023-01-01T00:00:00.000Z',
  })
  timestamp: string;

  constructor(message: string, statusCode: number = 400, error?: string) {
    this.success = false;
    this.statusCode = statusCode;
    this.message = message;
    this.error = error;
    this.timestamp = new Date().toISOString();
  }
}

export class PaginationResponse {
  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: 'Total number of items',
    example: 100,
  })
  total: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 10,
  })
  totalPages: number;

  @ApiProperty({
    description: 'Whether there is a next page',
    example: true,
  })
  hasNext: boolean;

  @ApiProperty({
    description: 'Whether there is a previous page',
    example: false,
  })
  hasPrev: boolean;

  constructor(page: number, limit: number, total: number) {
    this.page = page;
    this.limit = limit;
    this.total = total;
    this.totalPages = Math.ceil(total / limit);
    this.hasNext = page < this.totalPages;
    this.hasPrev = page > 1;
  }
}

export class ApiPaginatedResponse<T> {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Status code',
    example: 200,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Success message',
    example: 'Data retrieved successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Response data array',
  })
  data: T[];

  @ApiProperty({
    description: 'Pagination information',
    type: PaginationResponse,
  })
  pagination: PaginationResponse;

  @ApiProperty({
    description: 'Timestamp',
    example: '2023-01-01T00:00:00.000Z',
  })
  timestamp: string;

  constructor(data: T[], pagination: PaginationResponse, message: string = 'Data retrieved successfully') {
    this.success = true;
    this.statusCode = 200;
    this.message = message;
    this.data = data;
    this.pagination = pagination;
    this.timestamp = new Date().toISOString();
  }
}
