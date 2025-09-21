import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OrderAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;

    // If no user or error, throw custom message
    if (err || !user) {
      if (url.includes('/orders') && method === 'POST') {
        throw new UnauthorizedException(
          'You must be logged in to place an order. Please login or register to continue.',
        );
      } else if (url.includes('/orders') && method === 'GET') {
        throw new UnauthorizedException(
          'You must be logged in to view your orders. Please login to access your order history.',
        );
      } else if (url.includes('/orders') && method === 'PATCH') {
        throw new UnauthorizedException(
          'You must be logged in with admin privileges to update order status.',
        );
      } else {
        throw new UnauthorizedException(
          'You must be logged in to access this order resource. Please login to continue.',
        );
      }
    }

    return user;
  }
}