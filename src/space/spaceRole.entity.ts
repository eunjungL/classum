import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class SpaceRole {
  @PrimaryGeneratedColumn()
  role_id: number;

  @Column()
  role_name: string;

  @Column({ default: false })
  authority: boolean;

  @Column()
  space_id: number;

  @Column({ default: false })
  removed: boolean;
}
