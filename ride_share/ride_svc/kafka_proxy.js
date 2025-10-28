const { Kafka } = require('kafkajs');

const ridetopic = "riderequested";

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

  console.log(`Creating Topic [${ridetopic}] if not exists...`);
  await admin.createTopics({
    topics: [
      {
        topic: ridetopic,
        numPartitions: 1,
      },
    ],
  });
  console.log(`Topic Created Success [${ridetopic}]`);

  console.log("Disconnecting Admin..");
  await admin.disconnect();
}

init();

// const run = async () => {
//   await producer.connect();
//   await producer.send({
//     topic: 'test-topic',
//     messages: [
//       { key: 'key1', value: 'Hello Kafka' },
//     ],
//   });
//   await producer.disconnect();
// };

async function sendRideActivationToQueue(rideid) {
  const producer = kafka.producer();

    console.log("Connecting Producer");
    await producer.connect();
    console.log("Producer Connected Successfully");

    await producer.send({
    topic: ridetopic,
    messages: [
    {
        partition: 0,
        key: "ride-activation",
        value: rideid,
    }]});

    console.log(`Sent ride activation for ride id ${rideid} to Kafka topic ${ridetopic}`);
    await producer.disconnect();
}
exports.sendRideActivationToQueue = sendRideActivationToQueue;

// async function sendRideActivationToQueue(rideid) {
//   await producer.connect();
//   await producer.send({
//     topic: 'riderequested',
//     messages: [
//       { key: 'key1', value: rideid },
//     ],
//   });
//   await producer.disconnect();
//   console.log(`Sent ride activation for ride id ${rideid} to Kafka topic riderequested`);
// }
