import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { TicketModule } from './modules/tickets.module';
import { UserModule } from './modules/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // global access to env variables
      envFilePath: '.env',
    }),
    DatabaseModule,
    TicketModule,
    UserModule,
  ],
  //controllers: [AppController],
  //providers: [AppService],
})
export class AppModule {}
