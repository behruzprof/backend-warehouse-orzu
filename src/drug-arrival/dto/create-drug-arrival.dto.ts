import { IsInt, IsDateString, IsString, IsNumber, Min, IsIn } from 'class-validator';

export class CreateDrugArrivalDto {
  @IsInt()
  drugId: number;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsNumber()
  purchaseAmount: number;

  @IsDateString()
  arrivalDate: string;

  @IsDateString()
  expiryDate: string;

  @IsString()
  supplier: string;

  @IsIn(['company_budget', 'company_card', 'company_cash'])
  paymentType: string;
}
