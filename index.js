const express = require('express');
const { default: makeWASocket, useMultiFileAuthState, delay, makeCacheableSignalKeyStore } = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require("fs-extra");
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8000;

app.get('/pair', async (req, res) => {
    let phone = req.query.phone;
    if (!phone) return res.status(400).json({ error: "Phone number is required" });

    // Auth folder create karega har baar naya session lene ke liye
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
            browser: ["Chrome (Linux)", "", ""]
        });

        if (!sock.authState.creds.registered) {
            await delay(1500);
            phone = phone.replace(/[^0-9]/g, '');
            const code = await sock.requestPairingCode(phone);
            
            if (!res.headersSent) {
                res.json({ code: code });
            }
        }

        sock.ev.on("creds.update", saveCreds);

        sock.ev.on("connection.update", async (update) => {
            const { connection, lastDisconnect } = update;
            if (connection === "open") {
                await delay(5000);
                // Yahan hum user ko Session ID bhej sakte hain
                const sessionID = Buffer.from(JSON.stringify(state.creds)).toString('base64');
                await sock.sendMessage(sock.user.id, { text: `YOUR_SESSION_ID:${sessionID}` });
                
                // Safai: Session file delete kar do connect hone ke baad
                await delay(2000);
                fs.removeSync(authPath);
            }
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Server Error" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
