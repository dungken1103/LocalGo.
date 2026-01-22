import {
  Controller,
  Get,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ContractService } from './contract.service';
import { GetContractDto, GetContractResponseDto } from './dto/contract.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Contract')
@ApiBearerAuth()
@Controller('contract')
export class ContractController {
  constructor(private readonly contractService: ContractService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get contract details',
    description:
      'Retrieve detailed contract information including booking, car, users, and transaction history. Query by either contract ID or slug.',
  })
  @ApiResponse({
    status: 200,
    description: 'Contract retrieved successfully',
    type: GetContractResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid request parameters or missing required fields',
    schema: {
      example: {
        statusCode: 400,
        message: 'Either contractId or slug must be provided',
        error: 'Bad Request',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Contract not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Contract not found with ID: xxx',
        error: 'Not Found',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async getContract(
    @Query() dto: GetContractDto,
  ): Promise<GetContractResponseDto> {
    return this.contractService.getContract(dto);
  }
}
