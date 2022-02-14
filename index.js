const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const path = require('path');
const { MongoClient } = require("mongodb");
const uri = "mongodb+srv://app:memicko@cluster0.hwnkp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri);

client.connect().then(xd => {
    console.log(xd);
    server.listen(port);
    console.log('Server started at http://localhost:' + port);
})

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
    console.log('Page serveddd');
    res.render("index");
});

app.get('/xd', async function(req, res) {
    const query = { title: "The Room" };
    const options = {
        sort: { "imdb.rating": -1 },
        projection: { _id: 0, title: 1, imdb: 1 },
    };
    const meme = await client.db("sample_mflix").collection("movies").findOne(query, options);
    console.log('Page servedxd');
    res.send(meme);
});