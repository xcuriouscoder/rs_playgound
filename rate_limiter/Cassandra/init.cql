CREATE KEYSPACE IF NOT EXISTS rate_limiter WITH REPLICATION = {'class': 'SimpleStrategy', 'replication_factor': 1};
USE rate_limiter;

CREATE TABLE IF NOT EXISTS user_hits
(
    id UUID PRIMARY KEY DEFAULT uuid(),
    username TEXT,
    restCallTimestamp TIMESTAMP,
    httpResultCode INT
);
