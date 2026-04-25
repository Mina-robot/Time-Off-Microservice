import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BalancesModule } from './balances/balances.module';
import { LeaveBalanceEntity } from './balances/entities/leave-balance.entity';
import { HcmBalanceEntity } from './hcm-mock/entities/hcm-balance.entity';
import { HcmMockModule } from './hcm-mock/hcm-mock.module';
import { SyncEventEntity } from './sync/entities/sync-event.entity';
import { SyncModule } from './sync/sync.module';
import { TimeOffRequestEntity } from './time-off/entities/time-off-request.entity';
import { TimeOffModule } from './time-off/time-off.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: process.env.DB_PATH ?? 'timeoff.db',
      entities: [
        LeaveBalanceEntity,
        TimeOffRequestEntity,
        SyncEventEntity,
        HcmBalanceEntity,
      ],
      synchronize: true,
    }),
    BalancesModule,
    TimeOffModule,
    HcmMockModule,
    SyncModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
