import { Module } from '@nestjs/common';
import { DrugOrderService } from './drug-order.service';
import { DrugOrderController } from './drug-order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Drug } from 'drug/entities/drug.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Drug])],
  controllers: [DrugOrderController],
  providers: [DrugOrderService],
  exports: [DrugOrderService]
})
export class DrugOrderModule {}
