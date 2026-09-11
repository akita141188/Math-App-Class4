import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configuration, validateEnvironment } from './configuration';
import { CurriculumModule } from './curriculum/curriculum.module';
import { HealthModule } from './health/health.module';
import { LearningSessionModule } from './learning-session/learning-session.module';
import { ProblemModule } from './problem/problem.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate: validateEnvironment,
    }),
    HealthModule,
    CurriculumModule,
    ProblemModule,
    LearningSessionModule,
  ],
})
export class AppModule {}
