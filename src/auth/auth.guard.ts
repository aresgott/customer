import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private readonly reflector: Reflector
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        if (!token) {
            throw new UnauthorizedException();
        }
        try {
            const { iat, exp, ...payload } = await this.jwtService.verifyAsync(token, {
                secret: process.env.ACCESS_TOKEN_SECRET,
            });

            const currentTime = Math.floor(Date.now() / 1000);
            if (exp && exp < currentTime) {
                throw new UnauthorizedException('Token has expired');
            }
            const requiredRoles = this.reflector.get<string[]>(
                'roles',
                context.getHandler(),
            );
            if (requiredRoles && !requiredRoles.includes(payload.role)) {
                throw new ForbiddenException('Insufficient permissions');
            }
            request['user'] = payload;
        } catch (error) {
            throw new UnauthorizedException();
        }
        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}