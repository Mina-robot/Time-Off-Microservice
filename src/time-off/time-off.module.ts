import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BalancesModule } from '../balances/balances.module';
import { LeaveBalanceEntity } from '../balances/entities/leave-balance.entity';
import { HcmMockModule } from '../hcm-mock/hcm-mock.module';
import { TimeOffController } from './time-off.controller';
import { TimeOffService } from './time-off.service';
import { TimeOffRequestEntity } from './entities/time-off-request.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TimeOffRequestEntity, LeaveBalanceEntity]),
    BalancesModule,
    HcmMockModule,
  ],
  providers: [TimeOffService],
  controllers: [TimeOffController],
})
export class TimeOffModule {}
