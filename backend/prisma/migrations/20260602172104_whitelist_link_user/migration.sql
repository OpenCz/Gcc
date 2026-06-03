/*
  Warnings:

  - You are about to drop the column `email` on the `Whitelist` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `Whitelist` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `Whitelist` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Whitelist` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Whitelist_email_key";

-- AlterTable
ALTER TABLE "Whitelist" DROP COLUMN "email",
DROP COLUMN "role",
ADD COLUMN     "userId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Whitelist_userId_key" ON "Whitelist"("userId");

-- AddForeignKey
ALTER TABLE "Whitelist" ADD CONSTRAINT "Whitelist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
