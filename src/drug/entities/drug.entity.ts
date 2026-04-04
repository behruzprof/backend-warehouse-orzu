import { DrugArrival } from 'drug-arrival/entities/drug-arrival.entity';
import { DrugRequest } from 'drug-request/entities/drug-request.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('drugs')
export class Drug {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string; // Название лекарства

  @Column({ type: 'varchar', default: 'pcs' }) // ml, g, pcs
  unit: string;

  @Column('int', { default: 0 })
  quantity: number; // Количество в наличии

  @Column('int', { default: 0 })
  minStock: number; // Минимальный запас

  @Column('int', { default: 0 })
  maxStock: number; // Максимальный запас

  @Column()
  supplier: string; // Поставщик

  // 🆕 ДОБАВЛЕНО: Добавлять ли в сделку при создании
  @Column({ default: false })
  IsStandard: boolean;

  // 🆕 ДОБАВЛЕНО: Цена за единицу (штуку)
  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  costPerPiece: number;

  // 🆕 ДОБАВЛЕНО: Единица (количество штук прихода)
  @Column('int', { default: 0 })
  piece: number;

  // ОСТАВЛЕНО, но вычисляется автоматически: Сумма закупки (piece * costPerPiece)
  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  purchaseAmount: number;

  @Column({ type: 'date', nullable: false })
  expiryDate: Date; // Срок годности

  @Column({ nullable: true })
  shelf: string;

  @Column({ nullable: true })
  section: string;

  @Column('int', { nullable: true })
  row: number;

  @Column({ nullable: true })
  category: string;

  @Column({ type: 'date', nullable: true })
  arrivalDate: Date;

  @OneToMany(() => DrugArrival, (arrival) => arrival.drug, { cascade: true })
  arrivals: DrugArrival[];

  @OneToMany(() => DrugRequest, (drugRequest) => drugRequest.drug)
  drugRequests: DrugRequest[];
}