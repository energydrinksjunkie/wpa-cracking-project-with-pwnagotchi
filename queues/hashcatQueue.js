const Queue = require('bull');
const hashcatQueue = new Queue('hashcat', {
    redis: {
        host: '127.0.0.1',
        port: 6379
    }
});

module.exports = hashcatQueue;