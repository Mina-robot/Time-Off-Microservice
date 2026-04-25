import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { LeaveBalanceEntity } from '../balances/entities/leave-balance.entity';
import { TimeOffRequestStatus } from '../common/enums/time-off-request-status.enum';
import { HcmMockService } from '../hcm-mock/hcm-mock.service';
import { CreateTimeOffRequestDto } from './dto/create-time-off-request.dto';
import { ReviewTimeOffRequestDto } from './dto/review-time-off-request.dto';
import { TimeOffRequestEntity } from './entities/time-off-request.entity';

@Injectable()
export class TimeOffService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly hcmMockService: HcmMockService,
    @InjectRepository(TimeOffRequestEntity)
    private readonly requestRepository: Repository<TimeOffRequestEntity>,
    @InjectRepository(LeaveBalanceEntity)
    private readonly balanceRepository: Repository<LeaveBalanceEntity>,
  ) {}

  async createRequest(payload: CreateTimeOffRequestDto) {
    const balance = await this.balanceRepository.findOne({
      where: {
        employeeId: payload.employeeId,
        locationId: payload.locationId,
      },
    });

    if (!balance) {
      throw new NotFoundException('No local balance found for employee/location');
    }

    if (balance.availableDays < payload.daysRequested) {
      throw new BadRequestException('Insufficient local balance');
    }

    await this.hcmMockService.reserve({
      employeeId: payload.employeeId,
      locationId: payload.locationId,
      days: payload.daysRequested,
    });

    try {
      return await this.dataSource.transaction(async (manager) => {
        balance.availableDays -= payload.daysRequested;
        balance.updatedAt = new Date();
        await manager.save(balance);

        const request = manager.create(TimeOffRequestEntity, {
          ...payload,
          status: TimeOffRequestStatus.PENDING,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        return manager.save(request);
      });
    } catch (error) {
      await this.hcmMockService.release({
        employeeId: payload.employeeId,
        locationId: payload.locationId,
        days: payload.daysRequested,
      });
      throw error;
    }
  }

  async listRequests() {
    return this.requestRepository.find({ order: { createdAt: 'DESC' } });
  }

  async approveRequest(id: string, payload: ReviewTimeOffRequestDto) {
    const request = await this.findRequestOrThrow(id);
    if (request.status !== TimeOffRequestStatus.PENDING) {
      throw new BadRequestException('Request is not pending');
    }
    request.status = TimeOffRequestStatus.APPROVED;
    request.managerComment = payload.managerComment;
    request.updatedAt = new Date();
    return this.requestRepository.save(request);
  }

  async rejectRequest(id: string, payload: ReviewTimeOffRequestDto) {
    const request = await this.findRequestOrThrow(id);
    if (request.status !== TimeOffRequestStatus.PENDING) {
      throw new BadRequestException('Request is not pending');
    }

    const balance = await this.balanceRepository.findOne({
      where: {
        employeeId: request.employeeId,
        locationId: request.locationId,
      },
    });
    if (!balance) {
      throw new NotFoundException('No local balance found for employee/location');
    }

    await this.dataSource.transaction(async (manager) => {
      request.status = TimeOffRequestStatus.REJECTED;
      request.managerComment = payload.managerComment;
      request.updatedAt = new Date();
      await manager.save(request);

      balance.availableDays += request.daysRequested;
      balance.updatedAt = new Date();
      await manager.save(balance);
    });

    await this.hcmMockService.release({
      employeeId: request.employeeId,
      locationId: request.locationId,
      days: request.daysRequested,
    });

    return this.findRequestOrThrow(id);
  }

  private async findRequestOrThrow(id: string) {
    const request = await this.requestRepository.findOne({ where: { id } });
    if (!request) {
      throw new NotFoundException('Time-off request not found');
    }
    return request;
  }
}
