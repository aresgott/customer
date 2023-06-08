import { ApiProperty } from "@nestjs/swagger";

export class PaginationDto {
    @ApiProperty()
    offset: number;

    @ApiProperty()
    size: number;
}

export class CreateCustomerDto {
    @ApiProperty()
    email: string;
    @ApiProperty()
    password: string;
}

export class ActivateCustomerDto {
    @ApiProperty()
    email: string;
    @ApiProperty()
    password: string;
    @ApiProperty()
    code: string;
}
export class RefreshTokenDto {
    @ApiProperty()
    refreshToken: string;
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
export class UserInfoDto {
    @ApiProperty()
    id: string;
    @ApiProperty()
    email: string;
    @ApiProperty()
    role: string;
    @ApiProperty()
    createdAt: string;
    @ApiProperty()
    activated: boolean;
}

export class CustomerListDto {
    @ApiProperty({ type: CustomerDto, isArray: true })
    customers: CustomerDto[];

    @ApiProperty()
    count: number;
}