-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "refreshToken" TEXT,
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'USER';
