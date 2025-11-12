const socket = new WebSocket("ws://127.0.0.1:8000/ws/chat/room1/");

socket.onopen = () => {
  console.log(" Conectado al WebSocket");
  socket.send(JSON.stringify({
    type: "send_message",
    message: "Hola desde WebSocket puro",
    user: "Ali"
  }));
};

socket.onmessage = (event) => {
  console.log(" Mensaje recibido:", event.data);
};

socket.onerror = (error) => {
  console.error(" Error:", error);
};
