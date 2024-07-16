const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const hashcatQueue = require('../queues/hashcatQueue');
const upload = multer({ dest: 'uploads/' });
const verifyApiKey = require('../middleware/apiKey');
const verifyContentTypeMiddleware = require('../middleware/contentType');
const Handshake = require('../models/handshake');
const router = express.Router();

router.post('/', verifyContentTypeMiddleware, verifyApiKey, upload.single('pcap'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    console.log(`Uploaded file: ${req.file.originalname}`);
    const pcapPath = path.resolve(req.file.path);
    const outputPath = path.resolve(__dirname, '../uploads', `${req.file.originalname}.hccapx`);

    console.log(`PCAP Path: ${pcapPath}`);
    console.log(`Output Path: ${outputPath}`);

    
    try {
        const existingHandshake = await Handshake.findOne({ userId: req.user._id, filename: req.file.originalname });
        if (existingHandshake) {
            fs.unlink(pcapPath, (unlinkErr) => {
                if (unlinkErr) {
                    console.error(`Error deleting uploaded file: ${unlinkErr}`);
                }
            });
            return res.status(400).send('Handshake already submitted.');
        }

        const newHandshake = await Handshake.create({userId: req.user._id, filename: req.file.originalname});

        exec(`hcxpcapngtool ${pcapPath} -o ${outputPath}`, (err, stdout, stderr) => {
            if (err) {
                console.error(`Error extracting handshake: ${stderr}`);
                return res.status(500).send('Error extracting handshake.');
            }

            hashcatQueue.add('hashcat-job',{filePath: outputPath, handshakeId: newHandshake._id});

            fs.unlink(pcapPath, (unlinkErr) => {
                if (unlinkErr) {
                    console.error(`Error deleting uploaded file: ${unlinkErr}`);
                }
            });

            res.send('File uploaded and handshake extracted. Hashcat will process in the background.');
        });
    } catch (dbError) {
        console.error(`Error saving handshake to database: ${dbError}`);
        fs.unlink(pcapPath, (unlinkErr) => {
            if (unlinkErr) {
                console.error(`Error deleting uploaded file: ${unlinkErr}`);
            }
        });
        res.status(500).send('Error saving handshake to database.');
    }
});

router.get('/', verifyApiKey, async (req, res) => {
    try {
        const handshakes = await Handshake.find({ userId: req.user._id });
        res.json(handshakes);
    } catch (error) {
        console.error('Error fetching handshakes:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;