const cassandra = require('cassandra-driver');
const { v4: uuidv4 } = require('uuid');
 
// Replace 'Username' and 'Password' with the username and password from your cluster settings
const authProvider = new cassandra.auth.PlainTextAuthProvider('Username', 'Password');
// Replace the PublicIPs with the IP addresses of your clusters
const contactPoints = ['cassandra'];
// Replace DataCenter with the name of your data center, for example: 'AWS_VPC_US_EAST_1'
const localDataCenter = 'datacenter1';
 
const client = new cassandra.Client({contactPoints: contactPoints, authProvider: authProvider, localDataCenter: localDataCenter}); //, keyspace:'rate_limiter'});
const ksclient = new cassandra.Client({contactPoints: contactPoints, authProvider: authProvider, localDataCenter: localDataCenter, keyspace:'rate_limiter'});

async function initializeCassandra() {
    console.log("Initializing Cassandra keyspace and tables");

    await client.connect();
    const query = `CREATE KEYSPACE IF NOT EXISTS rate_limiter WITH REPLICATION = {'class': 'SimpleStrategy', 'replication_factor': 1};`;
    await client.execute(query);
    await client.shutdown();

    const queryTable = `
CREATE TABLE IF NOT EXISTS user_hits
(
    id UUID PRIMARY KEY,
    username TEXT,
    restCallTimestamp TIMESTAMP,
    httpResultCode INT
);`;

    await ksclient.connect();
    await ksclient.execute(queryTable);
    console.log("Cassandra keyspace and table initialized");
}
exports.initializeCassandra = initializeCassandra;

async function logRequestToCassandra(username, httpResultCode) {
    const query = 'INSERT INTO user_hits (id, username, restCallTimestamp, httpResultCode) VALUES (?, ?, toTimestamp(now()), ?)';
    const params = [uuidv4(), username, httpResultCode];
    await ksclient.execute(query, params, { prepare: true });
}
exports.logRequestToCassandra = logRequestToCassandra;

async function getRequestLogsFromCassandra(username) {
    const query = 'SELECT * FROM user_hits WHERE username = ? ALLOW FILTERING';
    const params = [username];
    const result = await ksclient.execute(query, params, { prepare: true });
    return result;
}
exports.getRequestLogsFromCassandra = getRequestLogsFromCassandra;  