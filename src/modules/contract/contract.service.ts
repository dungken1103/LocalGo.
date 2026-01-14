import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { GetContractDto, GetContractResponseDto } from './dto/contract.dto';

@Injectable()
export class ContractService {
  private readonly logger = new Logger(ContractService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Get contract by ID or slug
   * @param dto - Query parameters containing contractId or slug
   * @returns Contract details with related booking, car, users, and transactions
   * @throws BadRequestException if neither contractId nor slug is provided
   * @throws NotFoundException if contract is not found
   */
  async getContract(dto: GetContractDto): Promise<GetContractResponseDto> {
    // Validate input
    if (!dto.contractId && !dto.slug) {
      this.logger.warn('Contract query attempted without ID or slug');
      throw new BadRequestException(
        'Either contractId or slug must be provided',
      );
    }

    this.logger.log(
      `Fetching contract: ${dto.contractId ? `ID=${dto.contractId}` : `slug=${dto.slug}`}`,
    );

    try {
      // Build where clause dynamically
      const whereClause: any = { OR: [] };

      if (dto.contractId) {
        whereClause.OR.push({ id: dto.contractId });
      }

      if (dto.slug) {
        whereClause.OR.push({ slug: dto.slug });
      }

      const contract = await this.prisma.contract.findFirst({
        where: whereClause,
        include: {
          booking: {
            include: {
              car: {
                select: {
                  id: true,
                  slug: true,
                  brand: true,
                  name: true,
                  color: true,
                  type: true,
                  seats: true,
                  driveType: true,
                  pricePerDay: true,
                },
              },
            },
          },
          renter: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          transactions: {
            select: {
              id: true,
              amount: true,
              type: true,
              status: true,
              createdAt: true,
              confirmedAt: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });

      if (!contract) {
        this.logger.warn(
          `Contract not found: ${dto.contractId ? `ID=${dto.contractId}` : `slug=${dto.slug}`}`,
        );
        throw new NotFoundException(
          `Contract not found with ${dto.contractId ? 'ID' : 'slug'}: ${dto.contractId || dto.slug}`,
        );
      }

      this.logger.log(`Contract retrieved successfully: ${contract.id}`);

      return {
        success: true,
        data: contract as any,
        message: 'Contract retrieved successfully',
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error(`Error fetching contract: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to retrieve contract');
    }
  }
}
