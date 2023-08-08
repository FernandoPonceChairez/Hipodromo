const socket = io();

function joinChat() {
  const username = document.getElementById('username').value;
  if (username.trim() !== '') {
    socket.emit('join', username);
    document.getElementById('username').disabled = true;
  }
}

socket.on('userJoined', (username) => {
  showMessage(`${username} joined the chat`);
});

socket.on('message', (data) => {
  showMessage(`${data.username}: ${data.text}`);
});

function sendMessage() {
  const message = document.getElementById('message').value;
  if (message.trim() !== '') {
    socket.emit('message', message);
    document.getElementById('message').value = '';
  }
}

function showMessage(message) {
  const messagesElement = document.getElementById('messages');
  messagesElement.value += message + '\n';
  messagesElement.scrollTop = messagesElement.scrollHeight;
}
