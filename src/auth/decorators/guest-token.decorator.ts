import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GuestToken = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest();
    const authorization = request.headers.authorization;
    
    if (!authorization) {
      return undefined;
    }

    // Check if it's a Bearer token (JWT) or Guest token
    if (authorization.startsWith('Bearer ')) {
      const token = authorization.substring(7);
      
      // Simple check: if token looks like UUID (guest token) vs JWT
      // UUIDs are 36 characters with hyphens, JWTs are much longer and have dots
      if (token.length === 36 && token.includes('-') && !token.includes('.')) {
        return token;
      }
    } else if (authorization.startsWith('Guest ')) {
      // Support Guest <token> format
      return authorization.substring(6);
    }
    
    return undefined;
  },
);