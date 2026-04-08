import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Drug } from 'drug/entities/drug.entity';
import { Department } from 'department/entities/department.entity';

// ✅ ДОБАВЛЕНО: Трансформер для конвертации строк в числа
const numericTransformer = {
  to: (value: number) => value,
  from: (value: string) => parseFloat(value) || 0,
};

@Entity('drug_requests')
export class DrugRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Department, (department) => department.drugRequests)
  department: Department;

  @ManyToOne(() => Drug, (drug) => drug.drugRequests, { eager: true })
  drug: Drug;

  // ✅ ИСПРАВЛЕНО: Добавлен трансформер
  @Column('decimal', { precision: 10, scale: 2, transformer: numericTransformer })
  quantity: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}