import { Readable } from 'stream';
import fs from 'fs';

class FileReadStream extends Readable {
  constructor({ filename, highWaterMark }) {
    super({ highWaterMark });
    this.filename = filename;
    this.fd = null;
  }

  _construct(cb) {
    fs.open(this.filename, 'r', (err, fd) => {
      if (err) {
        cb(err);
      } else {
        this.fd = fd;
        cb();
      }
    });
  }

  _read(size) {
    const buff = Buffer.alloc(size);
    fs.read(this.fd, buff, 0, size, null, (err, bytesRead) => {
      if (err) return this.destroy(err);
      this.push(bytesRead > 0 ? buff.subarray(0, bytesRead) : null);
    });
  }

  _destroy(error, cb) {
    if (this.fd) {
      fs.close(this.fd, (err) => {
        cb(err || error);
      });
    } else {
      cb(error);
    }
  }
}

export { FileReadStream };
