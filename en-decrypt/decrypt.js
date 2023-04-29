import { Transform } from 'stream';

export class Decrypt extends Transform {
  _transform(chunk, encoding, cb) {
    for (let i = 0; i < chunk.length; i++) {
      if (chunk[i] !== 255) {
        chunk[i] = chunk[i] - 1;
      }
    }
    this.push(chunk);
    cb();
  }
}
