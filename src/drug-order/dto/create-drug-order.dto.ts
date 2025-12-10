// create-drug-order.dto.ts
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateDrugOrderDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  amount: number;

  @IsString()
  unit: string;

  @IsString()
  category: string;
}
