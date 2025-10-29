const express = require('express');
//const redis = require("redis");
const { getAllCompetitions, getProblemsForCompetitionId, getProblemById } = require('./postgres_proxy');
//const { sendRideActivationToQueue } = require('./kafka_proxy');
const app = express();
const port = process.env.PORT || 3004;

// Middleware to parse JSON requests
app.use(express.json());

app.listen(port, () => {
    console.log(`Leet Server listening on port ${port}`);
});

app.get('/competitions', async (req, res) => {

    const comps = await getAllCompetitions();
    console.log(comps.rows);
    res.json(comps.rows);
});

app.get('/competitions/:id/problems', async (req, res) => {

    const problems = await getProblemsForCompetitionId(req.params.id);
    console.log(problems.rows);
    res.json(problems.rows);
});

// // Create (POST) a new item
// app.post('/v1/rides', async (req, res) => {
//     console.log('POST Header userid ' + req.headers.userid);
//     console.log('POST Body ' + req.body);

//     const newride = await createRideInStorage(req);
//     console.log(newride.rows[0]);
//     res.status(201).json(newride.rows[0]);
// });