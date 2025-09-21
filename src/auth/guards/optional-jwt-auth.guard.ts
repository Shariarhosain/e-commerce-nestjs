import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    // Allow request to proceed even if no token is provided
    // If token is provided but invalid, still return null instead of throwing
    return user || null;
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // Try to activate, but don't fail if authentication fails
    try {
      const result = super.canActivate(context);
      if (result instanceof Promise) {
        return result.catch(() => true);
      }
      if (result instanceof Observable) {
        return result.pipe();
      }
      return true;
    } catch {
      return true;
    }
  }
}