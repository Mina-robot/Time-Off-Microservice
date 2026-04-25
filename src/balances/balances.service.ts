import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpsertBalanceDto } from './dto/upsert-balance.dto';
import { LeaveBalanceEntity } from './entities/leave-balance.entity';

@Injectable()
export class BalancesService {
  constructor(
    @InjectRepository(LeaveBalanceEntity)
    private readonly balancesRepository: Repository<LeaveBalanceEntity>,
  ) {}

  async getBalance(employeeId: string, locationId: string) {
    return this.balancesRepository.findOne({
      where: { employeeId, locationId },
    });
  }

  async upsertBalance(payload: UpsertBalanceDto) {
    const existing = await this.getBalance(payload.employeeId, payload.locationId);
    const next = this.balancesRepository.create({
      ...existing,
      ...payload,
      updatedAt: new Date(),
    });
    return this.balancesRepository.save(next);
  }

  async upsertMany(payload: UpsertBalanceDto[]) {
    return Promise.all(payload.map((item) => this.upsertBalance(item)));
  }
}
