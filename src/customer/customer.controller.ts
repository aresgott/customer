import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ActivateCustomerDto, CreateCustomerDto, CustomerDto, CustomerListDto, PaginationDto, RefreshTokenDto, UpdateCustomerDto } from './dto/customer.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { AuthTokenDto } from 'src/auth/dto/auth.dto';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/role';

@Controller('customer')
@ApiTags('Customer')
export class CustomerController {
    constructor(private readonly customerService: CustomerService) { }

    @Get('info')
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    getUserInfo(@Req() request: Request) {
        return this.customerService.getUserInfo(request);
    }

    @Get('public-route')
    @ApiResponse({
        status: HttpStatus.OK,
        type: CustomerListDto,
        description: 'Get list of customers publicly',
    })
    async getCustomerPublic(@Query() pagination: PaginationDto): Promise<CustomerListDto> {
        return await this.customerService.getAllCustomers(pagination);
    }

    @Get(':email')
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    @Roles(Role.Admin)
    @ApiResponse({
        status: HttpStatus.OK,
        type: CustomerDto,
        description: 'Get customer by email',
    })
    getCustomerByEmail(@Param('email') email: string): Promise<CustomerDto> {
        return this.customerService.getCustomerByEmail(email);
    }


    @Get()
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    @Roles(Role.Admin)
    @ApiResponse({
        status: HttpStatus.OK,
        type: CustomerListDto,
        description: 'Get list of customers.',
    })
    async getCustomer(@Query() pagination: PaginationDto): Promise<CustomerListDto> {
        return await this.customerService.getAllCustomers(pagination);
    }

    @Patch(':email')
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    @Roles(Role.Admin)
    async updateUser(
        @Param('email') email: string,
        @Body() createCustomerDto: UpdateCustomerDto
    ): Promise<CustomerDto> {
        return await this.customerService.updateCustomer(email,createCustomerDto);
    }

    @Delete(':email')
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    @Roles(Role.Admin)
    async deleteUser(@Param('email') email: string): Promise<void> {
        await this.customerService.deleteCustomer(email);
    }

    @Post('signup')
    @ApiResponse({
        status: HttpStatus.OK,
        type: CustomerDto,
        description: 'Sign up customer',
    })
    signUp(@Body() createCustomerDto: CreateCustomerDto): Promise<CustomerDto> {
        return this.customerService.signUp(createCustomerDto);
    }


    @Post('login')
    @ApiResponse({
        status: HttpStatus.OK,
        type: AuthTokenDto,
        description: 'login customer/admin',
    })
    login(@Body() loginCredentials: CreateCustomerDto): Promise<AuthTokenDto> {
        return this.customerService.login(loginCredentials)
    }


    @Post('refresh-token')
    @ApiResponse({
        status: HttpStatus.OK,
        type: AuthTokenDto,
        description: 'refresh token customer/admin',
    })
    async refreshToken(@Body() refreshToken: RefreshTokenDto): Promise<AuthTokenDto> {
        return this.customerService.refreshToken(refreshToken.refreshToken);
    }


    @Post('verify')
    @ApiResponse({
        status: HttpStatus.OK,
        type: CustomerDto,
        description: 'verify an account',
    })
    verifyAccount(@Body() verificationCode: ActivateCustomerDto): Promise<CustomerDto> {
        return this.customerService.verifyAccount(verificationCode);
    }
}
