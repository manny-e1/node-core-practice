import { Transform } from 'stream';

export class Encrypt extends Transform {
  constructor(size) {
    super();
    this.dataSize = size;
    this.dataBytesRead = 0;
    this.lastPercent = 0;
  }
  _transform(chunk, encoding, cb) {
    this.dataBytesRead += chunk.length;
    for (let i = 0; i < chunk.length; i++) {
      if (chunk[i] !== 255) {
        chunk[i] = chunk[i] + 1;
      }
    }
    let percent = Math.floor((this.dataBytesRead / this.dataSize) * 100);
    if (percent > this.lastPercent) {
      console.log(percent);
      this.lastPercent = percent;
    }
    this.push(chunk);
    cb();
  }
}
