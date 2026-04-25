import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { HcmBalanceDto } from './dto/hcm-balance.dto';
import { HcmReserveDto } from './dto/hcm-reserve.dto';
import { HcmMockService } from './hcm-mock.service';

@Controller('mock-hcm')
export class HcmMockController {
  constructor(private readonly hcmMockService: HcmMockService) {}

  @Get('balances/:employeeId/:locationId')
  async getBalance(
    @Param('employeeId') employeeId: string,
    @Param('locationId') locationId: string,
  ) {
    return this.hcmMockService.getBalance(employeeId, locationId);
  }

  @Post('balances/realtime')
  async realtimeUpdate(@Body() payload: HcmBalanceDto) {
    return this.hcmMockService.upsertBalance(payload);
  }

  @Post('balances/batch')
  async batchUpdate(@Body() payload: HcmBalanceDto[]) {
    return this.hcmMockService.batchUpsert(payload);
  }

  @Post('reserve')
  async reserve(@Body() payload: HcmReserveDto) {
    return this.hcmMockService.reserve(payload);
  }

  @Post('release')
  async release(@Body() payload: HcmReserveDto) {
    return this.hcmMockService.release(payload);
  }
}
