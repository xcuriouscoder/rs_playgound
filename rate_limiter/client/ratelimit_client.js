const superagent = require('superagent');

async function rateLimitedRequest(ratelimit_method) {
    // Data to be sent
    const data = {
        rateLimitType: ratelimit_method
    };
    try {
        const result = await superagent.get('http://localhost:3010/').send(data);

        return result.status;
    } catch (err) {
//        console.error(err.status);
        return err.status;
    }
}
exports.rateLimitedRequest = rateLimitedRequest;


