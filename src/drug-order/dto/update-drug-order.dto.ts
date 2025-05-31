import { PartialType } from '@nestjs/mapped-types';
import { CreateDrugOrderDto } from './create-drug-order.dto';

export class UpdateDrugOrderDto extends PartialType(CreateDrugOrderDto) {}
