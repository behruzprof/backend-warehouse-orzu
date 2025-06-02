import { DrugArrival } from 'drug-arrival/entities/drug-arrival.entity';
import { DrugRequest } from 'drug-request/entities/drug-request.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('drugs')
export class Drug {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string; // Название лекарства (обязательное)

  @Column('int', { default: 0 })
  quantity: number; // Количество в наличии (обязательное)

  @Column('int', { default: 0 })
  minStock: number; // Минимальный запас (обязательное)

  @Column('int', { default: 0 })
  maxStock: number; // Максимальный запас (обязательное)

  @Column()
  supplier: string; // Поставщик (обязательное)

  @Column()
  purchaseAmount: number; // Сумма закупки (обязательное)

  @Column({ type: 'date', nullable: false })
  expiryDate: Date; // Срок годности (обязательное)

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
