const { Kafka } = require('kafkajs');

const kafkatopic = "codesubmissions";

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['kafka:9092'],
});

const producer = kafka.producer();

async function init() {
  const admin = kafka.admin();
  console.log("Admin connecting...");
  admin.connect();
  console.log("Admin Connection Success...");

  console.log(`Creating Topic [${kafkatopic}] if not exists...`);
  await admin.createTopics({
    topics: [
      {
        topic: kafkatopic,
        numPartitions: 100,
      },
    ],
  });
  console.log(`Topic Created Success [${kafkatopic}]`);

  console.log("Disconnecting Admin..");
  await admin.disconnect();
}

init();

async function submitCodeToQueue(userId, competitionId, problemId, base64code) {
  const producer = kafka.producer();

    console.log("Connecting Producer");
    await producer.connect();
    console.log("Producer Connected Successfully");

    const submission = {
        userid: userId,
        competitionid: competitionId,
        problemid: problemId,
        code: base64code//Buffer.from(code).toString('base64')
    };

    const submissionValue = JSON.stringify(submission);

    await producer.send({
    topic: kafkatopic,
    messages: [
    {
        key: userId,
        value: submissionValue,
    }]});

    console.log(`Sent code submission for user ${userId}, ${problemId} to Kafka topic ${kafkatopic}`);
    await producer.disconnect();
}
exports.submitCodeToQueue = submitCodeToQueue;

