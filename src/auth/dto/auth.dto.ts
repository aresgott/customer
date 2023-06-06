export default interface AuthUserDTO {
    token: string;
}

export class AuthTokenDto {
    accessToken: string;
    refreshToken: string;
    ttl: number;
}