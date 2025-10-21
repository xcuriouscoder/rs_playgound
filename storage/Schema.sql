
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

create or replace PROCEDURE UpdatePassengerCount(
    puserid UUID,
    prideid UUID,
    passenger_count INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE rides
    SET passengers = passenger_count,
        updatedAt = NOW()
    WHERE id = prideid
        AND userid = puserid 
        AND rideStatus = 0;
END;
$$;