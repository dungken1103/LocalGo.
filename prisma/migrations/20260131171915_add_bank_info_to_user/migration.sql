-- AlterTable
ALTER TABLE "owner_application" ADD COLUMN     "bankName" TEXT;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "bankAccount" TEXT,
ADD COLUMN     "bankName" TEXT,
ADD COLUMN     "phone" TEXT;
