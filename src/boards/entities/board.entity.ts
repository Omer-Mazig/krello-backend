import { Card } from 'src/cards/entities/card.entity';
import { List } from 'src/lists/entities/list.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { BoardMember } from './board-member.entity';

@Entity()
export class Board {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ default: 'private' })
  visibility: string;

  @OneToMany(() => BoardMember, (boardMember) => boardMember.board, {
    cascade: true,
  })
  members: BoardMember[];

  @ManyToOne(() => User, { nullable: false })
  createdBy: User; // Super Admin (board creator)

  @OneToMany(() => Card, (card) => card.board, { cascade: true })
  cards: Card[];

  @OneToMany(() => List, (list) => list.board, { cascade: true })
  lists: List[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
