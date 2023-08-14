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

