const redis = require("redis");
const redistClient = redis.createClient({ url : "redis://redis" });//  = createClient();
redistClient.connect();

async function updateScoreInRedis(userId, competitionId, score) {
    const redisKey = `competition:${competitionId}:`;
    await redistClient.zAdd(redisKey, { value: userId, score: score });
    console.log(`Updated Redis Key ${redisKey} with score ${score} for user ${userId}`);
}
exports.updateScoreInRedis = updateScoreInRedis;

async function getTopScoresFromRedis(competitionId, topN) {
    const redisKey = `competition:${competitionId}:`;
    const topScores = await redistClient.zRangeWithScores(redisKey, 0, topN - 1, { REV: true });
    console.log(`Fetched top ${topN} scores from Redis Key ${redisKey}`);
    return topScores;
}
exports.getTopScoresFromRedis = getTopScoresFromRedis;