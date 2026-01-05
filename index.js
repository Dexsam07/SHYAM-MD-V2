const express = require('express');
const { default: makeWASocket, useMultiFileAuthState, delay, makeCacheableSignalKeyStore } = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require("fs-extra");
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8000;

// Ye line Render ko batayegi ki home page par kya dikhana hai
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

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
            browser: ["Ubuntu", "Chrome", "20.0.04"]
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
            const { connection } = update;
            if (connection === "open") {
                await delay(5000);
                // Session ID generate karke WhatsApp par bhejna
                const sessionID = Buffer.from(JSON.stringify(state.creds)).toString('base64');
                await sock.sendMessage(sock.user.id, { text: `LEVANTER_SESSION_ID:${sessionID}` });
                
                // Safai: Session file delete kar do
                await delay(2000);
                fs.removeSync(authPath);
            }
        });

    } catch (err) {
        console.log(err);
        if (!res.headersSent) {
            res.status(500).json({ error: "Server Error" });
        }
    }
});

// Listen command hamesha aakhir mein honi chahiye
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
