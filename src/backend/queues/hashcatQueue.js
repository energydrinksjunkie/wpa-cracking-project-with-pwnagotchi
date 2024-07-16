const Queue = require('bull');
require('dotenv').config();
const hashcatQueue = new Queue('hashcat', {
    redis: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    }
});

module.exports = hashcatQueue;