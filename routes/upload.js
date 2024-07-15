const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');
const path = require('path');
const hashcatQueue = require('../queues/hashcatQueue');
const upload = multer({ dest: 'uploads/' });
const router = express.Router();

router.post('/', upload.single('pcap'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }


    const pcapPath = path.resolve(req.file.path);
    const outputPath = path.resolve(__dirname, '../uploads', `${req.file.filename}.hccapx`);

    console.log(`PCAP Path: ${pcapPath}`);
    console.log(`Output Path: ${outputPath}`);

    exec(`hcxpcapngtool ${pcapPath} -o ${outputPath}`, (err, stdout, stderr) => {
        if (err) {
            console.error(`Error extracting handshake: ${stderr}`);
            return res.status(500).send('Error extracting handshake.');
        }

        // Dodavanje zadatka u red
        hashcatQueue.add({ outputPath });
        res.send('File uploaded and handshake extracted. Hashcat will process in the background.');
    });
});

module.exports = router;