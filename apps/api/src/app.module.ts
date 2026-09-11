import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configuration, validateEnvironment } from './configuration';
import { ContentModule } from './content/content.module';
import { CurriculumModule } from './curriculum/curriculum.module';
import { HealthModule } from './health/health.module';
import { LearningSessionModule } from './learning-session/learning-session.module';
import { ProblemModule } from './problem/problem.module';
import { PracticeModule } from './practice/practice.module';
import { TestModeModule } from './test-mode/test-mode.module';

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
    ContentModule,
    PracticeModule,
    TestModeModule,
  ],
})
export class AppModule {}
