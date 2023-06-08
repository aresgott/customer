import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { CustomerModule } from 'src/customer/customer.module';
import { CustomerService } from 'src/customer/customer.service';
import { PrismaService } from 'src/prisma.service';
import { CustomerResolver } from 'src/customer/customer.resolver';
import { CustomerController } from 'src/customer/customer.controller';
import { JwtModule } from '@nestjs/jwt';
import * as request from 'supertest';
import { CustomerDto } from 'src/customer/dto/customer.dto';
import { CreateCustomerDto } from 'src/customer/dto/customer.dto';


describe('Customer (e2e) /customer', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [CustomerController],
      providers: [CustomerService, PrismaService, CustomerResolver],
      imports: [JwtModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
  });


  beforeEach(async () => {
    await prismaService.customer.deleteMany({})
  });

  const customer: CreateCustomerDto = {
    email: 'mohsen@gmail.com',
    password: 'mohsen',
  };

  it('Sign up customer', async () => {
    await request(app.getHttpServer())
      .post('/customer/signup')
      .send(customer as CreateCustomerDto)
      .expect(HttpStatus.CREATED);
  });

  it('Get customer without auth', async () => {
    await request(app.getHttpServer())
      .get(`/customer/${customer.email}`)
      .send(customer as CreateCustomerDto)
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('Get customer after sign up', async () => {
    await request(app.getHttpServer())
      .post('/customer/signup')
      .send(customer as CreateCustomerDto)
      .expect(HttpStatus.CREATED);

    await request(app.getHttpServer())
      .get(`/customer/public-route?offset=0&size=1`)
      .expect(HttpStatus.OK);
  });

  afterEach(async () => {
    await prismaService.customer.deleteMany({})
  });

  afterAll(async () => {
    await app.close();
  });
});
