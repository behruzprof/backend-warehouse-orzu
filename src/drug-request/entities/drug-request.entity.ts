import { Drug } from "drug/entities/drug.entity";
import { Department } from "department/entities/department.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { DrugRequestStatus } from "drug-request/dto/create-drug-request.dto";

@Entity('drug_requests')
export class DrugRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Department, (department) => department.drugRequests, { eager: true })
  department: Department;

  @ManyToOne(() => Drug, (drug) => drug.drugRequests, { eager: true })
  drug: Drug;

  @Column({ nullable: true })
  patientName: string;

  @Column('int')
  quantity: number;

  @Column({ type: 'enum', enum: DrugRequestStatus, default: DrugRequestStatus.ISSUED })
  status: DrugRequestStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}