-- Add missing Booking amount column
-- Migration: add_booking_amount_field

-- Add amount column (should not fail if exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='Booking' AND column_name='amount') THEN
        ALTER TABLE "Booking" ADD COLUMN "amount" INTEGER;

        -- Update existing records: copy price to amount
        UPDATE "Booking" SET "amount" = "price" WHERE "amount" IS NULL;
    END IF;
END $$;
