import { PartialType } from '@nestjs/mapped-types';
import { CreateDrugArrivalDto } from './create-drug-arrival.dto';

export class UpdateDrugArrivalDto extends PartialType(CreateDrugArrivalDto) {}
