const redis = require("redis");

const express = require('express');
const app = express();

const port = process.env.PORT || 3001; // Use the port provided by the host or default to 3000
const RedisHost = process.env.REDIS_HOST || 'localhost';
const RedisUrl = `redis://${RedisHost}:6379`;

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  console.log(`Redis Url: ${RedisUrl}`);
});

 // Define a route to handle incoming requests
app.get('/', (req, res) => {
  res.send('Hello, Express!');
});

// Middleware to parse JSON requests
app.use(express.json());

// Create (POST) a new item
app.post('/locations', (req, res) => {

//    console.log(`Redis Url for post: ${RedisUrl}`);

    const userid = req.headers.userid;
//    console.log('userid ' + userid);

    const redistClient = redis.createClient({ url : RedisUrl });//  = createClient();
    redistClient.connect();
    redistClient.GEOADD(
        "seattle", 
        {
            longitude: req.body.longitude, // string works as well
            latitude: req.body.latitude, // string works as well
            member: userid
        }).then((data) => res.status(201).json({ message: 'Location added' }));


    console.log('Added location for user ' + userid);

    redistClient.quit();
});

// Read (GET) all items
app.get('/locations', async (req, res) => {

    console.log('GET Header userid ' + req.headers.userid);

    const redistClient = redis.createClient({ url : RedisUrl });//  = createClient();
    redistClient.connect();
    // redistClient.GEOPOS("seattle", req.headers.userid)
    //     .then((data) => {
    //     console.log(data);
    //     res.json(data);
    // });

    // redistClient.subscribe("test", (message, channel) => {
    //     console.log(`Received message: ${message} on channel: ${channel}`);
    //     res.json(message);
    // });

    // const result = await redistClient.geosearch("seattle", "FROMLONLAT", -122.1468915306806, 47.69238024774168, "BYRADIUS", 100, "km", "ASC")
    // console.log(result)

    // redistClient.geoSearch("seattle", {
    //     longitude: parseFloat(req.query.longitude),
    //     latitude: parseFloat(req.query.latitude),
    //     radius: 100,
    //     unit: 'km'

    redistClient.quit();
});

// Read (GET) a specific item by ID
// app.get('/items/:id', (req, res) => {
//   const id = parseInt(req.params.id);
//   const item = data.find((item) => item.id === id);
//   if (!item) {
//     res.status(404).json({ error: 'Item not found' });
//   } else {
//     res.json(item);
//   }
// });