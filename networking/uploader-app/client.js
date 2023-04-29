import fs from 'fs/promises';
import net from 'net';
import path from 'path';

const host = { host: '0.0.0.0', port: 8080 };

const clearLine = (dir) => {
  return new Promise((resolve) =>
    process.stdout.clearLine(dir, () => {
      resolve();
    })
  );
};

const moveCursor = (dx, dy) => {
  return new Promise((resolve) =>
    process.stdout.moveCursor(dx, dy, () => {
      resolve();
    })
  );
};

const socket = net.createConnection(host, async () => {
  const filePath = process.argv[2];
  if (!filePath) {
    console.log('Please specify the path of the file you want to upload.');
    socket.end();
  }
  const fileName = path.basename(filePath);
  socket.write(`${fileName}$`);
  const file = await fs.open(filePath, 'r');
  const fileReadStream = file.createReadStream();
  const fileSize = (await file.stat()).size;
  let writePercentage = 0;
  let bytesRead = 0;
  fileReadStream.on('data', (chunk) => {
    if (!socket.write(chunk)) fileReadStream.pause();
    bytesRead += chunk.length;
    const calcPercentage = Math.floor((bytesRead / fileSize) * 100);
    if (writePercentage !== calcPercentage) {
      if (writePercentage == 0) {
        clearLine(0);
      } else {
        moveCursor(0, -1);
        clearLine(0);
      }
      writePercentage = calcPercentage;
      console.log(`uploading... ${calcPercentage}%`);
    }
  });
  socket.on('drain', () => {
    fileReadStream.resume();
  });

  fileReadStream.on('end', () => {
    file.close();
    console.log('Successfully uploaded');
    socket.end();
  });
});
