import fs from 'fs/promises';
import net from 'net';

const socket = net.createServer((socket) => {
  let file;
  let fileWriteStream;

  console.log('New Connection');

  socket.on('data', async (chunk) => {
    if (!file) {
      socket.pause();
      const idx = chunk.indexOf('$');
      const fileName = chunk.subarray(0, idx);
      file = await fs.open(`./storage/${fileName}`, 'w');
      fileWriteStream = file.createWriteStream();
      socket.write(chunk.subarray(idx + 1));
      socket.resume();
      fileWriteStream.on('drain', () => {
        socket.resume();
      });
    } else {
      if (!fileWriteStream.write(chunk)) {
        socket.pause();
      }
    }
  });

  socket.on('end', () => {
    if (file) file.close();
    file = undefined;
    fileWriteStream = undefined;
  });
});

socket.listen(8080, '0.0.0.0', () => {
  console.log('started listening on: ', socket.address());
});
