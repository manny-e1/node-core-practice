import fs from 'fs';
import fsAsync from 'fs/promises';
import { Encrypt } from './encrypt.js';
import { Decrypt } from './decrypt.js';
import { pipeline } from 'stream/promises';

const text = await fsAsync.open('./text.txt', 'r');
const textStream = text.createReadStream();
const encrypted = fs.createWriteStream('./encrypted.txt');
const encrypt = new Encrypt((await text.stat()).size);

// text.pipe(encrypt).pipe(encrypted);
await pipeline(textStream, encrypt, encrypted);

const encryptedText = fs.createReadStream('./encrypted.txt');
const decrypted = fs.createWriteStream('./decrypted.txt');

const decrypt = new Decrypt();

// encryptedText.pipe(decrypt).pipe(decrypted);
await pipeline(encryptedText, decrypt, decrypted);
