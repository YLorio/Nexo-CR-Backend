import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './application/auth.service';
import { AuthController } from './infrastructure/http/auth.controller';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { JwtAuthGuard } from './infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from './infrastructure/guards/roles.guard';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): JwtModuleOptions => {
        const jwtSecret = configService.get<string>('JWT_SECRET');

        // SECURITY: Fail fast if JWT_SECRET is not configured
        if (!jwtSecret) {
          throw new Error(
            '❌ CRITICAL: JWT_SECRET environment variable is not set. ' +
            'Please set it in your .env file before starting the application.'
          );
        }

        // SECURITY: Warn if secret is too short
        if (jwtSecret.length < 32) {
          console.warn(
            '⚠️  WARNING: JWT_SECRET should be at least 32 characters for security.'
          );
        }

        const expiresIn = configService.get<string>('JWT_EXPIRES_IN') || '7d';

        return {
          secret: jwtSecret,
          signOptions: {
            expiresIn: expiresIn as '7d',
          },
        };
      },
      inject: [ConfigService],
    }),
    ConfigModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
  ],
  exports: [AuthService, JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
