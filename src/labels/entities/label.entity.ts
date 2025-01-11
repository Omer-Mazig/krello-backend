import { Card } from 'src/cards/entities/card.entity';
import { Board } from 'src/boards/entities/board.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
} from 'typeorm';

@Entity()
export class Label {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  color: string;

  @ManyToOne(() => Board, (board) => board.labels, { onDelete: 'CASCADE' })
  board: Board;

  @ManyToMany(() => Card, (card) => card.labels)
  cards: Card[];
}
