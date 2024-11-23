const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");
const fs = require("fs"); //Modulo para manejar archivos

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PASSWORD_FILE = path.join(__dirname, "password.txt");

// Servir archivos estáticos desde el directorio 'public'
app.use(express.static(path.join(__dirname, "public")));

// Leer la contraseña desde el archivo
function readPassword() {
  try {
    return fs.readFileSync(PASSWORD_FILE, "utf8").trim();
  } catch (err) {
    console.error("Error leyendo la contraseña:", err);
    return "1982"; // Contraseña por defecto si hay un error
  }
}

// Guardar la contraseña en el archivo
function writePassword(newPassword) {
  fs.writeFileSync(PASSWORD_FILE, newPassword, "utf8");
}

// Manejar conexiones de clientes
io.on("connection", (socket) => {
  console.log("Nuevo usuario conectado");

  // Manejar mensajes de chat entrantes
  socket.on("chat message", (data) => {
    console.log(data.nombre + ": " + data.mensaje);
    const dataEmit = { nombre: data.nombre, mensaje: data.mensaje };
    // Emitir el mensaje a todos los clientes, incluyendo el emisor
    io.emit("chat message", dataEmit); // Envía el mensaje de vuelta a todos los clientes
  });

  //Manjear el logeo
  socket.on("login", (data) => {
    const { password } = data;
    if (password === readPassword()) {
      socket.emit("login response", { success: true });
    } else {
      socket.emit("login response", {
        success: false,
        message: "Contraseña incorrecta",
      });
    }
  });

  // Manejar la solicitud de cambio de contraseña
  socket.on("change password", (data) => {
    const { oldPassword, newPassword } = data;
    if (oldPassword === readPassword()) {
      writePassword(newPassword);
      socket.emit("password changed", { success: true });
    } else {
      socket.emit("password changed", {
        success: false,
        message: "Contraseña actual incorrecta",
      });
    }
  });
});

// Iniciar el servidor en el puerto 3000
const port = 3000;
server.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
