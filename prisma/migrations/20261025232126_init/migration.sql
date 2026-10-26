-- CreateEnum
CREATE TYPE "Category" AS ENUM ('COSMETICS', 'NAILS', 'MAKEUP', 'TOOLS');

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "imagePath" TEXT,
    "description" TEXT,
    "costPrice" DECIMAL(12,2) NOT NULL,
    "markupPercentage" DECIMAL(6,2),
    "salePrice" DECIMAL(12,2) NOT NULL,
    "category" "Category" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_code_key" ON "Product"("code");
