import net from 'net';

const clients = [];

const server = net.createServer((socket) => {
  console.log('A new connection to the server!');

  const id = clients.length + 1;

  clients.map((client) => {
    client.socket.write(`User ${id} joined!`);
  });

  socket.write(`$id$-${id}`);

  socket.on('data', (data) => {
    const [id, message] = data.toString().split('-message-');

    clients.forEach((client) => {
      client.socket.write(`> User ${id}: ${message}`);
    });
  });

  socket.on('end', () => {
    clients.forEach((client) => {
      client.socket.write(`User ${id} left!`);
    });
  });

  clients.push({ id: id.toString(), socket });
});

server.listen(8080, '0.0.0.0', () => {
  console.log('serving on: ', server.address());
});
