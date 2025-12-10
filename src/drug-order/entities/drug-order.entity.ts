// drug-order.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('drug_orders')
export class DrugOrder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string; // Название лекарства

  @Column()
  amount: number; // Количество

  @Column()
  unit: string; // Единица измерения: "шт", "упаковка" и т.д.

  @Column()
  category: string; // Категория лекарства

  @CreateDateColumn()
  createdAt: Date; // Время создания заказа
}
