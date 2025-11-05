const { workerData } = require('worker_threads');
const { rateLimitedRequest } = require('./ratelimit_client');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const RateLimitDelayHeaderName = "x-ratelimit-mstodelay"
const RemainingRequestsHeaderName = "x-ratelimit-remainingrequests"


const startTime = Date.now();
let successCount = 0;
let failCount = 0;
let delayTime = 3000;
const delta = 500;
const iterations = 500;

async function runWorker() {

    console.log(`Worker started with rate limit type: ${workerData}`);

    for(let i = 1; i < iterations; i++) {

        const result = await rateLimitedRequest(workerData);
//        console.log(`${workerData} Request ${i} received response headers: ${JSON.stringify(result)}`);
        const remainingRequests = result.status == 429 ? parseInt(result.response.header[RemainingRequestsHeaderName])
            : parseInt(result.header[RemainingRequestsHeaderName]);
        const recommendedDelay = result.status == 429 ? parseInt(result.response.header[RateLimitDelayHeaderName])
            : parseInt(result.header[RateLimitDelayHeaderName]);

        console.log(`${workerData} Request ${i} completed with status: ${result.status} and recommended delay: ${recommendedDelay} ms and remaining requests: ${remainingRequests}`);

        if(result.status === 201) {
            successCount++;

            if(remainingRequests > 0){
                delayTime = 0;
            }
            else {
                delayTime = recommendedDelay;
            }
        } else {
            failCount++;
            delayTime = recommendedDelay;

        }

        console.log(`${workerData} Success count: ${successCount}, Fail count: ${failCount}, New delay time: ${delayTime} ms`);

        const endTime = Date.now();
        console.log(`${workerData} Elapsed time: ${(endTime - startTime)/1000} seconds`);

        await delay(delayTime);
    }

    console.log(`**** Worker with rate limit type: ${workerData} completed. Total Success count: ${successCount}, Total Fail count: ${failCount} and took ${(Date.now() - startTime)/1000} seconds ****`);
}

runWorker().catch(console.error);
