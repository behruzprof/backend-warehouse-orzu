import { DrugArrival } from 'drug-arrival/entities/drug-arrival.entity';
import { DrugRequest } from 'drug-request/entities/drug-request.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('drugs')
export class Drug {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string; // Название лекарства

  @Column()
  unit: string; // Единица измерения (например, "таблетка")

  @Column({ nullable: true })
  description: string; // Описание (например, назначение)

  @Column({ nullable: true })
  photo: string; // Фото (ссылка или путь к изображению)

  @Column()
  shelf: string; // Номер шкафа

  @Column()
  section: string; // Название или номер секции/полки

  @Column('int')
  row: number; // Ряд (числовой индекс)

  @Column('int', { default: 0 })
  quantity: number; // Общее количество в наличии

  @Column('int', { default: 0 })
  orderQuantity: number; // Кол-во для автоматического заказа

  @Column()
  supplier: string; // Название/имя поставщика

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  purchaseAmount: number; // Сумма закупки (по умолчанию)

  @Column({ type: 'date', nullable: true })
  arrivalDate: Date; // Дата последнего прихода

  @Column({ type: 'date', nullable: true })
  expiryDate: Date; // Срок годности

  @OneToMany(() => DrugArrival, (arrival) => arrival.drug, { cascade: true })
  arrivals: DrugArrival[];

  @OneToMany(() => DrugRequest, (drugRequest) => drugRequest.drug)
  drugRequests: DrugRequest[];
}
