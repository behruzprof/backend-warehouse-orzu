import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('draft_orders')
export class DraftOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  created_at: Date;

  @Column()
  drugId: number;

  @Column()
  quantity: number;

  @Column()
  unit: string;

  @Column()
  category: string;

  @Column()
  name: string;
}
