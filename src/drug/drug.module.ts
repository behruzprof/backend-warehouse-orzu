import { Module } from '@nestjs/common';
import { DrugService } from './drug.service';
import { DrugController } from './drug.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Drug } from './entities/drug.entity';
import { DrugArrival } from 'drug-arrival/entities/drug-arrival.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Drug, DrugArrival])],
  controllers: [DrugController],
  providers: [DrugService],
})
export class DrugModule {}
