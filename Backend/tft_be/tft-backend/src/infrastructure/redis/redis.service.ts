import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
    private readonly redisClient: Redis;
    private readonly logger = new Logger(RedisService.name);

    constructor(private configService: ConfigService) {
        this.redisClient = new Redis({
            host: this.configService.get<string>('REDIS_HOST'),
            port: this.configService.get<number>('REDIS_PORT'),
            password: this.configService.get<string>('REDIS_PASSWORD') || undefined,
        });

        this.redisClient.on('connect', () => {
            this.logger.log('Connect redis success');
        });

        this.redisClient.on('error', (err) => {
            this.logger.error('Error connect redis:', err);
        });
    }

    async get(key: string): Promise<string | null> {
        return this.redisClient.get(key);
    }

    async set(key: string, value: string, ttl: number = 3600): Promise<void> {
        await this.redisClient.set(key, value, 'EX', ttl);
    }

    async del(key: string): Promise<void> {
        await this.redisClient.del(key);
    }

    onModuleDestroy() {
        this.redisClient.quit();
    }
}