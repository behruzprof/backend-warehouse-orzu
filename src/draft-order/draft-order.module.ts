import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DraftOrderService } from './draft-order.service';
import { DraftOrderController } from './draft-order.controller';
import { DraftOrder } from './entities/draft-order.entity';
import { Drug } from 'drug/entities/drug.entity';
import { DrugOrderService } from 'drug-order/drug-order.service';
import { DrugOrderModule } from 'drug-order/drug-order.module';

@Module({
  imports: [ DrugOrderModule,TypeOrmModule.forFeature([DraftOrder, Drug])],
  controllers: [DraftOrderController],
  providers: [DraftOrderService],
})
export class DraftOrderModule {}
