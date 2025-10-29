const postgresClient = require('pg');

const postgresHost = process.env.POSTGRES_HOST || 'localhost';
const postgresUser = process.env.POSTGRES_USER || 'postgres';
const postgresPassword = process.env.POSTGRES_PASSWORD || 'example';
const postgresDatabase = process.env.POSTGRES_DB || 'uberstuff';

const pgPool = new postgresClient.Pool({ 
    user: postgresUser, 
    host: postgresHost, 
    database: postgresDatabase, 
    password: postgresPassword});
    
async function createRideInStorage(req) {
    const insertRideText = 'INSERT INTO rides(userid, sourceLocation, destination, fare, passengers) VALUES($1, point($2, $3), point($4, $5), $6, $7) RETURNING *';
    const insertRideValues = [req.headers.userid, req.body.sourcelatitude, req.body.sourcelongitude, req.body.destinationlatitude, req.body.destinationlongitude, req.body.fare, req.body.passengers];
    const newride = await pgPool.query(insertRideText, insertRideValues);
    return newride;
}
exports.createRideInStorage = createRideInStorage;

async function patchRideInStorage(req) {
    const updateRideText = "CALL UpdatePassengerCount($1, $2, $3)";
    const updateRideValues = [req.headers.userid, req.params.id, req.body.passengers];

    const newride = await pgPool.query(updateRideText, updateRideValues);
    return newride;
}
exports.patchRideInStorage = patchRideInStorage;

async function activateRideInStorage(req) {
    const updateRideText = "CALL ActivateRide($1, $2)";
    const updateRideValues = [req.headers.userid, req.params.id];

    const newride = await pgPool.query(updateRideText, updateRideValues);
}
exports.activateRideInStorage = activateRideInStorage;

async function getRidesForUserId(req) {
    return await pgPool.query('SELECT * FROM rides WHERE userid = $1', [req.headers.userid]);
}
exports.getRidesForUserId = getRidesForUserId;

