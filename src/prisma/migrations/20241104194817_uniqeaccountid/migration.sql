/*
  Warnings:

  - A unique constraint covering the columns `[accountId]` on the table `challangelog` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "challangelog_accountId_key" ON "challangelog"("accountId");
