const { Kafka } = require("kafkajs")
const superagent = require('superagent');

const kafkatopic = "codesubmissions";
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const kafka = new Kafka({
    clientId: "code-runner",
    brokers: ["kafka:9092"],
});
const consumer = kafka.consumer({ groupId: "code-runner-group" });

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

// promise with async/await
async function postResults(competitionId, userId, problemId, result) {
    // Data to be sent
    const data = {
        competitionId: competitionId,
        userId: userId,
        problemId: problemId,
        result: result
    }
    try {
        // Make request
        const { body } =
            await superagent.post('http://leet-main-svc:3004/results')
                .send(data)
        // Show response data
        console.log(body)
        return true;
    } catch (err) {
        console.error(err)
        return false;
    }
};

async function run() {
    console.log("Connecting Consumer");
    await consumer.connect();
    console.log("Consumer Connected Successfully");
    await consumer.subscribe({ topic: kafkatopic, fromBeginning: true });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const prefix = `${topic}[${partition} | ${message.offset}] / ${message.timestamp}`;
            console.log(`- ${prefix} ${message.key}#${message.value}`);
            const submission = JSON.parse(message.value.toString());
            console.log(`Processing submission for User: ${submission.userid}, Competition: ${submission.competitionid}, Problem: ${submission.problemid}`);
            // Create a buffer from the string
            let bufferObj = Buffer.from(submission.code, "base64");

            // Encode the Buffer as a utf8 string
            const decodedString = bufferObj.toString("utf8");
            console.log(`Decoded Code: ${decodedString}`);

            // Here you would add the logic to compile and run the code submission

            await delay(getRandomInt(10) * 1000); // Simulate code processing time

            console.log(`Completed processing submission for User: ${submission.userid}, Competition: ${submission.competitionid}, Problem: ${submission.problemid}`);

            const success = getRandomInt(2) === 1;
            console.log(`Submission Result: ${success ? "Success" : "Failure"}`);

            const wasSent = await postResults(
                submission.competitionid,
                submission.userid,
                submission.problemid,
                success ? 1 : 2
            );

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

run().catch(e => console.error(`[code-runner/consumer] ${e.message}`, e));