import { ApiProperty } from "@nestjs/swagger";

export class CreateCustomerDto {
    @ApiProperty()
    email: string;
    @ApiProperty()
    password: string;

}

export class UpdateCustomerDto {
    @ApiProperty()
    email?: string;
    @ApiProperty()
    password?: string;
    @ApiProperty()
    role?: string;

}

export class CustomerDto {
    @ApiProperty()
    id: string;
    @ApiProperty()
    email: string;
    @ApiProperty()
    role: string;
}

export class CustomerListDto {
    @ApiProperty({ type: CustomerDto, isArray: true })
    customers: CustomerDto[];
}