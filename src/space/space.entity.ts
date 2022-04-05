import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Space {
  @PrimaryGeneratedColumn()
  space_id: number;

  @Column()
  name: string;

  @Column()
  logo: string;

  @Column()
  admin_code: string;

  @Column()
  user_code: string;

  @Column()
  admin: string;

  @Column({ default: false })
  removed: boolean;
}
