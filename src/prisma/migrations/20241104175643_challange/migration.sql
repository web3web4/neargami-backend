-- CreateTable
CREATE TABLE "challange" (
    "id" SERIAL NOT NULL,
    "accountId" VARCHAR(255),
    "message" VARCHAR(255),
    "signature" VARCHAR(255),
    "publickey" VARCHAR(255),
    "nonce" VARCHAR(255),

    CONSTRAINT "challange_pkey" PRIMARY KEY ("id")
);
