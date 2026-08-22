import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ActivitiesModule } from '../activities/activities.module';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { PriorityEscalationService } from './priority-escalation.service';

@Module({
  imports: [PrismaModule, ActivitiesModule],
  controllers: [TaskController],
  providers: [TaskService, PriorityEscalationService],
})
export class TaskModule {}
