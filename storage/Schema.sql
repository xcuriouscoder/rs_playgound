
-- create Rides table
CREATE TABLE IF NOT EXISTS rides
(
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    userId uuid NOT NULL,
    driverId uuid NULL,
    destination point NOT NULL,
    fare int NOT NULL default 0,
    passengers int NOT NULL default 1
);

ALTER TABLE rides ADD COLUMN IF NOT EXISTS source point;