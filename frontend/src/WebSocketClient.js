// src/WebSocketClient.js
const socket = new WebSocket('ws://localhost:5000/ws');

socket.onopen = () => {
  console.log('WebSocket connection established');
};

socket.onmessage = (event) => {
  console.log('Message from server:', event.data);
};

socket.onerror = (error) => {
  console.error('WebSocket error:', error);
};

socket.onclose = () => {
  console.log('WebSocket connection closed');
};

export default socket;
