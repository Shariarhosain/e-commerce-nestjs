/*
  Warnings:

  - You are about to drop the `email_verifications` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."email_verifications" DROP CONSTRAINT "email_verifications_userId_fkey";

-- AlterTable
ALTER TABLE "public"."users" ALTER COLUMN "isEmailVerified" SET DEFAULT true;

-- DropTable
DROP TABLE "public"."email_verifications";
