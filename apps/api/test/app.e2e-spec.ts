import { ValidationPipe } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { Server } from 'node:http';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Math App Class 4 API', () => {
  let app: INestApplication;
  let server: Server;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
    server = app.getHttpServer() as Server;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/health reports ready', async () => {
    const response = await request(server).get('/api/health').expect(200);
    expect(response.body as unknown).toEqual({
      status: 'ok',
      service: 'math-app-class4-api',
    });
  });

  it('GET /api/v1/curriculum/topics returns useful demo topics', async () => {
    const response = await request(server).get('/api/v1/curriculum/topics').expect(200);
    const body = response.body as Array<{ name: string }>;
    expect(body).toHaveLength(3);
    expect(body[0]).toMatchObject({ name: 'Phép chia' });
  });

  it('GET /api/v1/problems/demo returns the Grade 4 problem', async () => {
    const response = await request(server).get('/api/v1/problems/demo').expect(200);
    const body = response.body as { id: string; grade: number; statement: string };
    expect(body).toMatchObject({
      id: 'demo-multiplication-01',
      grade: 4,
    });
    expect(body.statement).toContain('245 hộp bánh');
  });

  it('rejects an invalid learning-session request', async () => {
    await request(server)
      .post('/api/v1/learning-sessions/demo/check')
      .send({ problemId: '', answer: '', extra: 'not allowed' })
      .expect(400);
  });

  it('returns supportive feedback for an incorrect answer', async () => {
    const response = await request(server)
      .post('/api/v1/learning-sessions/demo/check')
      .send({ problemId: 'demo-multiplication-01', answer: '1 370 chiếc bánh' })
      .expect(201);
    expect(response.body as unknown).toMatchObject({
      correct: false,
      nextState: 'ERROR_DIAGNOSIS',
    });
  });

  it('accepts the correct mock answer', async () => {
    const response = await request(server)
      .post('/api/v1/learning-sessions/demo/check')
      .send({ problemId: 'demo-multiplication-01', answer: '1 470 chiếc bánh' })
      .expect(201);
    expect(response.body as unknown).toMatchObject({
      correct: true,
      nextState: 'SOLVED',
    });
  });
});
