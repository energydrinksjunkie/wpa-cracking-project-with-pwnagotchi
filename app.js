const express = require('express');
const upload = require('./routes/upload');
const hashcatQueue = require('./queues/hashcatQueue');
const hashcatJob = require('./jobs/hashcatJob');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// app.use(express.json());
app.use('/upload', upload);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

hashcatQueue.process(async (job) => {
    const { outputPath } = job.data;

    try {
        const result = await hashcatJob(outputPath);
        console.log(result);
    } catch (error) {
        console.error(`Error processing job ${error.message}}`);
    }
});