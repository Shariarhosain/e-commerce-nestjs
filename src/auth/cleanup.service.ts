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
        `Cleanup completed: ${deletedRefreshTokens.count} refresh tokens deleted`,
      );

      return {
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
      totalRefreshTokens,
      expiredRefreshTokens,
    ] = await Promise.all([
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
      refreshTokens: {
        total: totalRefreshTokens,
        expired: expiredRefreshTokens,
      },
    };
  }
}