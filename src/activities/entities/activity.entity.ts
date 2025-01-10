import { Board } from 'src/boards/entities/board.entity';
import { Card } from 'src/cards/entities/card.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ActivityEvent } from '../enums/activity-event.enum';

@Entity('activities')
export class Activity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ActivityEvent,
  })
  type: ActivityEvent;

  @ManyToOne(() => User, { eager: true }) // Add `eager` if user is always required
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Board, { eager: true }) // Add `eager` if board is always required
  @JoinColumn({ name: 'source_board_id' })
  sourceBoard: Board;

  @ManyToOne(() => Board)
  @JoinColumn({ name: 'dest_board_id' })
  destBoard?: Board;

  @ManyToOne(() => Card, { nullable: true })
  @JoinColumn({ name: 'card_id' })
  card?: Card;

  @Column({ nullable: true })
  sourceListTitle?: string; // Lists don't have a dedicated page

  @Column({ nullable: true })
  destListTitle?: string; // Lists don't have a dedicated page

  @CreateDateColumn()
  createdAt: Date;
}
