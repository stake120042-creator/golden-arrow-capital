const hdkey = require('hdkey');
const ethUtil = require('ethereumjs-util');

// Replace this placeholder with the actual xPub from your offline step.
const xpub = 'xpub661MyMwAqRbcGAxsDUiJcPTPN1qehsQDR2crcL2BJfWTnB45Fd9hCmKXAp5wGXrbrXxiFQiEwRriTYULGHim43dNDC3D48bQuZHu7LTUat8';

// Load the extended public key.
const root = hdkey.fromExtendedKey(xpub);

// Function to generate a deposit address for a given user ID.
function generateDepositAddress(userId) {
  // Use the user ID as the index to ensure a unique address.
  const path = `m/0/${userId}`;

  // Derive the new public key.
  const child = root.derive(path);
  const publicKey = child.publicKey;

  // Convert the public key to a BEP-20 address.
  const address = '0x' + ethUtil.pubToAddress(publicKey, true).toString('hex');
  return address;
}

// Example usage: generate addresses for a few users.
const userId1 = 101;
const address1 = generateDepositAddress(userId1);
console.log(`Deposit address for user ${userId1}: ${address1}`);

const userId2 = 102;
const address2 = generateDepositAddress(userId2);
console.log(`Deposit address for user ${userId2}: ${address2}`);

const userId3 = 103;
const address3 = generateDepositAddress(userId3);
console.log(`Deposit address for user ${userId3}: ${address3}`);