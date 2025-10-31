const { Worker } = require('worker_threads');

const workers = [];
const maxWorkers = process.env.MAX_CODE_RUNNERS;

for (let i = 1; i <= maxWorkers; i++) {
    const worker = new Worker('./register_worker.js', { workerData: i });

    workers.push(worker);
}

