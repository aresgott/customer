import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { PrismaService } from './prisma.service';
import { CustomerModule } from './customer/customer.module';
import { AuthModule } from './auth/auth.module';
import { CustomerController } from './customer/customer.controller';
import { CustomerService } from './customer/customer.service';
import { APP_GUARD } from '@nestjs/core';
import { CustomerCController } from './customer-c/customer-c.controller';

@Module({
  imports: [
    CustomerModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      buildSchemaOptions: {
        dateScalarMode: 'timestamp',
      },
      context: ({ request, reply }) => ({ request, reply }),
      playground: true,
      introspection: true, // TODO update this so that it's off in production;
    }),
    AuthModule,
  ],
  controllers: [CustomerController, CustomerCController],
  providers: [PrismaService, CustomerService],
})
export class AppModule { }
