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

@Entity('drug_requests')
export class DrugRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Department, (department) => department.drugRequests)
  department: Department;

  @ManyToOne(() => Drug, (drug) => drug.drugRequests, { eager: true })
  drug: Drug;

  @Column('int')
  quantity: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
