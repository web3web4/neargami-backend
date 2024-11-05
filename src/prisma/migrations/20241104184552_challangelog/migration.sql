/*
  Warnings:

  - You are about to drop the `challange` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "challange";

-- CreateTable
CREATE TABLE "challangelog" (
    "id" SERIAL NOT NULL,
    "accountId" VARCHAR(255),
    "challange" VARCHAR(255),
    "message" VARCHAR(255),
    "signature" VARCHAR(255),
    "publickey" VARCHAR(255),
    "nonce" VARCHAR(255),

    CONSTRAINT "challangelog_pkey" PRIMARY KEY ("id")
);
