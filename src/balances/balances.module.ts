import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BalancesController } from './balances.controller';
import { BalancesService } from './balances.service';
import { LeaveBalanceEntity } from './entities/leave-balance.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LeaveBalanceEntity])],
  providers: [BalancesService],
  controllers: [BalancesController],
  exports: [BalancesService],
})
export class BalancesModule {}
