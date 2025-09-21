-- CreateTable
CREATE TABLE "security_logs" (
    "id" SERIAL NOT NULL,
    "event_type" VARCHAR(50) NOT NULL,
    "severity" VARCHAR(20) NOT NULL,
    "user_id" VARCHAR(255),
    "email" VARCHAR(255),
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "metadata" JSONB,
    "message" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "security_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_user_id" ON "security_logs"("user_id");

-- CreateIndex
CREATE INDEX "idx_email" ON "security_logs"("email");

-- CreateIndex
CREATE INDEX "idx_event_type" ON "security_logs"("event_type");

-- CreateIndex
CREATE INDEX "idx_created_at" ON "security_logs"("created_at");