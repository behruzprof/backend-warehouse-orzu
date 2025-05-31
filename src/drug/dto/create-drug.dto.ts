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
  name: string; // Название лекарства (обязательно)

  @IsString()
  unit: string; // Единица измерения (например, "таблетка", "мл")

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

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  purchaseAmount: number; // Сумма закупки (обязательно)

  @IsDateString()
  expiryDate: string; // Срок годности (обязательно)

  @IsOptional()
  @IsString()
  description?: string; // Описание/назначение

  @IsOptional()
  @IsString()
  photo?: string; // Ссылка на фото или путь к изображению

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
  @IsString()
  manufacturer?: string; // Производитель

  @IsOptional()
  @IsString()
  barcode?: string; // Штрихкод

  @IsOptional()
  @IsString()
  dosageForm?: string; // Форма выпуска (например, "таблетка", "ампула")

  @IsOptional()
  @IsString()
  dosage?: string; // Дозировка (например, "500 мг")

  @IsOptional()
  @IsDateString()
  arrivalDate?: string; // Дата последнего прихода
}
