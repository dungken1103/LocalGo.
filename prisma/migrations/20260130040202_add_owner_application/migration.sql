-- CreateEnum
CREATE TYPE "OwnerApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "avatar" TEXT;

-- CreateTable
CREATE TABLE "owner_application" (
    "id" TEXT NOT NULL,
    "slug" TEXT,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "avatar" TEXT,
    "bankAccount" TEXT NOT NULL,
    "status" "OwnerApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "owner_application_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "owner_application_slug_key" ON "owner_application"("slug");

-- AddForeignKey
ALTER TABLE "owner_application" ADD CONSTRAINT "owner_application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
