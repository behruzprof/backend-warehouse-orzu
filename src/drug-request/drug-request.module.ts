import { Module } from '@nestjs/common';
import { DrugRequestService } from './drug-request.service';
import { DrugRequestController } from './drug-request.controller';
import { DrugRequest } from './entities/drug-request.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Drug } from 'drug/entities/drug.entity';
import { Department } from 'department/entities/department.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DrugRequest, Drug, Department])],
  controllers: [DrugRequestController],
  providers: [DrugRequestService],
})
export class DrugRequestModule {}
