const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys'); // या तुम्हारा Baileys import

async function getPairingCode() {
    const { state, saveCreds } = await useMultiFileAuthState('./session'); // session folder

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false // QR मत दिखाओ
    });

    if (!sock.authState.creds.registered) {
        const phoneNumber = '91XXXXXXXXXX'; // अपना नंबर डालो (देश कोड के साथ, + नहीं, - नहीं)
        const code = await sock.requestPairingCode(phoneNumber);
        console.log('तुम्हारा 8-digit Pairing Code है: ' + chalk.green.bold(code));
        console.log('WhatsApp खोलो > Linked Devices > Link with phone number > ये code डालो!');
    }

    sock.ev.on('creds.update', saveCreds);
}

getPairingCode();
