-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('PENDING', 'PAID', 'CANCELLED');

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "slug" TEXT,
ALTER COLUMN "status" SET DEFAULT 'PENDING_PAYMENT';

-- AlterTable
ALTER TABLE "Car" ADD COLUMN     "slug" TEXT;

-- AlterTable
ALTER TABLE "OtpVerification" ADD COLUMN     "slug" TEXT;

-- AlterTable
ALTER TABLE "Wallet" ADD COLUMN     "slug" TEXT;

-- AlterTable
ALTER TABLE "WalletTransaction" ADD COLUMN     "contractId" TEXT,
ADD COLUMN     "slug" TEXT;

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "slug" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL,
    "slug" TEXT,
    "bookingId" TEXT NOT NULL,
    "renterId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "totalAmount" INTEGER NOT NULL,
    "status" "ContractStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Contract_bookingId_key" ON "Contract"("bookingId");

-- AddForeignKey
ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_renterId_fkey" FOREIGN KEY ("renterId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
