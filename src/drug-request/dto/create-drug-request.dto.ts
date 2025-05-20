import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  IsEnum,
} from 'class-validator';

export enum DrugRequestStatus {
  ISSUED = 'issued',
  RETURNED = 'returned',
}

export class CreateDrugRequestDto {
  @IsInt()
  departmentId: number; // id отделения

  @IsInt()
  drugId: number; // id лекарства

  @IsOptional()
  @IsString()
  patientName?: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsEnum(DrugRequestStatus)
  status: DrugRequestStatus;
}
