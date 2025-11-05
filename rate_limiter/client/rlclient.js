const yargs = require("yargs");
const { Worker } = require('worker_threads');

console.log("This is a placeholder file for rlclient.js");


const { rateLimitedRequest } = require('./ratelimit_client');
async function main() {
    const fixedWorker = new Worker('./worker.js', { workerData: "fixed" });
    const slidingWorker = new Worker('./worker.js', { workerData: "sliding" });
    const tokenWorker = new Worker('./worker.js', { workerData: "token" });
}

main();