import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HcmBalanceEntity } from './entities/hcm-balance.entity';
import { HcmMockController } from './hcm-mock.controller';
import { HcmMockService } from './hcm-mock.service';

@Module({
  imports: [TypeOrmModule.forFeature([HcmBalanceEntity])],
  providers: [HcmMockService],
  controllers: [HcmMockController],
  exports: [HcmMockService],
})
export class HcmMockModule {}
