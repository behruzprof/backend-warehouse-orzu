import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Drug } from 'drug/entities/drug.entity';
import { DrugRequest } from 'drug-request/entities/drug-request.entity';
import { DrugArrival } from 'drug-arrival/entities/drug-arrival.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Drug, DrugRequest, DrugArrival])],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}
