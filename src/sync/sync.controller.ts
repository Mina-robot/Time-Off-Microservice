import { Body, Controller, Get, Post } from '@nestjs/common';
import { UpsertBalanceDto } from '../balances/dto/upsert-balance.dto';
import { SyncService } from './sync.service';

@Controller('sync/hcm')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post('realtime')
  async realtime(@Body() payload: UpsertBalanceDto) {
    return this.syncService.syncRealtime(payload);
  }

  @Post('batch')
  async batch(@Body() payload: UpsertBalanceDto[]) {
    return this.syncService.syncBatch(payload);
  }

  @Get('audit')
  async audit() {
    return this.syncService.getAuditTrail();
  }
}
