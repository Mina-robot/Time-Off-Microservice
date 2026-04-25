import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { HcmBalanceDto } from './dto/hcm-balance.dto';
import { HcmReserveDto } from './dto/hcm-reserve.dto';
import { HcmMockService } from './hcm-mock.service';

@Controller('mock-hcm')
export class HcmMockController {
  constructor(private readonly hcmMockService: HcmMockService) {}

  @Get('balances/:employeeId')
  async getBalance(
    @Param('employeeId') employeeId: string,
    @Query('locationId') locationId: string,
  ) {
    return this.hcmMockService.getBalance(employeeId, locationId);
  }

  @Post('reset')
  async reset(
    @Body()
    payload: {
      balances: Array<{
        employeeId: string;
        locationId: string;
        remainingBalance: number;
      }>;
    },
  ) {
    return this.hcmMockService.resetBalances(payload.balances ?? []);
  }

  @Post('batch-sync')
  async batchSync(
    @Body()
    payload: {
      balances: Array<{
        employeeId: string;
        locationId: string;
        remainingBalance: number;
      }>;
    },
  ) {
    const balances: HcmBalanceDto[] = (payload.balances ?? []).map((item) => ({
      employeeId: item.employeeId,
      locationId: item.locationId,
      availableDays: item.remainingBalance,
    }));
    return this.hcmMockService.batchUpsert(balances);
  }

  @Post('deduct')
  async deduct(@Body() payload: HcmReserveDto) {
    return this.hcmMockService.reserve(payload);
  }

  @Post('restore')
  async restore(@Body() payload: HcmReserveDto) {
    return this.hcmMockService.release(payload);
  }

  @Get('snapshot')
  async snapshot() {
    return this.hcmMockService.snapshot();
  }
}
