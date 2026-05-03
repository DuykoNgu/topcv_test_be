/*
  Warnings:

  - Added the required column `updated_at` to the `submission_values` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `submissions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "fields" ADD COLUMN     "created_by" TEXT,
ADD COLUMN     "delete_flag" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updated_by" TEXT,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "forms" ADD COLUMN     "created_by" TEXT,
ADD COLUMN     "delete_flag" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updated_by" TEXT,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "submission_values" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "created_by" TEXT,
ADD COLUMN     "delete_flag" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updated_by" TEXT,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "submissions" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "created_by" TEXT,
ADD COLUMN     "delete_flag" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updated_by" TEXT,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "created_by" TEXT,
ADD COLUMN     "delete_flag" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updated_by" TEXT,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;
