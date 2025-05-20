import { PartialType } from '@nestjs/mapped-types';
import { CreateDrugRequestDto, DrugRequestStatus } from './create-drug-request.dto';
import { IsEnum, IsOptional, IsInt, Min, IsString } from 'class-validator';

export class UpdateDrugRequestDto extends PartialType(CreateDrugRequestDto) {
  @IsOptional()
  @IsEnum(DrugRequestStatus)
  status?: DrugRequestStatus;

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @IsOptional()
  @IsString()
  patientName?: string;
}
