const hashcatQueue = require('../queues/hashcatQueue');
const hashcatJob = require('./hashcatJob');

hashcatQueue.process('hashcat-job', async (job) => {
    console.log('Processing job:', job.id);

    try {
        
        const result = await hashcatJob(job);

        console.log(result);
    } catch (error) {
        console.error(`Error processing job: ${error.message}`);
    }
});
