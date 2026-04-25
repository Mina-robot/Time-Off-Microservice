import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('sync_events')
export class SyncEventEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  source: string;

  @Column()
  operation: string;

  @Column({ type: 'text' })
  payload: string;

  @Column({ type: 'datetime' })
  createdAt: Date;
}
