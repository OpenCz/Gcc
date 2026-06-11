-- AlterTable
ALTER TABLE "Subject" ADD COLUMN     "rejected" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "rejectionReason" TEXT;
