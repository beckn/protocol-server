const fs = require("fs");
const path = require("path");
const _sodium = require("libsodium-wrappers");
const readline = require("readline");
const networkParticipantData = require("./data/network-participant.json");

// Function to get user input
const getUserInput = (query) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
};

const convertToBase64 = async (privateKey) => {
  await _sodium.ready;
  const sodium = _sodium;

  // Check if the input is already Base64 (valid Base64 strings end with '=' or contain certain characters)
  const base64Pattern = /^[A-Za-z0-9+/=]+$/;
  if (base64Pattern.test(privateKey)) {
    return privateKey; // Assume it's already Base64
  }

  // Convert raw input (Hex, ASCII, etc.) to Base64
  const privateKeyUint8 = sodium.from_string(privateKey); // Convert to Uint8Array
  return sodium.to_base64(privateKeyUint8, sodium.base64_variants.ORIGINAL);
};

const signPayload = async (message, privateKeyBase64) => {
  await _sodium.ready;
  const sodium = _sodium;

  // Convert private key from Base64 to Uint8Array
  const privateKey = sodium.from_base64(
    privateKeyBase64,
    sodium.base64_variants.ORIGINAL,
  );

  // Sign the message
  const signedMessage = sodium.crypto_sign(message, privateKey);

  // Convert signed message to Base64 for easy storage/transmission
  return sodium.to_base64(signedMessage, sodium.base64_variants.ORIGINAL);
};

(async () => {
  try {
    const userPrivateKey = await getUserInput("Enter your private key: ");

    if (!userPrivateKey) {
      console.error("Private key cannot be empty.");
      process.exit(1);
    }

    // Convert raw private key to Base64 if necessary
    const privateKeyBase64 = await convertToBase64(userPrivateKey);

    const signedMessage = await signPayload(
      JSON.stringify(networkParticipantData),
      privateKeyBase64,
    );

    // Define the unique request ID
    const uniqueReqId = signedMessage;

    // Define the HTML content
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <meta name="site-verification" content="${uniqueReqId}" />
</head>
<body>
    Site Verification Page
</body>
</html>`;

    // Define the file path
    const publicDir = path.join(__dirname, "../public");
    const filePath = path.join(publicDir, "verification.html");

    // Ensure the public directory exists
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir);
    }

    // Write the HTML file
    fs.writeFileSync(filePath, htmlContent, "utf8");

    console.log(`File created at: ${filePath}`);
  } catch (error) {
    console.error("Error:", error);
  }
})();
