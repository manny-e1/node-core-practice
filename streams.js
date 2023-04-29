import fs from 'fs/promises';
import { FileWriteStream } from './customWritableStream.js';
import { FileReadStream } from './customReadableStream.js';
import { FileDuplexStream } from './customDuplex.js';
import { WriteStream } from 'fs';

// const file = await fs.open('million.txt', 'w');
// const stream = file.createWriteStream();

// console.time('h');
// for (let index = 0; index <= 1000000; index++) {
//   stream.write(`--${index}--`);
// }

// memory efficient version of the above code
// let count = 0;
// function writeMany() {
//   while (count < 1000001) {
//     const buff = Buffer.from(`${count}`, 'utf-8');
//     if (count === 1000000) {
//       return stream.end(buff);
//     }
//     if (!stream.write(buff)) break;
//     count++;
//   }
// }

// writeMany();

// stream.on('drain', () => {
//   writeMany();
// });

// stream.on('finish', () => {
//   console.timeEnd('h');
//   file.close();
// });

// const newfile = await fs.open('new.txt', 'w');
// const newStream = newfile.createWriteStream('new.txt');

// console.log(newStream.writableHighWaterMark);
// await new Promise((resolve) => setTimeout(resolve, 3000));
// newStream.write(Buffer.alloc(100000000, 'a'));
// console.log(newStream.writableLength);
// newfile.close();

////Readable Stream
// const read = await fs.open('million.txt', 'r');
// const readStream = await read.createReadStream();
// const write = await fs.open('new-million.txt', 'w');
// const writeStream = await write.createWriteStream();

////custom writable
const readStream = new FileReadStream({
  highWaterMark: 16 * 1024,
  filename: 'million.txt',
});

////custom writable
const writeStream = new FileWriteStream({
  highWaterMark: 65536,
  filename: 'new-million.txt',
});
//Memory hungry version
//this will hog memory since we're not draining the write stream
// readStream.on('data',(chunk)=>{
//   writeStream.write(chunk)
// })

// more efficient way
readStream.on('data', (chunk) => {
  if (!writeStream.write(chunk)) {
    readStream.pause();
  }
});
readStream.on('end', (chunk) => {
  writeStream.end();
});

writeStream.on('drain', () => {
  readStream.resume();
});

// writeStream.on('finish', () => {
//   write.close();
// });

///Using custom duplex stream
// const duplex = new FileDuplexStream({
//   readFilename: 'n.txt',
//   writeFilename: 'nn.txt',
// });

// duplex.on('data', (chunk) => {
//   console.log(chunk.toString());
//   if (!duplex.write(chunk)) {
//     duplex.pause();
//   }
// });
// duplex.on('end', () => {
//   duplex.end();
// });
// duplex.on('drain', () => {
//   duplex.resume();
// });
