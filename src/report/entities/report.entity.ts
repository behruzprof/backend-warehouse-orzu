import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

type ReportRow = {
  drug_name: string[];
  unit: string[];
  previous_quantity: number[];
  previous_amount: number[];
  incoming_quantity: number[];
  incoming_amount: number[];
  amount_without_vat: number[];
  daily_expenses: { date: string; quantity: number; drug_name: string }[];
  total_monthly_expense_quantity: number[];
  total_monthly_expense_amount: number[];
  next_month_remain_quantity: number[];
  next_month_remain_amount: number[];
};

@Entity()
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  month: string;

  @Column("json")
  data: ReportRow[];

  @CreateDateColumn()
  createdAt: Date;
}
