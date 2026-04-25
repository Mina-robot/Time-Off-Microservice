import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { TimeOffRequestStatus } from '../../common/enums/time-off-request-status.enum';

@Entity('time_off_requests')
export class TimeOffRequestEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  employeeId: string;

  @Column()
  locationId: string;

  @Column({ type: 'float' })
  daysRequested: number;

  @Column({ nullable: true })
  type?: string;

  @Column({ nullable: true })
  reason?: string;

  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date' })
  endDate: string;

  @Column({
    type: 'varchar',
    default: TimeOffRequestStatus.PENDING,
  })
  status: TimeOffRequestStatus;

  @Column({ nullable: true })
  managerComment?: string;

  @Column({ type: 'datetime' })
  createdAt: Date;

  @Column({ type: 'datetime' })
  updatedAt: Date;
}
