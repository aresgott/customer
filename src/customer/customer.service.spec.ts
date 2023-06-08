import { Test, TestingModule } from '@nestjs/testing';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { PrismaService } from 'src/prisma.service';
import { CustomerResolver } from './customer.resolver';
import { JwtModule } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Customer } from 'src/lib/entities/customer.entity';
import { ForbiddenException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { DeepMockProxy } from 'jest-mock-extended'
import { PrismaClient } from '@prisma/client';
import { CreateCustomerDto } from './dto/customer.dto';
import AuthUserDTO, { AuthTokenDto } from 'src/auth/dto/auth.dto';


type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
const createMockRepository = (): MockRepository<Customer> => ({
    findOne: jest.fn(),
    create: jest.fn(),
    find: jest.fn(),
    findBy: jest.fn(),
    findAndCount: jest.fn(),
})


describe('CustomerService', () => {
    let service: CustomerService;
    let customerRepository: PrismaService;
    let prisma: DeepMockProxy<PrismaClient>;
    let prismaService: PrismaService;


    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [CustomerController],
            providers: [
                CustomerService,
                PrismaService,
                CustomerResolver,
                {
                    provide: getRepositoryToken(Customer),
                    useValue: createMockRepository(),
                }
            ],
            imports: [JwtModule]
        }).compile();

        prismaService = new PrismaService();
        service = module.get<CustomerService>(CustomerService);
        customerRepository = module.get<PrismaService>(PrismaService);
        prisma = module.get(PrismaService);
    });

    it('service should be defined', () => {
        expect(service).toBeDefined();
    });


    describe('find by email', () => {
        describe('when email exist', () => {
            it('should return customer', async () => {
                const email = 'random@gmail.com';
                const expectedCustomer = {
                    id: 1,
                    email: email,
                    role: 'CUSTOMER'
                }
                customerRepository.customer.findUnique = jest.fn().mockReturnValueOnce(expectedCustomer)
                const customer = await service.getCustomerByEmail(email)
                expect(customer).toEqual(expectedCustomer);
            })
        })
        describe('when email does not exist', () => {
            it('should not return customer', async () => {
                try {
                    const email = 'random@gmail.com';
                    const customer = await service.getCustomerByEmail(email)
                } catch (error) {
                    expect(error).toBeInstanceOf(NotFoundException)
                    expect(error.message).toEqual('Customer not found')
                }
            })
        })
    })

    describe('delete customer', () => {
        describe('should delete customer', () => {
            it('should delete 1 customer', async () => {
                const email = 'random@gmail.com';
                const customer = {
                    id: '1',
                    email: email,
                    password: 's',
                    role: 'CUSTOMER',
                    createdAt: new Date('2023-06-04 21:49:02.902'),
                    updatedAt: new Date('2023-06-04 21:49:02.902'),
                }
                customerRepository.customer.delete = jest.fn().mockReturnValueOnce(customer);
                const deletedCustomer = await service.deleteCustomer(email);
                expect(deletedCustomer).toEqual(customer);

            })
        })
        describe('should delete customer', () => {
            it('should get error when customer not exist', async () => {
                const email = 'random@gmail.com';
                const customer = {
                    id: '1',
                    email: email,
                    password: 's',
                    role: 'CUSTOMER',
                    createdAt: new Date('2023-06-04 21:49:02.902'),
                    updatedAt: new Date('2023-06-04 21:49:02.902'),
                }
                try {
                    const deletedCustomer = await service.deleteCustomer(email);
                    expect(deletedCustomer).toEqual(customer);
                } catch (error) {
                    expect(error).toBeInstanceOf(NotFoundException)

                }
            })
        })
    })
    describe('check service customers list', () => {
        describe('when customer exist', () => {
            it('should return all customers', async () => {
                const mockCustomer = [{
                    id: '1',
                    email: 'email1@gmail.com',
                    password: 'passwd',
                    role: 'CUSTOMER',
                    createdAt: new Date('2023-06-04 21:49:02.902'),
                    updatedAt: new Date('2023-06-04 21:49:02.902'),
                    active: 'TRUE'
                },
                {
                    id: '2',
                    email: 'email2@gmail.com',
                    password: 's',
                    role: 'CUSTOMER',
                    createdAt: new Date('2023-06-04 21:49:02.902'),
                    updatedAt: new Date('2023-06-04 21:49:02.902'),
                    active: 'TRUE'
                }];
                const result = {
                    count: 9,
                    customer: mockCustomer
                }
                try {
                    prismaService.customer.findMany = jest.fn().mockReturnValueOnce(mockCustomer)
                    prismaService.customer.count = jest.fn().mockReturnValueOnce(9)
                    const customer = await service.getAllCustomers({ offset: 0, size: 2 })
                    expect(result).toEqual(customer)
                } catch (error) { }

            })
        })
    })

    describe('check user info service', () => {
        describe('when customer exist', () => {
            it('should return customer info', async () => {
                const mockCustomer = {
                    "id": "1",
                    "email": "mobina@gmail.com",
                    "role": "CUSTOMER",
                    "createdAt": "2023-06-07T18:19:40.724Z",
                    "activated": false
                };
                customerRepository.customer.findUnique = jest.fn().mockReturnValueOnce(mockCustomer)
                const customer = await service.getUserInfo({ user: { customerId: 1 } })
                expect(customer).toEqual(mockCustomer);
            })
        })
    })

    describe('login service', () => {
        describe('when customer exist', () => {
            it('username and password is correct and user acivated', async () => {
                const customerForLogin = {
                    "id": "1ae62838-729d-491b-a2b1-085f6bc58b49",
                    "email": "mobina@gmail.com",
                    "password": "$2b$10$nhrQrXiqEYrGnkVVHbW9E.wUx0tIt/K9h2zucHWNVvto1yRifH9bW",
                    "role": "ADMIN",
                    "createdAt": "2023-06-07T18:19:40.724Z",
                    "active": 'TRUE'
                };
                const userInput = { email: "mobina@gmail.com", password: "mohsen" };

                customerRepository.customer.findUnique = jest.fn().mockReturnValueOnce(customerForLogin)
                const customer = await service.login(userInput)
                expect(JSON.stringify(customer)).toMatch('accessToken')
                expect(JSON.stringify(customer)).toMatch('refreshToken')
                expect(JSON.stringify(customer)).toMatch('ttl')
            })

            it('username and password is correct and user not acivated', async () => {
                const customerForLogin = {
                    "id": "1ae62838-729d-491b-a2b1-085f6bc58b49",
                    "email": "mobina@gmail.com",
                    "password": "$2b$10$nhrQrXiqEYrGnkVVHbW9E.wUx0tIt/K9h2zucHWNVvto1yRifH9bW",
                    "role": "ADMIN",
                    "createdAt": "2023-06-07T18:19:40.724Z",
                    "active": 'FALSE'
                };
                const userInput = { email: "mobina@gmail.com", password: "mohsen" };
                try {
                    customerRepository.customer.findUnique = jest.fn().mockReturnValueOnce(customerForLogin)
                    const customer = await service.login(userInput)
                } catch (error) {
                    expect(error).toBeInstanceOf(ForbiddenException)
                }
            })

            it('password is not correct', async () => {
                const customerForLogin = {
                    "id": "1ae62838-729d-491b-a2b1-085f6bc58b49",
                    "email": "mobina@gmail.com",
                    "password": "$2b$10$nhrQrXiqEYrGnkVVHbW9E.wUx0tIt/K9h2zucHWNVvto1yRifH9bW",
                    "role": "ADMIN",
                    "createdAt": "2023-06-07T18:19:40.724Z",
                    "active": 'FALSE'
                };
                const userInput = { email: "mobina@gmail.com", password: "wrong_pass" };
                try {
                    customerRepository.customer.findUnique = jest.fn().mockReturnValueOnce(customerForLogin)
                    const customer = await service.login(userInput)
                } catch (error) {
                    expect(error).toBeInstanceOf(UnauthorizedException)
                }
            })

            it('customer not found', async () => {
                const userInput = { email: "mobina@gmail.com", password: "wrong_pass" };
                try {
                    customerRepository.customer.findUnique = jest.fn().mockReturnValueOnce(undefined)
                    const customer = await service.login(userInput)
                } catch (error) {
                    expect(error).toBeInstanceOf(NotFoundException)
                }
            })
        })
    })
});



