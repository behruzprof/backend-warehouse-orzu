import { IsInt, Min } from 'class-validator';

export class CreateDrugRequestDto {
  @IsInt()
  departmentId: number;

  @IsInt()
  drugId: number;

  @IsInt()
  @Min(1)
  quantity: number;
}