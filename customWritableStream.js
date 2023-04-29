import { Writable } from 'stream';
import fs from 'fs';

class FileWriteStream extends Writable {
  constructor({ highWaterMark, filename }) {
    super({ highWaterMark });
    this.filename = filename;
    this.fd = null;
    this.chunk = [];
    this.chunkSize = 0;
    this.writeCount = 0;
  }

  _construct(cb) {
    fs.open(this.filename, 'w', (err, fd) => {
      if (err) {
        cb(err);
      } else {
        this.fd = fd;
        cb();
      }
    });
  }

  _write(chunk, encoding, cb) {
    this.chunk.push(chunk);
    this.chunkSize += chunk.length;

    if (this.chunkSize > this.writableHighWaterMark) {
      fs.write(this.fd, Buffer.concat(this.chunk), (err) => {
        if (err) return cb(err);
        this.chunk = [];
        this.chunkSize = 0;
        ++this.writeCount;
        cb();
      });
    } else {
      cb();
    }
  }

  _final(cb) {
    fs.write(this.fd, Buffer.concat(this.chunk), (err) => {
      if (err) return cb(err);
      ++this.writesCount;
      this.chunk = [];
      cb();
    });
  }

  _destroy(error, cb) {
    console.log('Num of writes:', this.writeCount);
    if (this.fd) {
      fs.close(this.fd, (err) => {
        cb(err || error);
      });
    } else {
      cb(error);
    }
  }
}

export { FileWriteStream };
