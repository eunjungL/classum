import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class PostRead {
  @PrimaryGeneratedColumn()
  read_id: number;

  @Column()
  read_state: number;

  @Column()
  post_id: number;

  @Column()
  reader: number;

  @Column({ default: false })
  removed: boolean;
}
