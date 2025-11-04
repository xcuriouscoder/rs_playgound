const express = require('express');
const app = express();

const redis = require("redis");

const port = process.env.PORT || 3010;
//const RedisHost = process.env.REDIS_HOST || 'localhost';
const RedisUrl = `redis://redis:6379`;
const redistClient = redis.createClient({ url : RedisUrl });//  = createClient();

app.use(express.json());

app.listen(port, () => {
    console.log(`Rate Server listening on port ${port}`);
    redistClient.connect();
});

app.get('/', async (req, res) => {

    console.log('Rate limit webserver root called');

    const userid = req.headers.userid;

    if(userid.startsWith('sliding')) {
        await slidingWindowThrottle(req, res);
    } else { 
        if(userid.startsWith('fixed')) {
            await fixedWindowThrottle(req, res);
        } else {
            await tokenBucketThrottle(req, res);
        }
    }        
    
});

async function fixedWindowThrottle(req, res) {
    const MaxPerMinute = 10;

    const userid = req.headers.userid;
    const datetime = new Date();
    const hours = datetime.getHours();
    const minutes = datetime.getMinutes();
    const redisKey = `rate_limit_${userid}_${hours}:${minutes}`;
    console.log(`Throttle check for user ${userid} with key ${redisKey}`);

    const current = await redistClient.incr(redisKey)
    
    if(current === 1) {
        await redistClient.expire(redisKey, 60); // Set TTL of 60 seconds
    }

    if(current > MaxPerMinute) {
        console.log(`User ${userid} has exceeded the rate limit with count ${current}`);
        res.status(429).send({ message: 'Too Many Requests - Fixed limit exceeded' });
    } else {
        console.log(`User ${userid} is within the rate limit with count ${current}`);
        res.status(201).send({ message: 'Fixed Request successful' });
    }
}

async function slidingWindowThrottle(req, res) {
    const MaxPerMinute = 10;

    const userid = req.headers.userid;
    const datetime = new Date();
    const hours = datetime.getHours();
    const minutes = datetime.getMinutes();
    const previousMinute = (minutes === 0) ? 59 : minutes - 1;
    const previousHour = (minutes === 0) ? ((hours === 0) ? 23 : hours -1) : hours;
    const redisKey = `rate_limit_${userid}_${hours}:${minutes}`;
    const redisPrevKey = `rate_limit_${userid}_${previousHour}:${previousMinute}`;
    console.log(`Throttle check for user ${userid} with key ${redisKey}`);

    const current = await redistClient.incr(redisKey)
    
    if(current === 1) {
        await redistClient.expire(redisKey, 60); // Set TTL of 60 seconds
    }

    const prevCount = await redistClient.get(redisPrevKey) || 0;
    const weightedPrevCount = (prevCount * (60 - datetime.getSeconds())) / 60;
    const totalCount = current + weightedPrevCount;

    if(totalCount > MaxPerMinute) {
        console.log(`User ${userid} has exceeded the rate limit with count ${totalCount}`);
        res.status(429).send({ message: 'Too Many Requests - Sliding limit exceeded' });
    } else {
        console.log(`User ${userid} is within the rate limit with count ${totalCount}`);
        res.status(201).send({ message: 'Sliding Request successful' });
    }
}

const luaScript = `
local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local rate = tonumber(ARGV[2])
local now = tonumber(ARGV[3])

local bucket = redis.call('HMGET', key, 'tokens', 'last_refill_time')
local currTokens = tonumber(bucket[1])
local lastRefill = tonumber(bucket[2])

if not currTokens or not lastRefill then
    currTokens = capacity
    lastRefill = now
end

local elapsedSeconds = math.max(0, ((now - lastRefill) / 1000))
local tokensToAdd = math.floor(elapsedSeconds * rate)

currTokens = math.min(capacity, currTokens + tokensToAdd)

if tokensToAdd > 0 then
    lastRefill = now
end

local allowed = currTokens > 0


if allowed then
    currTokens = currTokens - 1
    redis.call('HMSET', key, 'tokens', currTokens, 'last_refill_time', lastRefill)
end

redis.call('EXPIRE', key, 3600)

return allowed
`;

async function tokenBucketThrottle(req, res) {
    const MaxTokens = 10;
    const RefillRatePerSecond = 1;

    const userid = req.headers.userid;
    const redisKey = `token_bucket_${userid}`;

    console.log(`Date.now(): ${Date.now()} and /1000 gives ${Math.floor((Date.now()/1000.0))}`);

    console.log(`Token Bucket Throttle check for user ${userid} with key ${redisKey}`);
    const allowed = await redistClient.eval(luaScript, {
        keys: [redisKey],
        arguments: [MaxTokens.toString(), RefillRatePerSecond.toString(), Date.now().toString()]
    });

    console.log(`Token Bucket Throttle eval result for user ${userid}: ${allowed}`);

    if(allowed) {
        console.log(`User ${userid} is within the token bucket rate limit`);
        res.status(201).send({ message: 'Token Request successful' });
    } else {
        console.log(`User ${userid} has exceeded the token bucket rate limit`);
        res.status(429).send({ message: 'Too Many Requests - Toekn Rate limit exceeded' });
    }
}



