const { spawn, exec } = require('child_process');
const path = require('path');
require('dotenv').config();
const wordlistPath = process.env.WORDLIST_PATH;

const hashcatJob = async (pcapPath) => {

    return new Promise((resolve, reject) => {
        const hashcatCmd = `hashcat -m 22000 ${pcapPath} ${wordlistPath}`;
        
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

        hashcatProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`Hashcat process exited with code ${code}`);
                return reject(new Error(`Hashcat process exited with code ${code}\n${hashcatError}`));
            }

            if (hashcatOutput.includes('All hashes found in potfile!')) {
                const hashcatShowCmd = `hashcat --show -m 22000 ${pcapPath} ${wordlistPath}`;
                
                exec(hashcatShowCmd, (error, stdout, stderr) => {
                    if (error) {
                        console.error(`exec error: ${error}`);
                        return reject(new Error(`Error running --show: ${stderr}`));
                    }
                    // let data = stdout.split(':');
                    // let responseMessage = data[3]+':'+data[4];

                    resolve(stdout);
                });
            } else {
                resolve(hashcatOutput);
            }
        });
    });
};

module.exports = hashcatJob;