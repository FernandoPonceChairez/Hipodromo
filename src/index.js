const express = require('express');
const { engine } = require('express-handlebars');
const bodyParser = require('body-parser');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.set('port', 3000);


app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());


// Serve the homee.hbs file


// Socket.IO integration for chat
io.on('connection', (socket) => {
  console.log('A user connected');

  // Listen for joining the chat
  socket.on('join', (username) => {
    console.log(username + ' joined the chat');
    io.emit('userJoined', username);
  });

  // Listen for chat messages from the client
  socket.on('message', (message) => {
    console.log('Message received:', message);
    // Broadcast the message to all connected clients
    io.emit('message', { username: socket.username, text: message });
  });
});
