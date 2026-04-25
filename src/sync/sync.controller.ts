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

@Controller('hcm')
export class HcmSyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post('batch-sync')
  async batch(
    @Body('balances')
    payload: Array<{
      employeeId: string;
      locationId: string;
      availableDays?: number;
      remainingBalance?: number;
    }>,
  ) {
    const balances: UpsertBalanceDto[] = (payload ?? []).map((item) => ({
      employeeId: item.employeeId,
      locationId: item.locationId,
      availableDays: item.availableDays ?? item.remainingBalance ?? 0,
    }));
    return this.syncService.syncBatch(balances);
  }
}
