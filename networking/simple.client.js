import net from 'net';
import readline from 'readline/promises';

const host = { host: '0.0.0.0', port: 8080 };

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

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

let id;
const socket = net.createConnection(host, async () => {
  console.log('connected to the server');
  const ask = async () => {
    const message = await rl.question('Enter a message > ');
    await moveCursor(0, -1);
    await clearLine(0);
    socket.write(`${id}-message-${message}`);
  };

  ask();
  socket.on('data', async (data) => {
    console.log();
    await moveCursor(0, -1);
    await clearLine(0);
    const message = data.toString();
    if (message.includes('$id$')) {
      id = message.split('-')[1];
      console.log(`Your id is ${id}!\n`);
    } else {
      console.log(message);
    }
    ask();
  });
});

socket.on('end', () => {
  console.log();
  console.log('Connection was ended!');
  rl.close();
});
