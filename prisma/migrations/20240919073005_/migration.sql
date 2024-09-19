/*
  Warnings:

  - A unique constraint covering the columns `[itemCode]` on the table `Item` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `health` to the `Character` table without a default value. This is not possible if the table is not empty.
  - Added the required column `money` to the `Character` table without a default value. This is not possible if the table is not empty.
  - Added the required column `power` to the `Character` table without a default value. This is not possible if the table is not empty.
  - Added the required column `itemCode` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `itemStats` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `Item` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Character` ADD COLUMN `health` INTEGER NOT NULL,
    ADD COLUMN `money` INTEGER NOT NULL,
    ADD COLUMN `power` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Item` ADD COLUMN `itemCode` VARCHAR(191) NOT NULL,
    ADD COLUMN `itemStats` VARCHAR(191) NOT NULL,
    ADD COLUMN `price` INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Item_itemCode_key` ON `Item`(`itemCode`);
