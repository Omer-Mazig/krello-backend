import { Card } from 'src/cards/entities/card.entity';
import { List } from 'src/lists/entities/list.entity';
import { BoardMember } from './board-member.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Label } from 'src/labels/entities/label.entity';

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
    eager: true, // To ensure at least one admin exists upon creation
  })
  members: BoardMember[];

  @OneToMany(() => Card, (card) => card.board, { cascade: true })
  cards: Card[];

  @OneToMany(() => List, (list) => list.board, { cascade: true })
  lists: List[];

  @OneToMany(() => Label, (label) => label.board, { cascade: true })
  labels: Label[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
