import { IsInt, IsString, Min } from 'class-validator';

export class CreateDraftOrderDto {
  @IsInt()
  drugId: number;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsString()
  unit: string;
}
