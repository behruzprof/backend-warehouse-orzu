import { DrugArrival } from 'drug-arrival/entities/drug-arrival.entity';
import { DrugRequest } from 'drug-request/entities/drug-request.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

// 🆕 ДОБАВЛЕНО: Строгий список категорий. 
// Вы можете поменять эти названия на те, которые используются в вашей клинике/аптеке.
export enum DrugCategory {
  ANTIBIOTICS = 'Таблетки', // Антибиотики
  ANALGESICS = 'Растворы', // Обезболивающие
  VACCINES = 'Капельницы', // Вакцины
  INJECTIONS = 'Инъекции', // Инъекции
  OTHER = 'Бошқалар', // Другое
}

@Entity('drugs')
export class Drug {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'varchar', default: 'pcs' }) 
  unit: string;

  @Column('decimal', { precision: 10, scale: 2 })
  quantity: number; 

  @Column('int', { default: 0 })
  minStock: number; 

  @Column('int', { default: 0 })
  maxStock: number; 

  @Column()
  supplier: string; 

  @Column({ default: false })
  IsStandard: boolean;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  costPerPiece: number;

  @Column('decimal', { default: 0 })
  piece: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  purchaseAmount: number;

  @Column({ type: 'date', nullable: false })
  expiryDate: Date; 

  @Column({ nullable: true })
  shelf: string;

  @Column({ nullable: true })
  section: string;

  @Column('int', { nullable: true })
  row: number;

  // ✅ ИЗМЕНЕНО: Теперь это строгий Enum
  @Column({ type: 'enum', enum: DrugCategory, nullable: true })
  category: DrugCategory;

  @Column({ type: 'date', nullable: true })
  arrivalDate: Date;

  @OneToMany(() => DrugArrival, (arrival) => arrival.drug, { cascade: true })
  arrivals: DrugArrival[];

  @OneToMany(() => DrugRequest, (drugRequest) => drugRequest.drug)
  drugRequests: DrugRequest[];
}