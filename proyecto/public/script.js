const msgerForm = document.querySelector(".msger-inputarea");
const msgerInput = document.querySelector(".msger-input");
const msgerChat = document.querySelector(".msger-chat");
const loginForm = document.getElementById("login-form");
const usernameInput = document.getElementById("username-input");
const passwordInput = document.getElementById("password-input");
const claveActual = document.getElementById("claveActual-input");
const claveNueva = document.getElementById("claveNueva-input");
const chatContainer = document.getElementById("chat-container");
const loginContainer = document.getElementById("login-container");
const changeContainer = document.getElementById("change-container");
const changeForm = document.getElementById("change-form");
const cambiocontraseña = document.getElementById("cambiarContraseñabtn");
const cancelar = document.getElementById("cancelarbtn");

const socket = io();
let PERSON_NAME = ""; // Cambia el nombre del usuario según sea necesario
const PERSON_IMG = "https://image.flaticon.com/icons/svg/145/145867.svg"; // Imagen por defecto

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim(); // Obtener la contraseña

  if (!username || !password) return;

  // Emitir la verificación de la contraseña
  socket.emit("login", { password });

  //Escuchar respuesta del servidor
  socket.on("login response", (response) => {
    if (response.success) {
      PERSON_NAME = username;
      loginContainer.style.display = "none";
      chatContainer.style.display = "flex";
    } else {
      alert(response.message);
    }
  });
});

changeForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const oldPassword = claveActual.value.trim();
  const newPassword = claveNueva.value.trim();

  if (!oldPassword || !newPassword) return;

  // Emitir el cambio de contraseña al servidor
  socket.emit("change password", { oldPassword, newPassword });

  // Escuchar respuesta del servidor
  socket.on("password changed", (response) => {
    if (response.success) {
      alert("Contraseña cambiada exitosamente");
    } else {
      alert(response.message);
    }
  });
});

// Agregar un event listener para manejar el clic en el botón (cambiar contraseña)
cambiocontraseña.addEventListener("click", () => {
  loginContainer.style.display = "none";
  changeContainer.style.display = "flex";
});

// Agregar un event listener para manejar el clic en el botón (Cancelar)
cancelar.addEventListener("click", () => {
  loginContainer.style.display = "flex";
  changeContainer.style.display = "none";
});

// Evento para enviar mensajes desde el formulario
msgerForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const msgText = msgerInput.value.trim();
  if (!msgText) return;

  appendMessage(PERSON_NAME, PERSON_IMG, "right", msgText);
  msgerInput.value = "";
  const dataUser = { nombre: PERSON_NAME, mensaje: msgText };
  // Enviar el mensaje de texto al servidor a través de socket.io
  socket.emit("chat message", dataUser);
});

// Evento para recibir mensajes del servidor y mostrarlos en el chat
socket.on("chat message", (data) => {
  console.log("script: " + data.nombre);
  if (data.nombre !== PERSON_NAME) {
    appendMessage(data.nombre, PERSON_IMG, "left", data.mensaje);
  }
});

function appendMessage(name, img, side, text) {
  const msgHTML = `
    <div class="msg ${side}-msg">
      <div class="msg-img" style="background-image: url(${img})"></div>
      <div class="msg-bubble">
        <div class="msg-info">
          <div class="msg-info-name">${name}</div>
          <div class="msg-info-time">${formatDate(new Date())}</div>
        </div>
        <div class="msg-text">${text}</div>
      </div>
    </div>
  `;

  msgerChat.insertAdjacentHTML("beforeend", msgHTML);
  msgerChat.scrollTop += msgerChat.scrollHeight;
}

function formatDate(date) {
  const h = "0" + date.getHours();
  const m = "0" + date.getMinutes();
  return `${h.slice(-2)}:${m.slice(-2)}`;
}
