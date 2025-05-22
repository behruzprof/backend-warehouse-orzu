import {
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  IsInt,
  Min,
} from 'class-validator';

export class CreateDrugDto {
  @IsString()
  name: string;

  @IsString()
  unit: string; // Единица измерения (например, "таблетка")

  @IsOptional()
  @IsString()
  description?: string; // Описание

  @IsOptional()
  @IsString()
  photo?: string;

  @IsString()
  shelf: string;

  @IsString()
  section: string;

  @IsInt()
  @Min(0)
  row: number;

  @IsInt()
  @Min(0)
  quantity: number;

  @IsInt()
  @Min(0)
  orderQuantity: number;

  @IsString()
  supplier: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  purchaseAmount: number;

  @IsDateString()
  arrivalDate: string;

  @IsDateString()
  expiryDate: string;

  @IsString()
  category: string; 
}
