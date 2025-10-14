import crypto from 'crypto';

// Generate VAPID keys
function generateVAPIDKeys() {
    const keyPair = crypto.generateKeyPairSync('ec', {
        namedCurve: 'prime256v1',
        publicKeyEncoding: { type: 'spki', format: 'der' },
        privateKeyEncoding: { type: 'pkcs8', format: 'der' }
    });

    // Extract the raw public key (65 bytes) from the DER format
    const publicKeyDer = keyPair.publicKey;
    const publicKeyRaw = publicKeyDer.slice(-65); // Last 65 bytes contain the raw key
    const publicKey = Buffer.from(publicKeyRaw).toString('base64url');
    const privateKey = Buffer.from(keyPair.privateKey).toString('base64url');

    return { publicKey, privateKey };
}

const keys = generateVAPIDKeys();
console.log('VAPID Keys Generated:');
console.log('Public Key:', keys.publicKey);
console.log('Private Key:', keys.privateKey);
console.log('\nAdd these to your environment variables:');
console.log(`VAPID_PUBLIC_KEY=${keys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}`);