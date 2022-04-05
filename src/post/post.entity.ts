import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  post_id: number;

  @Column()
  title: string;

  @Column()
  content: string;

  @Column({ default: false })
  category: boolean;

  @Column()
  space_id: number;

  @Column()
  writer: number;

  @Column({ default: Date.now() })
  date: Date;

  @Column()
  file: string;

  @Column({ default: false })
  anonymity: boolean;

  @Column()
  state: number;

  @Column({ default: false })
  removed: boolean;
}
