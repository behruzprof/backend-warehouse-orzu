import { Drug } from 'drug/entities/drug.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity('drug_arrivals')
export class DrugArrival {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Drug, (drug) => drug.arrivals, { onDelete: 'CASCADE' })
  drug: Drug; // Связь с лекарством

  // 🆕 ДОБАВЛЕНО: Количество прихода (упаковок/штук)
  @Column('int', { default: 0 })
  piece: number; 

  // 🆕 ДОБАВЛЕНО: Цена за единицу
  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  costPerPiece: number;

  @Column('int')
  quantity: number; // Общее количество (в штуках/мл), пришедшее в этой партии

  @Column('decimal', { precision: 12, scale: 2 })
  purchaseAmount: number; // Сумма прихода для этой партии

  @Column({ type: 'date' })
  arrivalDate: Date; // Дата прихода

  @Column({ type: 'date' })
  expiryDate: Date; // Срок годности для этой партии

  @Column()
  supplier: string; // Имя поставщика

  @Column()
  paymentType: string;
}