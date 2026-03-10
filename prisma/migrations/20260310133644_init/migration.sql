-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'VIEWER');

-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('REELS', 'STORIES', 'POSTS', 'VIDEOS');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'ADMIN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "shareToken" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Metrics" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "viewsFromAds" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "viewsFollowers" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "viewsNonFollowers" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "accountsReached" INTEGER NOT NULL DEFAULT 0,
    "accountsReachedChange" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "interactions" INTEGER NOT NULL DEFAULT 0,
    "interactionsFromAds" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "interactionsFollowers" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "interactionsNonFollowers" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "saves" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "reposts" INTEGER NOT NULL DEFAULT 0,
    "profileVisits" INTEGER NOT NULL DEFAULT 0,
    "profileVisitsChange" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "externalLinkTaps" INTEGER NOT NULL DEFAULT 0,
    "externalLinkTapsChange" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "followsGained" INTEGER NOT NULL DEFAULT 0,
    "unfollows" INTEGER NOT NULL DEFAULT 0,
    "netFollowerGrowth" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentStat" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "type" "ContentType" NOT NULL,
    "viewsPct" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "interactionsPct" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "ContentStat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopContent" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "type" "ContentType" NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3),
    "caption" TEXT,
    "rank" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TopContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AudienceData" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "genderMen" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "genderWomen" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "age13to17" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "age18to24" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "age25to34" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "age35to44" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "age45to54" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "age55to64" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "age65plus" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "topCity1" TEXT,
    "topCity1Pct" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "topCity2" TEXT,
    "topCity2Pct" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "topCity3" TEXT,
    "topCity3Pct" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "topCity4" TEXT,
    "topCity4Pct" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "topCity5" TEXT,
    "topCity5Pct" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "AudienceData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Report_shareToken_key" ON "Report"("shareToken");

-- CreateIndex
CREATE UNIQUE INDEX "Metrics_reportId_key" ON "Metrics"("reportId");

-- CreateIndex
CREATE UNIQUE INDEX "AudienceData_reportId_key" ON "AudienceData"("reportId");

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Metrics" ADD CONSTRAINT "Metrics_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentStat" ADD CONSTRAINT "ContentStat_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopContent" ADD CONSTRAINT "TopContent_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AudienceData" ADD CONSTRAINT "AudienceData_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;
