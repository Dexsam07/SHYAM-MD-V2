// SHYAM-MD V2 - Secure Loader (De-obfuscated & Fixed Version)
// Dex - 2026

const axios = require('axios');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

const REMOTE_URL = 'https://shyam-script-server.vercel.app/api/index';
const SESSION_ID = process.env.SESSION_ID || '';

async function startBot() {
    console.log(chalk.cyan.bold('--------------------------------------------'));
    console.log(chalk.green.bold('\n✨ SHYAM-MD V2 IS STARTING... ✨\n'));
    console.log(chalk.yellow('--------------------------------------------'));

    console.log(chalk.white('👤 Owner: ') + chalk.green('DEX-SHYAM'));
    console.log(chalk.white('🔗 Server: ') + chalk.blue('Vercel (Remote Mode)'));

    console.log(chalk.yellow('--------------------------------------------'));

    if (!SESSION_ID) {
        console.log(chalk.red.bold('❌ ERROR: SESSION_ID is missing in Environment Variables!'));
        console.log(chalk.red('Add SESSION_ID in Replit Secrets → Tools → Secrets'));
        process.exit(1); // Stop if no session
    }

    try {
        console.log(chalk.blue('🔄 Fetching encrypted logic from DEX SHYAM Server...'));
        const response = await axios.get(REMOTE_URL);

        if (response.data && response.data.trim() !== '') {
            console.log(chalk.green.bold('✅ Script Loaded Successfully!'));
            console.log(chalk.magenta('🤖 Initializing WhatsApp Connection...'));

            // Remote script execute (eval) - सावधानी से यूज करो
            eval(response.data);
        } else {
            throw new Error('Empty script received from server');
        }
    } catch (error) {
        console.log(chalk.red.bold('❌ FAILED TO LOAD REMOTE SCRIPT!'));
        console.log(chalk.red('📝 Error: ' + error.message));
        if (error.response) {
            console.log(chalk.yellow('Server Response Status: ' + error.response.status));
        }
    }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.log(chalk.red('‼️ Unhandled Rejection at:', promise));
    console.log(chalk.red('reason:', reason));
});

startBot();
