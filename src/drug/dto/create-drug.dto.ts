import {
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  IsInt,
  Min,
  IsIn,
  IsBoolean,
} from 'class-validator';

export class CreateDrugDto {
  @IsString()
  name: string;

  @IsInt()
  @Min(0)
  quantity: number;

  @IsOptional()
  @IsString()
  unit?: string; // ml, g, pcs

  @IsInt()
  @Min(0)
  minStock: number;

  @IsInt()
  @Min(0)
  maxStock: number;

  @IsString()
  supplier: string;

  // 🆕 ДОБАВЛЕНО: Стандарт
  @IsOptional()
  @IsBoolean()
  IsStandard?: boolean;

  // 🆕 ДОБАВЛЕНО: Цена за единицу
  @IsNumber()
  @Min(0)
  costPerPiece: number;

  // 🆕 ДОБАВЛЕНО: Единица (штуки)
  @IsInt()
  @Min(0)
  piece: number;

  // ❌ УДАЛЕНО: purchaseAmount (будет вычисляться на бэкенде)

  @IsDateString()
  expiryDate: string;

  @IsOptional()
  @IsString()
  shelf?: string;

  @IsOptional()
  @IsString()
  section?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  row?: number;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsDateString()
  arrivalDate?: string;

  @IsIn(['НДС', 'КОРПОРАТИВ КАРТА', 'НАКТ'])
  paymentType: string;
}