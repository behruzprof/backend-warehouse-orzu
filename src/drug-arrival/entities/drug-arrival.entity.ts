import { Drug } from 'drug/entities/drug.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity('drug_arrivals')
export class DrugArrival {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Drug, (drug) => drug.arrivals, { onDelete: 'CASCADE' })
  drug: Drug; // Связь с лекарством

  @Column('int')
  quantity: number; // Количество, пришедшее в этой партии

  @Column('decimal', { precision: 10, scale: 2 })
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
