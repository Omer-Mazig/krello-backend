import { Exclude } from 'class-transformer';
import { BoardMember } from 'src/boards/entities/board-member.entity';
import { Card } from 'src/cards/entities/card.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column({ select: false })
  @Exclude()
  password: string;

  @OneToMany(() => BoardMember, (boardMember) => boardMember.user)
  boardMemberships: BoardMember[];

  @ManyToMany(() => Card, (card) => card.members)
  @JoinTable()
  cards: Card[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
