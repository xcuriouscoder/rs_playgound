const postgresClient = require('pg');
const express = require('express');
const app = express();

const postgresHost = process.env.POSTGRES_HOST || 'localhost';
const postgresUser = process.env.POSTGRES_USER || 'postgres';
const postgresPassword = process.env.POSTGRES_PASSWORD || 'example';
const postgresDatabase = process.env.POSTGRES_DB || 'uberstuff';
const port = process.env.PORT || 3003;

const pgPool = new postgresClient.Pool({ 
    user: postgresUser, 
    host: postgresHost, 
    database: postgresDatabase, 
    password: postgresPassword});

// Middleware to parse JSON requests
app.use(express.json());

app.listen(port, () => {
    console.log(`Ride Server listening on port ${port}`);
});

 // Define a route to handle incoming requests
app.get('/', (req, res) => {
  res.send('Hello, From Ride Service!');
});

// Read (GET) all items for User
app.get('/rides', async (req, res) => {

//    console.log('GET Header userid ' + req.headers.userid);

    const allrides = await pgPool.query('SELECT * FROM rides WHERE userid = $1', [req.headers.userid]);
    console.log(allrides.rows);
    res.json(allrides.rows);
});

// Create (POST) a new item
app.post('/rides', async (req, res) => {
    console.log('POST Header userid ' + req.headers.userid);
    console.log('POST Body ' + req.body);

    const insertRideText = 'INSERT INTO rides(userid, source, destination, fare, passengers) VALUES($1, point($2, $3), point($4, $5), $6, $7) RETURNING *';
    const insertRideValues = [req.headers.userid, req.body.sourcelatitude, req.body.sourcelongitude, req.body.destinationlatitude, req.body.destinationlongitude, req.body.fare, req.body.passengers];   
    const newride =  await pgPool.query(insertRideText, insertRideValues);
    console.log(newride.rows[0]);
    res.status(201).json(newride.rows[0]);
});
