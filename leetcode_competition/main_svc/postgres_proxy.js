const postgresClient = require('pg');

const postgresHost = 'db';
const postgresUser = process.env.POSTGRES_USER || 'postgres';
const postgresPassword = process.env.POSTGRES_PASSWORD || 'example';
const postgresDatabase = process.env.POSTGRES_DB || 'leetstuff';

const pgPool = new postgresClient.Pool({ 
    user: postgresUser, 
    host: postgresHost, 
    database: postgresDatabase, 
    password: postgresPassword});

async function getAllCompetitions() {
    return await pgPool.query('SELECT * FROM competitions');
}
exports.getAllCompetitions = getAllCompetitions;

async function getProblemsForCompetitionId(competitionId) {
    return await pgPool.query('SELECT problems.* FROM problems join competitions ON competitions.problems @> ARRAY[problems.id] WHERE competitions.id = $1', [competitionId]);
}
exports.getProblemsForCompetitionId = getProblemsForCompetitionId;

async function getProblemById(problemId) {
    return await pgPool.query('SELECT * FROM problems WHERE id = $1', [problemId]);
}
exports.getProblemById = getProblemById;

async function submitProblemSolutionToStorage(userId, problemId, competitionId, status) {
    const submitText = "SELECT * FROM SubmitAnswerToCompetitionProblem($1, $2, $3, $4)";
    const submitValues = [competitionId, problemId, userId, status];
    const result = await pgPool.query(submitText, submitValues);
//    console.log('Submission stored with running score: ' + JSON.stringify(result));
    return result.rows[0];
//    return result.rows[0].submitanswertocompetitionproblem;
}
exports.submitProblemSolutionToStorage = submitProblemSolutionToStorage;

async function createUserInStorage(username, email) {
    const insertUserText = 'INSERT INTO users(username, email, passwordHash) VALUES($1, $2, $3) RETURNING *';
    const insertUserValues = [username, email, "fishy"];
    const newUser = await pgPool.query(insertUserText, insertUserValues);
    return newUser;
}
exports.createUserInStorage = createUserInStorage;

async function getCompetitionProblemResultForUser(userId, competitionId, problemId) {
    const queryText = 'SELECT status FROM ProblemResults WHERE userId = $1 AND competitionId = $2 AND problemId = $3 ORDER BY createdat DESC LIMIT 1';
    const queryValues = [userId, competitionId, problemId];
    const result = await pgPool.query(queryText, queryValues);
    return result.rows.length > 0 ? result.rows[0].status : null;
};
exports.getCompetitionProblemResultForUser = getCompetitionProblemResultForUser;