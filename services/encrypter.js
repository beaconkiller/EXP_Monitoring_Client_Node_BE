const crypto = require('crypto');
const JSEncrypt = require('node-jsencrypt');
const path = require('path');
const fs = require('fs');

class NE2EE {
    /**
     * @param {Object} options
     * @param {string} options.selfPrivateKey The RSA private key in PEM format.
     */
    constructor({ selfPrivateKey }) {
        this.privateKey = selfPrivateKey;
        // console.log("NE2EE instance created with private key:", this.privateKey ? "set" : "not set");
        if (this.privateKey) {
            // console.log("Private key start:", this.privateKey.substring(0, 50) + '...');
        }
    }

    /**
     * Decrypts an encrypted message using AES and RSA.
     * @param {string} encryptedAesStr
     * @param {string} encryptedIvStr
     * @param {string} encryptedDataBase64
     * @returns {Object}
     */
    decrypt(encryptedAesStr, encryptedIvStr, encryptedDataBase64) {
        try {
            if (!this.privateKey) {
                throw new Error("Private key not set. Cannot decrypt.");
            }

            const crypt = new JSEncrypt();
            crypt.setPrivateKey(this.privateKey);

            // 1. RSA Decrypt the AES key and IV
            const decryptedIVBase64 = crypt.decrypt(encryptedIvStr);
            const decryptedAESBase64 = crypt.decrypt(encryptedAesStr);

            // console.log("Decrypted AES key (Base64) string:", decryptedAESBase64);
            // console.log("Decrypted IV (Base64) string:", decryptedIVBase64);

            if (!decryptedIVBase64 || !decryptedAESBase64) {
                // Perbaiki pesan error agar lebih informatif
                throw new Error("RSA decryption failed. Ensure front-end library is compatible.");
            }

            // 2. Convert Base64 strings back to Buffers
            const iv = Buffer.from(decryptedIVBase64, 'base64');
            const key = Buffer.from(decryptedAESBase64, 'base64');
            const encryptedData = Buffer.from(encryptedDataBase64, 'base64');

            if (key.length !== 16) {
                throw new RangeError(`Invalid key length: ${key.length} bytes. Expected 16 bytes for aes-128-cbc.`);
            }

            // 3. AES Decrypt the data
            const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
            let decrypted = decipher.update(encryptedData);
            decrypted = Buffer.concat([decrypted, decipher.final()]);

            const finalDecrypted = decrypted.toString();
            return {
                aes: key.toString('base64'),
                iv: iv.toString('base64'),
                data: finalDecrypted,
            };
        } catch (e) {
            console.error("Decryption Error:", e);
            throw e;
        }
    }

    /**
     * Decrypts an encrypted message using AES hanya saja ketika user telah login.
     * @param {string} encryptedDataBase64
     * @param {string} aesKey
     * @param {string} iv
     * @returns {Object}
     */
    decryptWithSession(encryptedDataBase64, aesKey, iv) {
    const key = Buffer.from(aesKey, 'base64');
    const ivBuf = Buffer.from(iv, 'base64');
    const encryptedData = Buffer.from(encryptedDataBase64, 'base64');

    const decipher = crypto.createDecipheriv('aes-128-cbc', key, ivBuf);
    let decrypted = decipher.update(encryptedData);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}


    /**
     * Encrypts a message using AES and RSA.
     * @param {string} data
     * @param {Object} options
     * @param {string} options.aesKey The AES key in Base64 format.
     * @param {string} options.publicKey The RSA public key in PEM format.
     * @returns {string} The combined encrypted string.
     */
    encryptV2(data, { aesKey, publicKey, iv, algorithm = 'aes-128-cbc' }) {
        if (!aesKey) throw new Error('aesKey must be defined');
        if (!iv) throw new Error('iv must be defined');
        if (!publicKey) throw new Error('publicKey must be defined');

        let cipher = crypto.createCipheriv(
            algorithm,
            Buffer.from(aesKey, 'base64'),
            Buffer.from(iv, 'base64')   // FIXED
        );

        let encryptedData = cipher.update(JSON.stringify(data));
        encryptedData = Buffer.concat([encryptedData, cipher.final()]);

        const crypt = new JSEncrypt();
        crypt.setPublicKey(publicKey);

        const encryptedIv = crypt.encrypt(iv);     // tetap kirim base64 string
        const encryptedAes = crypt.encrypt(aesKey);

        if (!encryptedIv || !encryptedAes) {
            throw new Error('RSA encryption of IV or AES key failed');
        }

        return `${encryptedAes}::${encryptedIv}::${encryptedData.toString('base64')}`;
    }

}

/**
 * Generates a new RSA key pair.
 * @returns {Object}
 */
function generateKeyPair() {
    const keyPair = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem',
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem'
        }
    });

    // console.log(`Ini hasil private Key nya : ${keyPair.privateKey}`)
    // console.log(`Ini hasil public Key nya : ${keyPair.publicKey}`)

    return {
        privateKey: keyPair.privateKey,
        publicKey: keyPair.publicKey
    };
}

function generateOrLoadKeyPair() {
  const privateKeyPath = path.join(__dirname, '../keys/private.pem');
  const publicKeyPath = path.join(__dirname, '../keys/public.pem');

  // kalau sudah ada file key → langsung baca
  if (fs.existsSync(privateKeyPath) && fs.existsSync(publicKeyPath)) {
    // console.log('🔑 Loading RSA keypair dari file...');
    const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
    const publicKey = fs.readFileSync(publicKeyPath, 'utf8');
    return { privateKey, publicKey };
  }

  // kalau belum ada → generate baru
  console.log('⚡ Generating RSA keypair baru...');
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  });

  // pastikan folder `keys/` ada
  if (!fs.existsSync(path.dirname(privateKeyPath))) {
    fs.mkdirSync(path.dirname(privateKeyPath), { recursive: true });
  }

  // simpan ke file
  fs.writeFileSync(privateKeyPath, privateKey);
  fs.writeFileSync(publicKeyPath, publicKey);

//   console.log('✅ RSA keypair baru disimpan ke folder keys/');
  return { privateKey, publicKey };
}


module.exports = { NE2EE, generateKeyPair, generateOrLoadKeyPair };