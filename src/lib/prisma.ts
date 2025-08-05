import { PrismaClient } from '@prisma/client';
import { ErrorCode, createApiError } from '@/types/errors';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
    errorFormat: 'pretty',
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Database connection helper with error handling
export async function connectToDatabase() {
  try {
    await prisma.$connect();
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw createApiError(
      500,
      ErrorCode.DATABASE_ERROR,
      'Failed to connect to database'
    );
  }
}

// Database disconnection helper
export async function disconnectFromDatabase() {
  try {
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Database disconnection failed:', error);
  }
}

// Transaction helper with error handling
export async function withTransaction<T>(
  callback: (
    prisma: Omit<
      PrismaClient,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
    >
  ) => Promise<T>
): Promise<T> {
  try {
    return await prisma.$transaction(callback);
  } catch (error) {
    console.error('❌ Transaction failed:', error);
    throw createApiError(
      500,
      ErrorCode.DATABASE_ERROR,
      'Database transaction failed'
    );
  }
}

// Health check helper
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('❌ Database health check failed:', error);
    return false;
  }
}
