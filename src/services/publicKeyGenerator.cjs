const bip39 = require('bip39');
const hdkey = require('hdkey');

// Generate a 12-word mnemonic phrase.
const mnemonic = bip39.generateMnemonic();
console.log('Mnemonic Phrase:', mnemonic);

// Derive the master seed from the mnemonic.
const seed = bip39.mnemonicToSeedSync(mnemonic);

// Derive the master extended private key.
const root = hdkey.fromMasterSeed(seed);
const xpriv = root.toString();
console.log('Extended Private Key (xPriv):', xpriv); // Keep this OFFLINE and SECURE!

// Derive the extended public key (xpub).
const xpub = root.publicExtendedKey;
console.log('Extended Public Key (xPub):', xpub); // Use this on your online server.