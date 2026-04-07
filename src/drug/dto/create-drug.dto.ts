import {
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  IsInt,
  Min,
  IsIn,
  IsBoolean,
  IsEnum, // 🆕 ДОБАВЛЕНО: Импортируем валидатор для Enum
} from 'class-validator';
import { DrugCategory } from '../entities/drug.entity'; // 🆕 ДОБАВЛЕНО: Импортируем сам Enum

export class CreateDrugDto {
  @IsString()
  name: string;

  // ✅ ИСПРАВЛЕНО: Заменили IsInt на IsNumber, чтобы API пропускало значения вроде 0.5
  @IsNumber()
  @Min(0)
  quantity: number;

  @IsOptional()
  @IsString()
  @IsIn(['ml', 'g', 'pcs'], {
    message: 'Единица измерения (unit) должна быть ml, g или pcs',
  }) 
  unit?: string;

  @IsInt()
  @Min(0)
  minStock: number;

  @IsInt()
  @Min(0)
  maxStock: number;

  @IsString()
  supplier: string;

  @IsOptional()
  @IsBoolean()
  IsStandard?: boolean;

  @IsNumber()
  @Min(0)
  costPerPiece: number;

  // ✅ ИСПРАВЛЕНО: Заменили IsInt на IsNumber, чтобы можно было приходовать 0.5 упаковки
  @IsNumber()
  @Min(0)
  piece: number;

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

  // ✅ ИЗМЕНЕНО: Строгая валидация по нашему списку категорий
  @IsOptional()
  @IsEnum(DrugCategory, {
    message: 'Категория должна быть из допустимого списка',
  })
  category?: DrugCategory;

  @IsOptional()
  @IsDateString()
  arrivalDate?: string;

  @IsIn(['НДС', 'КОРПОРАТИВ КАРТА', 'НАКТ'])
  paymentType: string;
}
