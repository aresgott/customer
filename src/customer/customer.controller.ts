import { Body, Controller, Get, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateCustomerDto, CustomerDto, CustomerListDto } from './dto/customer.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { AuthTokenDto } from 'src/auth/dto/auth.dto';

@Controller('customer')
@ApiTags('Customer')
export class CustomerController {
    constructor(private readonly customerService: CustomerService) { }

    @Get()
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    @ApiResponse({
        status: HttpStatus.OK,
        type: CustomerListDto,
        description: 'Get list of customers.',
    })
    async getCustomer() {
        const customers = [{
            "id": "9e391faf-64b2-4d4c-b879-463532920fd3",
            "email": "user@gmail.com",
            "role": "USER"
        }];
        return this.customerService.getAllCustomers();
    }

    @Get(':email')
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    getCustomerByEmail(@Param('email') email: string): Promise<CustomerDto> {
        return this.customerService.getCustomerByEmail(email);
    }

    @Post('signup')
    signUp(@Body() createCustomerDto: CreateCustomerDto): CustomerDto {
        const customers: CustomerDto = {
            "id": "9e391faf-64b2-4d4c-b879-463532920fd3",
            "email": "user@gmail.com",
            "role": "USER"
        }
        return customers;
    }

    @Post('login')
    login(@Body() loginCredentials: { email: string; password: string }): AuthTokenDto {
        return {
            accessToken: 'salam',
            refreshToken: 'asa',
            ttl: 2
        };
    }

    @Post('verify')
    verifyAccount(@Body() verificationCode: { code: string }) {
        return '';
    }
}
