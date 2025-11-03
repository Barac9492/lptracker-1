-- Create LP table
CREATE TABLE "LP" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL UNIQUE,
    "contactName" TEXT,
    "email" TEXT,
    "geo" TEXT,
    "strategy" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "messageAngle" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Signal table
CREATE TABLE "Signal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lpId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "url" TEXT,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Signal_lpId_fkey" FOREIGN KEY ("lpId") REFERENCES "LP"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create Outreach table
CREATE TABLE "Outreach" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lpId" TEXT NOT NULL,
    "subject" TEXT,
    "body" TEXT,
    "channel" TEXT NOT NULL DEFAULT 'email',
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Outreach_lpId_fkey" FOREIGN KEY ("lpId") REFERENCES "LP"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create indexes
CREATE INDEX "LP_score_idx" ON "LP"("score");
CREATE INDEX "Signal_lpId_idx" ON "Signal"("lpId");
CREATE INDEX "Signal_createdAt_idx" ON "Signal"("createdAt");
CREATE INDEX "Outreach_lpId_idx" ON "Outreach"("lpId");

-- Function to generate CUID-like IDs
CREATE OR REPLACE FUNCTION generate_cuid() RETURNS TEXT AS $$
DECLARE
    timestamp_part TEXT;
    counter_part TEXT;
    random_part TEXT;
BEGIN
    timestamp_part := LPAD(TO_HEX(FLOOR(EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT), 8, '0');
    counter_part := LPAD(TO_HEX(FLOOR(RANDOM() * 1679616)::INT), 4, '0');
    random_part := LPAD(TO_HEX(FLOOR(RANDOM() * 4294967296)::BIGINT), 8, '0') ||
                   LPAD(TO_HEX(FLOOR(RANDOM() * 4294967296)::BIGINT), 8, '0');
    RETURN 'c' || timestamp_part || counter_part || random_part;
END;
$$ LANGUAGE plpgsql;
