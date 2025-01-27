import { Injectable } from '@nestjs/common';
import { CreateBoardMemberDto } from './dto/create-board-member.dto';

@Injectable()
export class BoardMembersService {
  create(createBoardMemberDto: CreateBoardMemberDto) {}
}
