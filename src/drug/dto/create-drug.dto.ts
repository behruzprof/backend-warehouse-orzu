import {
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  IsInt,
  Min,
  IsIn,
} from 'class-validator';

export class CreateDrugDto {
  @IsString()
  name: string; // Название лекарства (обязательно)

  @IsInt()
  @Min(0)
  quantity: number; // Количество в наличии (обязательно)

  @IsInt()
  @Min(0)
  minStock: number; // Минимальный запас (обязательно)

  @IsInt()
  @Min(0)
  maxStock: number; // Максимальный запас (обязательно)

  @IsString()
  supplier: string; // Название поставщика (обязательно)

  @IsNumber()
  @Min(0)
  purchaseAmount: number; // Сумма закупки (обязательно)

  @IsDateString()
  expiryDate: string; // Срок годности (обязательно)

  @IsOptional()
  @IsString()
  shelf?: string; // Номер шкафа

  @IsOptional()
  @IsString()
  section?: string; // Секция/полка

  @IsOptional()
  @IsInt()
  @Min(0)
  row?: number; // Ряд (индекс)

  @IsOptional()
  @IsString()
  category?: string; // Категория (например, "антибиотик")

  @IsOptional()
  @IsDateString()
  arrivalDate?: string; // Дата последнего прихода

  @IsIn(['НДС', 'КОРПОРАТИВ КАРТА', 'НАКТ'])
  paymentType: string;
}
