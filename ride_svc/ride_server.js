const express = require('express');
const redis = require("redis");
const { getRidesForUserId, createRideInStorage, patchRideInStorage, activateRideInStorage } = require('./postgres_proxy');
const app = express();
const port = process.env.PORT || 3003;

// Middleware to parse JSON requests
app.use(express.json());

app.listen(port, () => {
    console.log(`Ride Server listening on port ${port}`);
});


// Read (GET) all items for User
app.get('/v1/rides', async (req, res) => {

    const allrides = await getRidesForUserId(req);
    console.log(allrides.rows);
    res.json(allrides.rows);
});

// Create (POST) a new item
app.post('/v1/rides', async (req, res) => {
    console.log('POST Header userid ' + req.headers.userid);
    console.log('POST Body ' + req.body);

    const newride = await createRideInStorage(req);
    console.log(newride.rows[0]);
    res.status(201).json(newride.rows[0]);
});

app.patch('/v1/rides/:id/', async (req, res) => {
    console.log('PATCH Header userid ' + req.headers.userid);
    console.log('PATCH Ride id ' + req.params.id);
    console.log('PATCH Body ' + req.body);

    const newride = await patchRideInStorage(req);
    // console.log(newride.rows[0]);
    res.status(201).json(newride.rows[0]);
});

app.patch('/v1/rides/:id/activate', async (req, res) => {
    console.log('PATCH Header userid ' + req.headers.userid);
    console.log('PATCH Ride id ' + req.params.id);

    await activateRideInStorage(req);

    const redistClient = redis.createClient({ url : "redis://redis:6379" });
    redistClient.connect();
    redistClient.publish("riderequested", req.params.id);
    redistClient.quit();

    res.status(201).send({ message: 'Ride activated' });
});

// Read (GET) all items for User
app.get('/v1/registerdrivers', async (req, res) => {
    res.status(200).send({ message: 'Driver registration endpoint' });
});

app.post('/v1/registerdrivers', async (req, res) => {
    console.log('POST Header driverid ' + req.headers.driverid);
    console.log('POST Body ' + req.body.callbackurl);

    const redistClient = redis.createClient({ url : "redis://redis:6379" });
    redistClient.connect();
    redistClient.set(req.headers.driverid, req.body.callbackurl, { expiration: {
        type: 'EX',
        value: 6000
    }});
    redistClient.quit();

    res.status(201).send({ message: 'Driver registered' });
});


