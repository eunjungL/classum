import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Chat {
  @PrimaryGeneratedColumn()
  chat_id: number;

  @Column()
  post_id: number;

  @Column()
  content: string;

  @Column()
  writer: number;

  @Column({ default: Date.now() })
  date: Date;

  @Column({ default: false })
  anonymity: boolean;

  @Column({ default: false })
  is_reply: boolean;

  @Column()
  reply_group: number;

  @Column({ default: false })
  removed: boolean;
}
