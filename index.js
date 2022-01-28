const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const path = require('path');

const port = process.env.PORT || 8080;

app.set("view engine", "ejs");

app.use(express.static('styles'));
app.use(express.static('assets'));
app.use(express.static('scripts'));

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.emit("kokot", "bruh");
});

app.get('/', function(req, res) {
    console.log('Page served');
    res.render("index");
});

app.get('/xd', function(req, res) {
    console.log('Page servedxd');
    res.send("mrdka");
});

server.listen(port);
console.log('Server started at http://localhost:' + port);