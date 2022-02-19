const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const path = require('path');
const mongoose = require('mongoose');
const db_planet = require('./models/db_planet.js');
const uri = "mongodb+srv://app:memicko@cluster0.hwnkp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

mongoose.connect(uri);
const port = process.env.PORT || 8080;

app.set("view engine", "ejs");

app.use(express.static('styles'));
app.use(express.static('assets'));
app.use(express.static('scripts'));

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.emit("kokot", "bruh");
    socket.on("get_planets", async () => {
        const data = await db_planet.find({});
        socket.emit("receive_planets", data);
    });
});

app.get('/', function(req, res) {
    console.log('Page serveddd');
    res.render("index");
});

app.get('/xd', async function(req, res) {
    const planet = new db_planet({
        position: [1, 1],
    });
    await planet.save();
    console.log(planet);
    console.log('Page servedxd');
    res.send("meme");
});

server.listen(port);
console.log('Server started at http://localhost:' + port);