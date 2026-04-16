import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from 'rxjs/operators';
import * as CryptoJS from 'crypto-js';

export interface Response<T> {
    statusCode: number;
    message: string;
    data: any;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
    intercept(context: ExecutionContext, next: CallHandler<T>): Observable<Response<T>> {
        const ctx = context.switchToHttp();
        const response = ctx.getResponse();
        const statusCode = response.statusCode;

        const secretKey = process.env.API_KEY || 'tuoi_lol_lay_data_bo_may';

        return next.handle().pipe(
            map((data: any) => {
                const message = data?.message ? data.message : 'Success';
                const rawData = data?.data !== undefined ? data.data : data;

                let encryptedData: string | null = null;

                if (rawData) {
                    const jsonString = JSON.stringify(rawData);
                    encryptedData = CryptoJS.AES.encrypt(jsonString, secretKey).toString();
                }

                return {
                    statusCode,
                    message,
                    data: encryptedData,
                };
            }),
        );
    }
}