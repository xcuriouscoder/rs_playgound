
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
DECLARE
    pass_count INT;
BEGIN
    UPDATE rides
    SET passengers = passenger_count,
        updatedAt = NOW()
    WHERE id = prideid
        AND userid = puserid 
        AND rideStatus = 0
    RETURNING passengers INTO pass_count;

    IF pass_count IS NULL OR pass_count != passenger_count THEN
        RAISE EXCEPTION 'Ride cannot be updated. Either it does not exist or is not in a state that can be updated.';
    END IF;
END;
$$;


create or replace PROCEDURE ActivateRide(
    puserid UUID,
    prideid UUID
)
LANGUAGE plpgsql
AS $$
DECLARE
    ride_status INT;

BEGIN
    UPDATE rides
    SET rideStatus = 1,
        updatedAt = NOW()
    WHERE id = prideid
        AND userid = puserid 
        AND rideStatus = 0
    RETURNING rideStatus INTO ride_status;

    IF ride_status IS NULL OR ride_status != 1 THEN
        RAISE EXCEPTION 'Ride cannot be activated. Either it does not exist or is not in a state that can be activated.';
    END IF;
END;
$$;