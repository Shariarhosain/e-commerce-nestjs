-- AlterTable
ALTER TABLE "public"."categories" ALTER COLUMN "slug" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."products" ALTER COLUMN "slug" DROP NOT NULL;
