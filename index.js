const express = require('express');
const { default: makeWASocket, useMultiFileAuthState, delay, makeCacheableSignalKeyStore } = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require("fs-extra");

const app = express();
const PORT = process.env.PORT || 8000;

// Home page par seedha HTML dikhane ke liye
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>My Bot Session</title>
            <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-slate-900 text-white flex items-center justify-center min-h-screen">
            <div class="p-8 bg-slate-800 rounded-xl shadow-xl w-full max-w-md text-center">
                <h2 class="text-2xl font-bold mb-6">Link Your WhatsApp</h2>
                <input id="phone" type="text" placeholder="919876543210" class="w-full p-3 rounded bg-slate-700 mb-4 border border-slate-600 text-white">
                <button onclick="getPairingCode()" class="w-full bg-blue-600 p-3 rounded font-bold hover:bg-blue-700">Get Pairing Code</button>
                <div id="displayCode" class="mt-6 text-4xl font-mono tracking-widest text-yellow-400 hidden"></div>
            </div>
            <script>
                async function getPairingCode() {
                    const phone = document.getElementById('phone').value;
                    const display = document.getElementById('displayCode');
                    display.innerText = "Connecting...";
                    display.classList.remove('hidden');
                    try {
                        const res = await fetch('/pair?phone=' + phone);
                        const data = await res.json();
                        if(data.code) { display.innerText = data.code; }
                        else { display.innerText = "Error!"; }
                    } catch (e) { display.innerText = "Server Error!"; }
                }
            </script>
        </body>
        </html>
    `);
});

app.get('/pair', async (req, res) => {
    let phone = req.query.phone;
    if (!phone) return res.status(400).json({ error: "Phone number is required" });

    const authPath = './auth_' + Math.random().toString(36).substring(7);
    const { state, saveCreds } = await useMultiFileAuthState(authPath);

    try {
        const sock = makeWASocket({
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" })),
            },
            printQRInTerminal: false,
            logger: pino({ level: "fatal" }),
            browser: ["Ubuntu", "Chrome", "20.0.04"]
        });

        if (!sock.authState.creds.registered) {
            await delay(1500);
            phone = phone.replace(/[^0-9]/g, '');
            const code = await sock.requestPairingCode(phone);
            if (!res.headersSent) { res.json({ code: code }); }
        }

        sock.ev.on("creds.update", saveCreds);
        sock.ev.on("connection.update", async (update) => {
            if (update.connection === "open") {
                await delay(5000);
                const sessionID = Buffer.from(JSON.stringify(state.creds)).toString('base64');
                await sock.sendMessage(sock.user.id, { text: sessionID });
                await delay(2000);
                fs.removeSync(authPath);
            }
        });
    } catch (err) {
        res.status(500).json({ error: "Error" });
    }
});

app.listen(PORT, () => { console.log("Server Live!"); });
