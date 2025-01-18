import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Workspace } from './workspace.entity';
import { User } from 'src/users/entities/user.entity';

@Entity('workspace_members')
export class WorkspaceMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Workspace, (workspace) => workspace.members, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  workspace: Workspace;

  @ManyToOne(() => User, (user) => user.workspaceMemberships, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  user: User;

  @Column({ type: 'enum', enum: ['member', 'admin'], default: 'member' })
  role: 'member' | 'admin';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
