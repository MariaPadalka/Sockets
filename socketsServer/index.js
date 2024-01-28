const http = require('http');
const socketIO = require('socket.io');

const users = {
  // Статичні дані для автентифікації
  'ms.padalka@gmail.com': { password: 'pa$$word', name: 'Mary Padalka' },
  'example@gmail.com': { password: 'password2',  name: 'John Doe'},
  'mariia.padalka@lnu.edu.ua': {password: 'Mary0604', name: 'Mariia Padalka'},
  // Додайте інші користувачі за необхідності
};

const server = http.createServer();
const io = socketIO(server, { cors: { origin: 'http://localhost:3000' } });

// let sequentialMode = true; // Initial mode is sequential

io.on('connection', (socket) => {
  console.log('Client connected.');

  let currentUser = null;

  socket.on('login', ({ username, password }) => {
    // Перевірка наявності користувача та вірності пароля
    if (users[username] && users[username].password === password) {
      currentUser = users[username];
      socket.emit('login_success', users[username]);
      console.log(`${users[username]} logged in.`);
    } else {
      socket.emit('login_fail', { message: 'Invalid credentials' });
    }
  });

// Asynchronous processing function
const processMessageAsync = async (message, currentUser) => {
  console.log('Processing message asynchronously...');
  // Simulate asynchronous processing
  await io.emit('message', { message });
  console.log(`Message from ${currentUser.name}: ${message} processed.`);
};

// Sequential processing function
const processMessageSequential = (message, currentUser) => {
  console.log('Processing message sequentially...');
  // Simulate sequential processing
  setTimeout(() => {
    io.emit('message', { message });
    console.log(`Message from ${currentUser.name}: ${message} processed.`);
  }, 2000);
};

// Socket event handler
socket.on('message', ({ text, sequentialMode }) => {
  if (currentUser) {
    const message = `[${currentUser.name}]: ${text}`;

    if (sequentialMode) {
      processMessageSequential(message, currentUser);
    } else {
      processMessageAsync(message, currentUser);
    }
  } else {
    socket.emit('login_required', { message: 'Please log in to send messages' });
  }
});

  socket.on('disconnect', () => {
    if (currentUser) {
      console.log(`${currentUser.name} disconnected.`);
      currentUser = null;
    }
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Server listen post: ${PORT}`);
});
