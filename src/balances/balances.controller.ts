import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { BalancesService } from './balances.service';
import { UpsertBalanceDto } from './dto/upsert-balance.dto';

@Controller('balances')
export class BalancesController {
  constructor(private readonly balancesService: BalancesService) {}

  @Get(':employeeId/:locationId')
  async getBalance(
    @Param('employeeId') employeeId: string,
    @Param('locationId') locationId: string,
  ) {
    return this.balancesService.getBalance(employeeId, locationId);
  }

  @Post('realtime')
  async realtimeSync(@Body() payload: UpsertBalanceDto) {
    return this.balancesService.upsertBalance(payload);
  }

  @Post('batch')
  async batchSync(@Body() payload: UpsertBalanceDto[]) {
    return this.balancesService.upsertMany(payload);
  }
}
