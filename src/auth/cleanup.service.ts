import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CleanupService {
  private readonly logger = new Logger(CleanupService.name);

  constructor(private prisma: PrismaService) {}

  // Manual cleanup method for immediate use
  async cleanupExpiredTokens() {
    this.logger.log('Starting cleanup of expired tokens...');

    try {
      // Clean up expired email verifications
      const deletedEmailVerifications = await this.prisma.emailVerification.deleteMany({
        where: {
          OR: [
            { expiresAt: { lt: new Date() } },
            { isUsed: true },
          ],
        },
      });

      // Clean up expired password resets
      const deletedPasswordResets = await this.prisma.passwordReset.deleteMany({
        where: {
          OR: [
            { expiresAt: { lt: new Date() } },
            { isUsed: true },
          ],
        },
      });

      // Clean up expired or revoked refresh tokens
      const deletedRefreshTokens = await this.prisma.refreshToken.deleteMany({
        where: {
          OR: [
            { expiresAt: { lt: new Date() } },
            { isRevoked: true },
          ],
        },
      });

      this.logger.log(
        `Cleanup completed: ${deletedEmailVerifications.count} email verifications, ` +
        `${deletedPasswordResets.count} password resets, ` +
        `${deletedRefreshTokens.count} refresh tokens deleted`,
      );

      return {
        emailVerifications: deletedEmailVerifications.count,
        passwordResets: deletedPasswordResets.count,
        refreshTokens: deletedRefreshTokens.count,
      };
    } catch (error) {
      this.logger.error('Error during token cleanup:', error);
      throw error;
    }
  }

  // Get statistics about tokens
  async getTokenStatistics() {
    const [
      totalEmailVerifications,
      expiredEmailVerifications,
      totalPasswordResets,
      expiredPasswordResets,
      totalRefreshTokens,
      expiredRefreshTokens,
    ] = await Promise.all([
      this.prisma.emailVerification.count(),
      this.prisma.emailVerification.count({
        where: { expiresAt: { lt: new Date() } },
      }),
      this.prisma.passwordReset.count(),
      this.prisma.passwordReset.count({
        where: { expiresAt: { lt: new Date() } },
      }),
      this.prisma.refreshToken.count(),
      this.prisma.refreshToken.count({
        where: {
          OR: [
            { expiresAt: { lt: new Date() } },
            { isRevoked: true },
          ],
        },
      }),
    ]);

    return {
      emailVerifications: {
        total: totalEmailVerifications,
        expired: expiredEmailVerifications,
      },
      passwordResets: {
        total: totalPasswordResets,
        expired: expiredPasswordResets,
      },
      refreshTokens: {
        total: totalRefreshTokens,
        expired: expiredRefreshTokens,
      },
    };
  }
}