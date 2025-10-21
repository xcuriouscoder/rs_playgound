
-- create Rides table
CREATE TABLE IF NOT EXISTS rides
(
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    userId uuid NOT NULL,
    driverId uuid NULL,
    sourceLocation point NOT NULL,
    destination point NOT NULL,
    fare int NOT NULL default 0,
    passengers int NOT NULL default 1,
    rideStatus int NOT NULL default 0,
    createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
