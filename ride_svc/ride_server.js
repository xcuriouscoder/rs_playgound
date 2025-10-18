const postgresClient = require('pg');
const express = require('express');
const app = express();

//const postgresPort = process.env.PORT || 5531;
const postgresHost = process.env.POSTGRES_HOST || 'localhost';
const postgresUser = process.env.POSTGRES_USER || 'postgres';
const postgresPassword = process.env.POSTGRES_PASSWORD || 'example';
const postgresDatabase = process.env.POSTGRES_DB || 'uberstuff';
const port = process.env.PORT || 3003; // Use the port provided by the host or default to 3000

// const client = new postgresClient.Client({ 
//     user: postgresUser, 
//     host: postgresHost, 
//     database: postgresDatabase, 
//     password: postgresPassword});

const pgPool = new postgresClient.Pool({ 
    user: postgresUser, 
    host: postgresHost, 
    database: postgresDatabase, 
    password: postgresPassword});

// Middleware to parse JSON requests
app.use(express.json());

app.listen(port, () => {
    console.log(`Ride Server listening on port ${port}`);
    // await client.connect()
    
    // const res = await client.query('SELECT $1::text as message', ['Hello Postgres world!'])
    // console.log(res.rows[0].message) // Hello world!
    // await client.end()
});

 // Define a route to handle incoming requests
app.get('/', (req, res) => {
  res.send('Hello, From Ride Service!');
});

// Read (GET) all items
app.get('/rides', async (req, res) => {

    console.log('GET Header userid ' + req.headers.userid);

    // res.json({ message: 'This is where ride data would be returned' });
    // res.status(200);

//    await client.connect();

    const allrides = await pgPool.query('SELECT * FROM rides WHERE userid = $1', [req.headers.userid]);
//    await client.end();
    console.log(allrides.rows);
    res.json(allrides.rows);
});

// Create (POST) a new item
app.post('/rides', async (req, res) => {
    console.log('POST Header userid ' + req.headers.userid);
    console.log('POST Body ' + req.body);

 //   await client.connect();
    const insertRideText = 'INSERT INTO rides(userid, destination, fare, passengers) VALUES($1, point($2, $3), $4, $5) RETURNING *';
    const insertRideValues = [req.headers.userid, req.body.destinationlatitude, req.body.destinationlongitude, req.body.fare, req.body.passengers];   
    // const insertRideText = 'INSERT INTO rides(userid, source, destination, fare, passengers) VALUES($1, ST_POINT($2, $3), ST_POINT($4, $5), $6, $7) RETURNING *';
    // const insertRideValues = [req.headers.userid, req.body.sourcelatitude, req.body.sourcelongitude, req.body.destinationlatitude, req.body.destinationlongitude, req.body.fare, req.body.passengers];   
    const newride =  await pgPool.query(insertRideText, insertRideValues);
 //   await client.end();
    console.log(newride.rows[0]);
    res.status(201).json(newride.rows[0]);
});
