import { ConflictException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { GetCustomerInput } from './dto/customer.input';
import { ActivateCustomerDto, CreateCustomerDto, CustomerDto, CustomerListDto, PaginationDto } from './dto/customer.dto';
import * as bcrypt from 'bcrypt';
import { generateAccessToken, verifyPassword } from 'src/shared/utils';
import { AuthTokenDto } from 'src/auth/dto/auth.dto';
import { generateRefreshToken } from 'src/shared/utils';
import { JwtService } from '@nestjs/jwt';
import { UpdateCustomerDto } from './dto/customer.dto';
import { Role } from 'src/auth/role';

@Injectable()
export class CustomerService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) { }
  async findAll(params: GetCustomerInput) {
    const { skip, take, cursor, where } = params;

    return this.prisma.customer.findMany({
      skip,
      take,
      cursor,
      where,
    });
  }

  async getAllCustomers(pagination: PaginationDto): Promise<CustomerListDto> {
    const customers = await this.prisma.customer.findMany({
      skip: Number(pagination.offset),
      take: Number(pagination.size),
    });

    const totalCount = await this.prisma.customer.count(); //for get total count of customer for pagination

    return {
      count: totalCount,
      customers: customers.map((customer) => ({
        id: customer.id,
        email: customer.email,
        role: customer.role,
      }))
    };
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

  async updateCustomer(email: string, createCustomerDto: UpdateCustomerDto): Promise<CustomerDto> {

    const saltOrRounds = 10;
    let hashedPassword = undefined;
    if(createCustomerDto.password) hashedPassword = await bcrypt.hash(createCustomerDto.password, saltOrRounds);
    const customer = await this.prisma.customer.update({
      where: { email },
      data: { 
        email:createCustomerDto.email,
        password:hashedPassword,
        role:createCustomerDto.role.toUpperCase()==Role.Admin?createCustomerDto.role.toUpperCase():Role.Customer
       },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with email ${email} not found`);
    }
    return {
      id:customer.id,
      email:customer.email,
      role:customer.role,
    };
  }

  async getUserInfo(request: any) {
    const user = request['user']

    const customer = await this.prisma.customer.findUnique({
      where: {
        id: user.customerId
      }
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    return {
      id: customer.id,
      email: customer.email,
      role: customer.role,
      createdAt: customer.createdAt,
      activated: customer.active == "TRUE" ? true : false
    }
  }

  async deleteCustomer(email: string): Promise<CustomerDto> {
    try {
      const customer = await this.prisma.customer.delete({ where: { email } });
      if (!customer) {
        throw new NotFoundException(`Customer with email ${email} not found`);
      }
      return customer;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Customer not exist');
      }
      throw error;
    }
  }

  async signUp(createCustomerDto: CreateCustomerDto): Promise<CustomerDto> {

    try {
      const { email, password } = createCustomerDto;

      const saltOrRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltOrRounds);

      const activationCode = Math.floor(Math.random() * 9000 + 1000);
      const customer = await this.prisma.customer.create({
        data: {
          email: email,
          password: hashedPassword,
          active: String(activationCode)
        },
      });
      console.log(`Activation code for ${email} is : ${activationCode}`); //replace with sending email
      return {
        id: customer.id,
        email: customer.email,
        role: customer.role
      };
    } catch (error) {
      if (error.code === 'P2002' && error.meta?.target.includes('email')) {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }

  async login(loginCredentials: CreateCustomerDto): Promise<AuthTokenDto> {
    const { email, password } = loginCredentials;
    const customer = await this.prisma.customer.findUnique({ where: { email } });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const isPasswordValid = await verifyPassword(password, customer.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    if (customer.active != "TRUE") {
      throw new ForbiddenException('You need to activate your account.')
    }

    const accessToken = generateAccessToken(customer.id, customer.role);
    const refreshToken = generateRefreshToken(customer.id, customer.role);

    const ttl = Number(process.env.ACCESS_TOKEN_EXPIRE_TIME.split('m')[0]) * 60; //calculate time in seconds

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
      ttl: ttl
    };
  }
  async refreshToken(refreshToken: string) {
    try {
      const { iat, exp, ...payload } = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.REFRESH_TOKEN_SECRET,
      });
      const currentTime = Math.floor(Date.now() / 1000);
      if (exp && exp < currentTime) {
        throw new UnauthorizedException('Token has expired');
      }
      const customer = await this.prisma.customer.findUnique({ where: { id: payload.customerId } });
      if (!customer) {
        throw new NotFoundException('Customer not found');
      }
      const accessToken = generateAccessToken(payload.customerId, payload.role);
      const ttl = Number(process.env.ACCESS_TOKEN_EXPIRE_TIME.split('m')[0]) * 60; //calculate time in seconds

      return { accessToken: accessToken, refreshToken: refreshToken, ttl: ttl };

    } catch (error) {
      throw new UnauthorizedException();
    }
  }

  async verifyAccount(loginCredentials: ActivateCustomerDto): Promise<CustomerDto> {

    const { email, password, code } = loginCredentials;
    const customer = await this.prisma.customer.findUnique({ where: { email } });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const isPasswordValid = await verifyPassword(password, customer.password);

    if (!isPasswordValid) {
      throw new NotFoundException('Invalid password');
    }

    if (customer.active == "TRUE") {
      throw new NotFoundException('Your account is active!');
    }

    if (customer.active !== code) {
      throw new NotFoundException('Your code is wrong.');
    }

    const activatedUser = await this.prisma.customer.update({
      where: { id: customer.id },
      data: { active: "TRUE" },
    });
    return {
      id: activatedUser.id,
      email: activatedUser.email,
      role: activatedUser.role
    }
  }
}
