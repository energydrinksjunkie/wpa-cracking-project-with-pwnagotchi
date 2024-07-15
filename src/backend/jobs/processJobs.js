const hashcatQueue = require('../queues/hashcatQueue');
const hashcatJob = require('./hashcatJob');

hashcatQueue.process('hashcat-job', hashcatJob);
