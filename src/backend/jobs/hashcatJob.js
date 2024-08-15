const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const Handshake = require('../models/handshake');
require('dotenv').config();
const wordlistPath = process.env.WORDLIST_PATH;

const hashcatJob = async (job) => {
    console.log('Hashcat job started.');
    return new Promise(async (resolve, reject) => {
        console.log('Job data:', job);
        const { filePath, handshakeId } = job.data;
        const handshake = await Handshake.findById(handshakeId);

        if (!handshake) {
            return reject(new Error(`Handshake with ID ${handshakeId} not found.`));
        }

        handshake.status = 'In progress';
        await handshake.save();

        const hashcatCmd = `hashcat -m 22000 ${filePath} ${wordlistPath}`;
        console.log(`Executing command: ${hashcatCmd}`);

        const hashcatProcess = spawn('sh', ['-c', hashcatCmd]);

        let hashcatOutput = '';
        let hashcatError = '';

        hashcatProcess.stdout.on('data', (data) => {
            hashcatOutput += data.toString();
            console.log(data.toString());
        });

        hashcatProcess.stderr.on('data', (data) => {
            hashcatError += data.toString();
            console.error(data.toString());
        });

        hashcatProcess.on('close', async (code) => {

            if (code !== 0) {
                if (code === 1) {
                    handshake.status = 'Exhausted';
                    await handshake.save();
                    return reject(new Error('Hashcat exhausted the wordlist.'));
                } else {
                    console.error(`Hashcat process exited with code ${code}`);
                    handshake.status = 'Handshake not found';
                    await handshake.save();
                    return reject(new Error(`Hashcat process exited with code ${code}\n${hashcatError}`));
                }
            }

            const hashcatShowCmd = `hashcat --show -m 22000 ${filePath} ${wordlistPath}`;
            
            exec(hashcatShowCmd, async (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    return reject(new Error(`Error running --show: ${stderr}`));
                }

                const lines = stdout.trim().split('\n');
                if (lines.length > 0) {
                    const firstLine = lines[0];
                    const data = firstLine.split(':');
                    if (data.length >= 5) {
                        const responseMessage = data[4];
                        handshake.password = responseMessage;
                        handshake.status = 'Cracked';
                        await handshake.save();
                        resolve(responseMessage);
                    } else {
                        handshake.status = 'Exhausted';
                        await handshake.save();
                        reject(new Error('No valid passwords found in hashcat --show output.'));
                    }
                } else {
                    handshake.status = 'Handshake not found';
                    await handshake.save();
                    reject(new Error('No passwords found in hashcat --show output.'));
                }

                fs.unlink(filePath, (unlinkErr) => {
                    if (unlinkErr) {
                        console.error(`Error deleting file after processing: ${unlinkErr}`);
                    }
                });
            });
        });
    });
};

module.exports = hashcatJob;
