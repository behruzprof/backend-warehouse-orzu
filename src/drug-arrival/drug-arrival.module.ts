import { Module } from '@nestjs/common';
import { DrugArrivalService } from './drug-arrival.service';
import { DrugArrivalController } from './drug-arrival.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DrugArrival } from './entities/drug-arrival.entity';
import { Drug } from 'drug/entities/drug.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DrugArrival, Drug])],
  controllers: [DrugArrivalController],
  providers: [DrugArrivalService],
})
export class DrugArrivalModule {}
