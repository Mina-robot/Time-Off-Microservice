import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BalancesService } from '../balances/balances.service';
import { UpsertBalanceDto } from '../balances/dto/upsert-balance.dto';
import { SyncEventEntity } from './entities/sync-event.entity';

@Injectable()
export class SyncService {
  constructor(
    private readonly balancesService: BalancesService,
    @InjectRepository(SyncEventEntity)
    private readonly syncEventRepository: Repository<SyncEventEntity>,
  ) {}

  async syncRealtime(payload: UpsertBalanceDto) {
    const result = await this.balancesService.upsertBalance(payload);
    await this.logEvent('HCM', 'REALTIME', payload);
    return result;
  }

  async syncBatch(payload: UpsertBalanceDto[]) {
    const result = await this.balancesService.upsertMany(payload);
    await this.logEvent('HCM', 'BATCH', payload);
    return result;
  }

  async getAuditTrail() {
    return this.syncEventRepository.find({
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  private async logEvent(source: string, operation: string, payload: unknown) {
    const event = this.syncEventRepository.create({
      source,
      operation,
      payload: JSON.stringify(payload),
      createdAt: new Date(),
    });
    await this.syncEventRepository.save(event);
  }
}
