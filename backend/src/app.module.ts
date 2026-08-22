import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PassportModule } from '@nestjs/passport/dist/passport.module';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from './prisma/prisma.module';
import { TaskModule } from './task/task.module';
import { UsersModule } from './users/users.module';
import { BoardsModule } from './boards/boards.module';
import { ColumnsModule } from './columns/columns.module';
import { ActivitiesModule } from './activities/activities.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { HealthModule } from './health/health.module';
import { KanbanGateway } from './kanban/kanban.gateway';
import { EventsGateway } from './events/events.gateway';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    AuthModule,
    PassportModule,
    PrismaModule,
    JwtModule,
    UsersModule,
    BoardsModule,
    ColumnsModule,
    ActivitiesModule,
    TaskModule,
    AnalyticsModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService, KanbanGateway, EventsGateway],
})
export class AppModule {}
