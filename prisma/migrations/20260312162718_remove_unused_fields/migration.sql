/*
  Warnings:

  - You are about to drop the column `accountsReachedChange` on the `Metrics` table. All the data in the column will be lost.
  - You are about to drop the column `externalLinkTaps` on the `Metrics` table. All the data in the column will be lost.
  - You are about to drop the column `externalLinkTapsChange` on the `Metrics` table. All the data in the column will be lost.
  - You are about to drop the column `interactionsFollowers` on the `Metrics` table. All the data in the column will be lost.
  - You are about to drop the column `interactionsFromAds` on the `Metrics` table. All the data in the column will be lost.
  - You are about to drop the column `interactionsNonFollowers` on the `Metrics` table. All the data in the column will be lost.
  - You are about to drop the column `netFollowerGrowth` on the `Metrics` table. All the data in the column will be lost.
  - You are about to drop the column `profileVisitsChange` on the `Metrics` table. All the data in the column will be lost.
  - You are about to drop the column `reposts` on the `Metrics` table. All the data in the column will be lost.
  - You are about to drop the column `unfollows` on the `Metrics` table. All the data in the column will be lost.
  - You are about to drop the column `viewsFollowers` on the `Metrics` table. All the data in the column will be lost.
  - You are about to drop the column `viewsFromAds` on the `Metrics` table. All the data in the column will be lost.
  - You are about to drop the column `viewsNonFollowers` on the `Metrics` table. All the data in the column will be lost.
  - You are about to drop the `ContentStat` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TopContent` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ContentStat" DROP CONSTRAINT "ContentStat_reportId_fkey";

-- DropForeignKey
ALTER TABLE "TopContent" DROP CONSTRAINT "TopContent_reportId_fkey";

-- AlterTable
ALTER TABLE "Metrics" DROP COLUMN "accountsReachedChange",
DROP COLUMN "externalLinkTaps",
DROP COLUMN "externalLinkTapsChange",
DROP COLUMN "interactionsFollowers",
DROP COLUMN "interactionsFromAds",
DROP COLUMN "interactionsNonFollowers",
DROP COLUMN "netFollowerGrowth",
DROP COLUMN "profileVisitsChange",
DROP COLUMN "reposts",
DROP COLUMN "unfollows",
DROP COLUMN "viewsFollowers",
DROP COLUMN "viewsFromAds",
DROP COLUMN "viewsNonFollowers";

-- DropTable
DROP TABLE "ContentStat";

-- DropTable
DROP TABLE "TopContent";
