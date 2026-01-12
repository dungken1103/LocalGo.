/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Booking` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `Car` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `Contract` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `OtpVerification` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `Wallet` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `WalletTransaction` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - Made the column `slug` on table `Car` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
ALTER TYPE "ContractStatus" ADD VALUE 'REFUNDED';

-- AlterTable
ALTER TABLE "Car" ALTER COLUMN "slug" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Booking_slug_key" ON "Booking"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Car_slug_key" ON "Car"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Contract_slug_key" ON "Contract"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "OtpVerification_slug_key" ON "OtpVerification"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_slug_key" ON "Wallet"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "WalletTransaction_slug_key" ON "WalletTransaction"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "user_slug_key" ON "user"("slug");
