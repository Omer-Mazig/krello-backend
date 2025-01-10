import { Board } from 'src/boards/entities/board.entity';
import { List } from 'src/lists/entities/list.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Card {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  labels: string; // Comma-separated values or an array (use JSON if required)

  @Column({ type: 'timestamptz', nullable: true })
  dueDate: Date;

  @Column()
  position: number; // Position to manage ordering

  @ManyToOne(() => List, (list) => list.cards, { onDelete: 'CASCADE' })
  list: List;

  @ManyToOne(() => Board, (board) => board.cards, { onDelete: 'CASCADE' })
  board: Board;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
