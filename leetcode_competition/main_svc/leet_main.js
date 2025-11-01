const express = require('express');
//const redis = require("redis");
const { 
    getAllCompetitions, 
    getProblemsForCompetitionId, 
    getProblemById, 
    submitProblemSolutionToStorage, 
    createUserInStorage,
    getCompetitionProblemResultForUser
 } = require('./postgres_proxy');
const { submitCodeToQueue } = require('./kafka_proxy');
const { updateScoreInRedis, getTopScoresFromRedis } = require('./redis_client');
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

app.post('/competitions/:competitionId/problems/:problemId/submit', async (req, res) => {
    console.log('POST Header userid ' + req.headers.userid);
    console.log('POST Body ' + req.body);

    const score = await submitProblemSolutionToStorage(
        req.headers.userid, 
        req.params.problemId, 
        req.params.competitionId,
        0);

    console.log(score);

    await submitCodeToQueue(
        req.headers.userid, 
        req.params.competitionId, 
        req.params.problemId, 
        req.body.base64code, 
        req.body.language);

    res.status(201).json({ message: 'Submission received' });
});

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

app.post('/results', async (req, res) => {
    console.log('Results posted ' + JSON.stringify(req.body));
    // Here you would process the webhook data and update your storage accordingly

    const result = await submitProblemSolutionToStorage(
        req.body.userId, 
        req.body.problemId, 
        req.body.competitionId,
        req.body.result);

    console.log('Score calculated for user ' + result.pusername +  ' as ' + result.score);

    await updateScoreInRedis(result.pusername, req.body.competitionId, (result.score + getRandomInt(50000)));

    //console.log('Updated submission with score: ' + result.score);

    res.status(200).json({ message: 'Results received' });
});

app.get('/competitions/:competitionId/leaderboard', async (req, res) => {
    // To be implemented: Fetch leaderboard from storage
    const leaders = await getTopScoresFromRedis(req.params.competitionId, 10);

    const results = JSON.stringify(leaders);
    console.log('Leaderboard: ' + results);
    res.json(leaders);
});

app.post('/users', async (req, res) => {
    console.log('Create User Header userid ' + req.headers.userid);

    const newUser = await createUserInStorage(
        req.body.username, 
        req.body.email);
    console.log('Created new user: ' + JSON.stringify(newUser.rows[0]));
    res.status(201).json(newUser.rows[0]);

});

app.get('/competitions/:competitionId/problems/:problemId/result', async (req, res) => {
    console.log('Submission result Header userid ' + req.headers.userid);
    console.log('GET Params ' + JSON.stringify(req.params));

    const result = await getCompetitionProblemResultForUser(
        req.headers.userid, 
        req.params.competitionId, 
        req.params.problemId);

    console.log('Fetched submission result for user ' + req.headers.userid + ' for competition ' + req.params.competitionId + ' and problem ' + req.params.problemId + ': ' + result);
    res.json({ status: result });
});

// // Create (POST) a new item
// app.post('/v1/rides', async (req, res) => {
//     console.log('POST Header userid ' + req.headers.userid);
//     console.log('POST Body ' + req.body);

//     const newride = await createRideInStorage(req);
//     console.log(newride.rows[0]);
//     res.status(201).json(newride.rows[0]);
// });