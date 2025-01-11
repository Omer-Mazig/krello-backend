import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

import { User } from './users/entities/user.entity';

import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import evniromentValidation from './config/evniroment.validation';

import jwtConfig from './auth/config/jwt.config';
import { AuthenticationGuard } from './auth/guards/authentication/authentication.guard';
import { AccessTokenGuard } from './auth/guards/access-token/access-token.guard';
import { BoardsModule } from './boards/boards.module';
import { ListsModule } from './lists/lists.module';
import { CardsModule } from './cards/cards.module';
import { Board } from './boards/entities/board.entity';
import { List } from './lists/entities/list.entity';
import { Card } from './cards/entities/card.entity';
import { ActivitiesModule } from './activities/activities.module';
import { BoardMember } from './boards/entities/board-member.entity';
import { LabelsModule } from './labels/labels.module';
import { Label } from './labels/entities/label.entity';

const ENV = process.env.NODE_ENV;
console.log(process.env.NODE_ENV);

@Module({
  imports: [
    UsersModule,
    AuthModule,
    BoardsModule,
    ListsModule,
    CardsModule,
    ActivitiesModule,

    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: !ENV ? '.env' : `.env.${ENV}`,
      load: [appConfig, databaseConfig],
      validationSchema: evniromentValidation,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        autoLoadEntities: configService.get('database.autoLoadEtities'),
        synchronize: configService.get('database.synchronize'),
        port: +configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        host: configService.get('database.host'),
        database: configService.get('database.name'),
      }),
    }),

    TypeOrmModule.forFeature([
      User,
      AuthModule,
      Board,
      List,
      Card,
      Label,
      BoardMember,
    ]),

    // Register the JWT configuration, making it available via the ConfigService
    ConfigModule.forFeature(jwtConfig),

    // Dynamically register the JWT module using the configuration provided
    // by the jwtConfig. This allows us to configure JWT options like secret
    // and expiration based on environment variables.
    JwtModule.registerAsync(jwtConfig.asProvider()),

    LabelsModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
    AccessTokenGuard,
  ],
})
export class AppModule {}
