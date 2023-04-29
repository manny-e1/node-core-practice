import { Duplex } from 'stream';
import fs from 'fs';

class FileDuplexStream extends Duplex {
  constructor({
    writableHighWaterMark,
    readableHighWaterMark,
    readFilename,
    writeFilename,
  }) {
    super({ readableHighWaterMark, writableHighWaterMark });
    this.readFilename = readFilename;
    this.writeFilename = writeFilename;
    this.readFd = null;
    this.writeFd = null;
    this.chunk = [];
    this.chunkSize = 0;
  }

  _construct(cb) {
    fs.open(this.readFilename, 'r', (err, readFd) => {
      if (err) return cb(err);
      this.readFd = readFd;
      fs.open(this.writeFilename, 'w', (err, writeFd) => {
        if (err) return cb(err);
        this.writeFd = writeFd;
        cb();
      });
    });
  }

  _write(chunk, encoding, cb) {
    this.chunk.push(chunk);
    this.chunkSize += chunk.length;

    if (this.chunkSize > this.writableHighWaterMark) {
      fs.write(this.writeFd, Buffer.concat(this.chunk), (err) => {
        if (err) return cb(err);
        this.chunk = [];
        this.chunkSize = 0;
        cb();
      });
    } else {
      cb();
    }
  }

  _read(size) {
    const buff = Buffer.alloc(size);
    fs.read(this.readFd, buff, 0, size, null, (err, bytesRead) => {
      if (err) return this.destroy(err);
      this.push(bytesRead > 0 ? buff.subarray(0, bytesRead) : null);
    });
  }

  _final(cb) {
    fs.write(this.writeFd, Buffer.concat(this.chunk), (err) => {
      if (err) return cb(err);
      this.chunk = [];
      cb();
    });
  }

  _destroy(error, cb) {
    cb(error);
  }
}

export { FileDuplexStream };
