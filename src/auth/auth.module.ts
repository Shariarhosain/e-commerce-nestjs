import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CleanupService } from './cleanup.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { PrismaModule } from '../prisma.module';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
      signOptions: { 
        expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' 
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, CleanupService, JwtStrategy, LocalStrategy],
  exports: [AuthService, JwtStrategy, CleanupService],
})
export class AuthModule {}