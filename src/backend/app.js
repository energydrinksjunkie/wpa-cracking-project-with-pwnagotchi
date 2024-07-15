const express = require('express');
const mongoose = require('mongoose');
const upload = require('./routes/upload');
const auth = require('./routes/auth');
const hashcatQueue = require('./queues/hashcatQueue');
const hashcatJob = require('./jobs/hashcatJob');
const axios = require('axios');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/upload', upload);
app.use('/auth', auth);

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Failed to connect to MongoDB:', err));

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

hashcatQueue.process(async (job) => {
    const { outputPath } = job.data;

    try {
        const result = await hashcatJob(outputPath);

        // // Pošalji obaveštenje na webhook URL
        // if (process.env.WEBHOOK_URL) {
        //     await axios.post(process.env.WEBHOOK_URL, {
        //         result: result,
        //     });
        // }

        console.log(result);
    } catch (error) {
        console.error(`Error processing job: ${error.message}`);
    }
});