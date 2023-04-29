import fs from 'fs/promises';

const watcher = await fs.open('./watcher.txt', 'r');

async function createFile(path) {
  try {
    const g = await fs.open(path, 'r');
    console.log("There's already a file by this name");
    g.close();
  } catch (e) {
    const h = await fs.open(path, 'w');
    console.log('created successfully');
    h.close();
  }
}

async function deleteFile(path) {
  try {
    const de = await fs.open(path, 'r');
    await fs.unlink(path);
    de.close();
    console.log('deleted successfuly');
  } catch (error) {
    console.log('file not found');
  }
}

async function renameFile(old, newP) {
  try {
    const de = await fs.open(old, 'r');
    await fs.rename(old, newP);
    de.close();
    console.log('renamed successfuly');
  } catch (error) {
    console.log('file not found');
  }
}
async function appendToFile(path, text) {
  try {
    const de = await fs.open(path, 'r+');
    de.appendFile(text);
    de.close();
    console.log('appended successfuly');
  } catch (error) {
    console.log('file not found');
  }
}

watcher.on('change', async () => {
  const fileSize = (await watcher.stat()).size;
  const buffer = Buffer.alloc(fileSize);
  const offset = 0;
  const length = buffer.byteLength;
  const position = 0;

  const file = (
    await watcher.read(buffer, offset, length, position)
  ).buffer.toString();
  if (file.includes('create')) {
    await createFile(file.split(' ')[1]);
  } else if (file.includes('delete')) {
    await deleteFile(file.split(' ')[1]);
  } else if (file.includes('rename')) {
    await renameFile(file.split(' ')[1], file.split(' ')[2]);
  } else if (file.includes('append')) {
    const h = file.split('to');
    await appendToFile(h[1].trim(), h[0].substring('append'.length + 1));
  }
});

const watch = fs.watch('./watcher.txt');
for await (const event of watch) {
  if (event.eventType === 'change') {
    watcher.emit('change');
  }
}

watcher.close();
