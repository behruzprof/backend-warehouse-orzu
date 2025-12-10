import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { DrugRequest } from '../../drug-request/entities/drug-request.entity'; // если будешь связывать заявки с отделением

@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => DrugRequest, (drugRequest) => drugRequest.department)
  drugRequests: DrugRequest[];
}
