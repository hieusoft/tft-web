import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiKeyGuard implements CanActivate {
    constructor(private configService: ConfigService) { }

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const providedKey = request.headers['x-api-key'];
        const secretKey = this.configService.get<string>('API_KEY');
        if (!providedKey || providedKey !== secretKey) {
            throw new UnauthorizedException('Access denied');
        }

        return true; 
    }
}