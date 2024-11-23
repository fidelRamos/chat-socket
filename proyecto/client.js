const io = require('socket.io-client');
const readline = require('readline');

// Conectar al servidor
const socket = io('http://localhost:3000'); // Reemplaza con tu servidor y puerto

// Manejar la entrada de consola para leer mensajes del usuario
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Ingresa tu nombre: ', (username) => {
  // Enviar mensaje de conexión al servidor
  socket.emit('new user', username);

  // Escuchar mensajes del servidor
  socket.on('chat message', (msg) => {
    console.log(`${msg.username}: ${msg.message}`);
  });

  // Función para enviar mensajes al servidor
  function sendMessage() {
    rl.question('', (message) => {
      socket.emit('chat message', message);
      sendMessage(); // Volver a esperar el siguiente mensaje
    });
  }

  // Iniciar la conversación
  sendMessage();

  // Manejar desconexión cuando el usuario lo desee
  rl.on('SIGINT', () => {
    console.log('Desconectando...');
    socket.disconnect();
    rl.close();
  });
});
