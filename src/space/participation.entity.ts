import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Participation {
  @PrimaryGeneratedColumn()
  participation_id: number;

  @Column()
  space_id: number;

  @Column()
  user_id: number;

  @Column()
  role: number;

  @Column({ default: false })
  removed: boolean;
}
