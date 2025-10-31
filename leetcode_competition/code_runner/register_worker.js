const { workerData } = require('worker_threads');
const { Kafka } = require('kafkajs');
const { processCodeSubmission } = require("./do_code_run");

const kafka = new Kafka({
    clientId: "code-runner",
    brokers: ["kafka:9092"],
});

const kafkatopic = "codesubmissions";

const consumer = kafka.consumer({ 
    groupId: "code-runner-group",
    heartbeatInterval: 11000, // should be lower than sessionTimeout
    sessionTimeout: 30000, 
});

async function runWorker() {
    console.log(`Connecting Code Runner ${workerData}`);
    await consumer.connect();
    console.log(`Connected Code Runner ${workerData} successfully`);
    const threadNumber = workerData;

    await consumer.subscribe({ topic: kafkatopic, fromBeginning: true });

    consumer.run({
        eachMessage: async ({ topic, partition, message }) => {

            console.log(`${new Date().toString()} -- Worker ${threadNumber} processing message from topic ${topic}, partition ${partition}, offset ${message.offset}`);
            const wasSent = await processCodeSubmission(topic, partition, message, threadNumber);
            console.log(`${new Date().toString()} -- Worker ${threadNumber} completed processing message from topic ${topic}, partition ${partition}, offset ${message.offset} with result: ${wasSent ? "Success" : "Failure"}`);
            if (wasSent) {
                consumer.commitOffsets([{
                    topic: topic,
                    partition: partition,
                    offset: (Number(message.offset) + 1).toString(),
                }]);
            }
        },
    });
}

runWorker().catch(console.error);
