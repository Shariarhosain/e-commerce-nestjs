import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'This is the E-Commerce API built with NestJS!';
  }
}
