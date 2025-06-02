import { PartialType } from '@nestjs/mapped-types';
import { CreateDrugRequestDto } from './create-drug-request.dto';
import { IsOptional, IsInt, Min, IsString } from 'class-validator';

export class UpdateDrugRequestDto extends PartialType(CreateDrugRequestDto) {
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;
}
