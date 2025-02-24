import { Controller, Post, Body } from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { ActiveUser } from 'src/auth/decorators/active-user.decorator';
import { ActiveUserData } from 'src/auth/interfaces/active-user-data.interface';
import { CardsService } from './cards.service';

@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Post()
  create(
    @Body() createCardDto: CreateCardDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.cardsService.create(createCardDto, user.sub);
  }
}
