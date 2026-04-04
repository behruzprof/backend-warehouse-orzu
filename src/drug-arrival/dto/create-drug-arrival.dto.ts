import {
  IsInt,
  IsDateString,
  IsString,
  IsNumber,
  Min,
  IsIn,
  IsNotEmpty,
} from 'class-validator';

export class CreateDrugArrivalDto {
  // 🔄 Изменено: теперь может принимать как ID (число), так и UUID (строку) от шаблонов
  @IsNotEmpty()
  drugId: number | string;

  // 🆕 ДОБАВЛЕНО: Количество прихода
  @IsNumber()
  @Min(0)
  piece: number;

  // 🆕 ДОБАВЛЕНО: Цена за единицу
  @IsNumber()
  @Min(0)
  costPerPiece: number;

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

  @IsIn(['НДС', 'КОРПОРАТИВ КАРТА', 'НАКТ'])
  paymentType: string;
}