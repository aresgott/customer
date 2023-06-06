import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { GetCustomerInput } from './dto/customer.input';
import { CreateCustomerDto, CustomerDto } from './dto/customer.dto';

@Injectable()
export class CustomerService {
  constructor(private prisma: PrismaService) { }
  async findAll(params: GetCustomerInput) {
    const { skip, take, cursor, where } = params;

    return this.prisma.customer.findMany({
      skip,
      take,
      cursor,
      where,
    });
  }

  async getAllCustomers(): Promise<CustomerDto[]> {
    const customers = await this.prisma.customer.findMany();
    return customers.map((customer) => ({
      id: customer.id,
      email: customer.email,
      role: customer.role,
    }));
  }

  async getCustomerByEmail(email: string): Promise<CustomerDto> {
    const customer = await this.prisma.customer.findUnique({
      where: {
        email: email
      }
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    return {
      id: customer.id,
      email: customer.email,
      role: customer.role,
    }
  }

}
