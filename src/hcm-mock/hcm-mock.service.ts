import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HcmBalanceDto } from './dto/hcm-balance.dto';
import { HcmReserveDto } from './dto/hcm-reserve.dto';
import { HcmBalanceEntity } from './entities/hcm-balance.entity';

@Injectable()
export class HcmMockService {
  constructor(
    @InjectRepository(HcmBalanceEntity)
    private readonly hcmRepository: Repository<HcmBalanceEntity>,
  ) {}

  async getBalance(employeeId: string, locationId: string) {
    const balance = await this.hcmRepository.findOne({
      where: { employeeId, locationId },
    });
    if (!balance) {
      throw new NotFoundException('HCM balance not found');
    }
    return balance;
  }

  async upsertBalance(payload: HcmBalanceDto) {
    const existing = await this.hcmRepository.findOne({
      where: { employeeId: payload.employeeId, locationId: payload.locationId },
    });
    const next = this.hcmRepository.create({
      ...existing,
      ...payload,
      updatedAt: new Date(),
    });
    return this.hcmRepository.save(next);
  }

  async batchUpsert(payload: HcmBalanceDto[]) {
    return Promise.all(payload.map((item) => this.upsertBalance(item)));
  }

  async resetBalances(
    balances: Array<{
      employeeId: string;
      locationId: string;
      remainingBalance: number;
    }>,
  ) {
    await this.hcmRepository.clear();
    return Promise.all(
      balances.map((item) =>
        this.upsertBalance({
          employeeId: item.employeeId,
          locationId: item.locationId,
          availableDays: item.remainingBalance,
        }),
      ),
    );
  }

  async snapshot() {
    return this.hcmRepository.find({
      order: { employeeId: 'ASC', locationId: 'ASC' },
    });
  }

  async reserve(payload: HcmReserveDto) {
    const balance = await this.getBalance(payload.employeeId, payload.locationId);
    if (balance.availableDays < payload.days) {
      throw new BadRequestException('Insufficient HCM balance');
    }
    balance.availableDays -= payload.days;
    balance.updatedAt = new Date();
    return this.hcmRepository.save(balance);
  }

  async release(payload: HcmReserveDto) {
    const balance = await this.getBalance(payload.employeeId, payload.locationId);
    balance.availableDays += payload.days;
    balance.updatedAt = new Date();
    return this.hcmRepository.save(balance);
  }
}
