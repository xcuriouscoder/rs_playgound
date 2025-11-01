const superagent = require('superagent');

async function postResults(competitionId, userId, problemId, result) {
    // Data to be sent
    const data = {
        competitionId: competitionId,
        userId: userId,
        problemId: problemId,
        result: result
    };
    try {
        // Make request
        const { body } = await superagent.post('http://leet-main-svc:3004/results')
            .send(data);
        // Show response data
   //     console.log(body);
        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
}
exports.postResults = postResults;


