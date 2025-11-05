const { workerData } = require('worker_threads');
const { rateLimitedRequest } = require('./ratelimit_client');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

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

        if(result === 201) {
            successCount++;
            delayTime = Math.max(0, delayTime - delta);
            console.log(`${workerData}  Success count: ${successCount}, Fail count: ${failCount}, New delay time: ${delayTime} ms`);
        } else {
            failCount++;
            delayTime = delayTime + delta;
            console.log(`${workerData}  Success count: ${successCount}, Fail count: ${failCount}, New delay time: ${delayTime} ms`);
        }

        const endTime = Date.now();
        console.log(`${workerData} Elapsed time: ${(endTime - startTime)/1000} seconds`);

        await delay(delayTime);
    }

    console.log(`**** Worker with rate limit type: ${workerData} completed. Total Success count: ${successCount}, Total Fail count: ${failCount} and took ${(Date.now() - startTime)/1000} seconds ****`);
}

runWorker().catch(console.error);
