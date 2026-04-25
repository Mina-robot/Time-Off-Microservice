import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('leave_balances')
@Index(['employeeId', 'locationId'], { unique: true })
export class LeaveBalanceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  employeeId: string;

  @Column()
  locationId: string;

  @Column({ type: 'float', default: 0 })
  availableDays: number;

  @Column({ type: 'datetime' })
  updatedAt: Date;
}
