const { spawn, exec } = require('child_process');
const path = require('path');
const Handshake = require('../models/handshake');
require('dotenv').config();
const wordlistPath = process.env.WORDLIST_PATH;

const hashcatJob = async (job) => {
    console.log('Hashcat job started.');
    return new Promise((resolve, reject) => {
        console.log('Job data:', job);
        const { filePath, handshakeId } = job.data;
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
                console.error(`Hashcat process exited with code ${code}`);
                return reject(new Error(`Hashcat process exited with code ${code}\n${hashcatError}`));
            }

            if (hashcatOutput.includes('All hashes found in potfile!')) {
                const hashcatShowCmd = `hashcat --show -m 22000 ${filePath} ${wordlistPath}`;
                
                exec(hashcatShowCmd, async (error, stdout, stderr) => {
                    if (error) {
                        console.error(`exec error: ${error}`);
                        return reject(new Error(`Error running --show: ${stderr}`));
                    }
                    // let data = stdout.split(':');
                    // let responseMessage = data[3]+':'+data[4];
                    const handshake = await Handshake.findById(handshakeId);
                    if (handshake) {
                        await handshake.updateHandshake(stdout);
                        console.log(`Handshake with ID ${handshakeId} updated successfully.`);
                    } else {
                        console.error(`Handshake with ID ${handshakeId} not found.`);
                    }
                    resolve(stdout);
                });
            } else if(hashcatOutput.includes('Cracked')){
                const handshake = await Handshake.findById(handshakeId);
                if (handshake) {
                    await handshake.updateHandshake(stdout);
                    console.log(`Handshake with ID ${handshakeId} updated successfully.`);
                } else {
                    console.error(`Handshake with ID ${handshakeId} not found.`);
                }
                resolve(hashcatOutput);
            } else {
                reject(new Error('Hashcat did not find the password.'));
            }
        });
    });
};

module.exports = hashcatJob;