const express = require('express');
const multer = require('multer');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const hashcatQueue = require('../queues/hashcatQueue');
const upload = multer({ dest: 'uploads/' });
const verifyApiKey = require('../middleware/apiKey');
const verifyContentTypeMiddleware = require('../middleware/contentType');
const verifyJWT = require('../middleware/verifyJWT');
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

    const filename = req.file.originalname;
    const ssid = filename.split('_')[0];

    
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

        const newHandshake = await Handshake.create({userId: req.user._id,
                                                    filename: filename,
                                                    ssid: ssid});

        await new Promise((resolve, reject) => {
            const hcxProcess = spawn('hcxpcapngtool', [pcapPath, '-o', outputPath]);

            hcxProcess.stdout.on('data', (data) => {
                console.log(`stdout: ${data}`);
            });

            hcxProcess.stderr.on('data', (data) => {
                console.error(`stderr: ${data}`);
            });

            hcxProcess.on('close', (code) => {
                if (code !== 0) {
                    return reject(new Error(`hcxpcapngtool process exited with code ${code}`));
                }
                resolve();
            });
        });

        hashcatQueue.add('hashcat-job',{filePath: outputPath, handshakeId: newHandshake._id});

        fs.unlink(pcapPath, (unlinkErr) => {
            if (unlinkErr) {
                console.error(`Error deleting uploaded file: ${unlinkErr}`);
            }
        });

        res.send('File uploaded and handshake extracted. Hashcat will process in the background.');
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
        const handshakes = await Handshake.find({ userId: req.user._id, status: 'Cracked' });
        const passwords = handshakes.map(handshake => {
            const ssid = handshake.ssid;
            const password = handshake.password;
            return `${ssid}:${password}`;
        });

        res.setHeader('Content-Type', 'text/plain');
        res.send(passwords.join('\n'));
    } catch (error) {
        console.error('Error fetching handshakes:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/browser', verifyJWT, async (req, res) => {
    try {
        const handshakes = await Handshake.find({ userId: req.user._id });
        res.json(handshakes);
    } catch (error) {
        console.error('Error fetching handshakes:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;