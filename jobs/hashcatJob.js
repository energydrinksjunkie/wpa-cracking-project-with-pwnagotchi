const { exec } = require('child_process');
const path = require('path');
const wordlistPath = process.env.WORDLIST_PATH;

const hashcatJob = async (pcapPath) => {

    return new Promise((resolve, reject) => {
        const hashcatCmd = `hashcat -m 22000 ${pcapPath} ${wordlistPath} --potfile-disable -o password.txt`;

        exec(hashcatCmd, (err, stdout, stderr) => {
            // if (err) {
            //     console.error(`Error running hashcat: ${stderr}`);
            //     return reject(new Error('Error running hashcat.'));
            // }

            // let responseMessage;
            // if (stdout.includes('Cracked')) {
            //     const password = stdout.match(/Cracked: (.+)/)[1].trim();
            //     responseMessage = `Password cracked: ${password}`;
            // } else {
            //     responseMessage = 'Password not found.';
            // }

            // resolve(responseMessage);
            resolve(stdout);
        });
    });
};

module.exports = hashcatJob;