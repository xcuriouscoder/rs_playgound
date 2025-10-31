const { postResults } = require("./post_results");

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

async function processCodeSubmission(topic, partition, message) {
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
    const delayTime = getRandomInt(10) * 1000;
    console.log(`*** Simulating code processing for ${delayTime} ms...`);
    await delay(delayTime); // Simulate code processing time

    console.log(`Completed processing submission for User: ${submission.userid}, Competition: ${submission.competitionid}, Problem: ${submission.problemid}`);

    const success = getRandomInt(2) === 1;
    console.log(`Submission Result: ${success ? "Success" : "Failure"}`);

    const wasSent = await postResults(
        submission.competitionid,
        submission.userid,
        submission.problemid,
        success ? 1 : 2
    );
    return wasSent;
}
exports.processCodeSubmission = processCodeSubmission;