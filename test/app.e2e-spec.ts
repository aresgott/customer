import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

jest.mock('src/post/post.module');

describe('Customer Controller (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/customer')
      .expect(401)
      .expect({
        "statusCode": 401,
        "message": "Unauthorized"
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
