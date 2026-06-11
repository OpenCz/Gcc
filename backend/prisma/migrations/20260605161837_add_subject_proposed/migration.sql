/*
  Warnings:

  - You are about to drop the column `nb_prospect` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the `Resources` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `capacity` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `Event` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Resources" DROP CONSTRAINT "Resources_eventId_fkey";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "nb_prospect",
ADD COLUMN     "capacity" INTEGER NOT NULL,
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "name" SET NOT NULL;

-- AlterTable
ALTER TABLE "Subject" ADD COLUMN     "proposed" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "Resources";
