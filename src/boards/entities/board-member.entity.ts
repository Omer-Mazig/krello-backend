import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Board } from './board.entity';
import { User } from 'src/users/entities/user.entity';

@Entity()
export class BoardMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Board, (board) => board.members, { onDelete: 'CASCADE' })
  board: Board;

  @ManyToOne(() => User, (user) => user.boardMemberships, {
    onDelete: 'CASCADE',
  })
  user: User;

  @Column({ default: 'member' })
  role: 'member' | 'admin' | 'super_admin';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
