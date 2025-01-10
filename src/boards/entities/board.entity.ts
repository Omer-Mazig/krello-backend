import { Card } from 'src/cards/entities/card.entity';
import { List } from 'src/lists/entities/list.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Board {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ default: 'private' }) // Visibility can be 'private' or 'public'
  visibility: string;

  @ManyToOne(() => User, (user) => user.boards, { eager: true })
  createdBy: User;

  @OneToMany(() => Card, (cards) => cards.board, { cascade: true })
  cards: Card[];

  @OneToMany(() => List, (list) => list.board, { cascade: true })
  lists: List[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
