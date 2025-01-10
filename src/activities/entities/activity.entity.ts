import { Board } from 'src/boards/entities/board.entity';
import { Card } from 'src/cards/entities/card.entity';
import { List } from 'src/lists/entities/list.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { ActivityType, TextTemplateStrings } from './types/activity.types';

@Entity('activities')
export class Activity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: ActivityType; // e.g., 'ADD_CARD', 'MOVE_CARD', 'TRANSFER_LIST'

  @Column()
  textTemplate: TextTemplateStrings; // e.g., "User {user} moved card {card} from {sourceList} to {destinationList}"

  @Column('jsonb')
  placeholders: Record<string, { id: string; name: string }>;

  @ManyToOne(() => User, { nullable: true })
  user: User; // The user who performed the activity

  @ManyToOne(() => Card, { nullable: true })
  card: Card; // The card related to the activity (if any)

  @ManyToOne(() => List, { nullable: true })
  sourceList: List; // The source list related to the activity

  @ManyToOne(() => List, { nullable: true })
  destinationList: List; // The destination list related to the activity

  @ManyToOne(() => Board, { nullable: true })
  sourceBoard: Board; // The source board related to the activity

  @ManyToOne(() => Board, { nullable: true })
  destinationBoard: Board; // The destination board related to the activity

  @CreateDateColumn()
  timestamp: Date;
}
