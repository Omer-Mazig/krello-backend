import { Exclude } from 'class-transformer';
import { BoardMember } from 'src/boards/entities/board-member.entity';
import { WorkspaceMember } from 'src/workspace-members/entities/workspace-member.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  username: string;

  @Column({ select: false })
  @Exclude()
  password: string;

  @OneToMany(() => WorkspaceMember, (workspaceMember) => workspaceMember.user)
  workspaceMemberships: WorkspaceMember[];

  @OneToMany(() => BoardMember, (boardMember) => boardMember.user)
  boardMemberships: BoardMember[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
