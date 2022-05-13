const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const path = require('path');
const mongoose = require('mongoose');
const db = require('./models/models.js');
const session = require('express-session');

const uri = "mongodb+srv://app:memicko@cluster0.hwnkp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const chunkSize = 25;

const app = express();
const server = http.createServer(app);
const io = new Server(server);

mongoose.connect(uri);
const port = process.env.PORT || 8080;

app.set("view engine", "ejs");

app.use(express.static('styles'));
app.use(express.static('assets'));
app.use(express.static('scripts'));
app.use(express.urlencoded({extended: false}));
app.use(session({
    secret: 'random',
    resave: false,
    saveUninitialized: false,
}))

const regNetComm = require("./net_comm.js");
const onConnection = (socket) => {
    regNetComm(io, socket);
}
io.on("connection", onConnection);

app.get('/', function(req, res) {
    if (!req.session.username){
        res.redirect("/login");
        return;
    }
    console.log(req.sessionID);
    res.render("index");
});

app.get('/xd', async function(req, res) {
    const position = {x: 25, y: 25};
    const planet = new db_planet({
        position: position,
        chunk: {x: Math.floor(position.x/chunkSize),
                y: Math.floor(position.y/chunkSize)}
    });
    await planet.save();
    console.log(planet);
    console.log('Page servedxd');
    res.send("meme");
});

app.get('/login', function(req, res){
    if (req.session.username){
        res.redirect("/");
    } else {
        res.render("login");
    }
})

app.post('/login', async function(req, res){
    if (!req.session.username){
        const user = await db.user.findOne({username: req.body.username});
        if (user == null){
            res.redirect("/login");
            return;
        }
        console.log(req.body);
        console.log(user.username);
        if (user.password == req.body.password){
            req.session.username = user.username;
        }
    }
    res.redirect("/");
})

app.get('/logout', function(req, res){
    if (req.session.username){
        delete req.session.username;
    }
    res.redirect("/login");
})

app.get('/test', function(req, res, next) {
    if (req.session.views) {
      req.session.views++
      res.setHeader('Content-Type', 'text/html')
      res.write('<p>views: ' + req.session.views + '</p>')
      res.write('<p>expires in: ' + (req.session.cookie.maxAge/1) + 's</p>')
      res.end()
    } else {
      req.session.views = 1
      res.end('welcome to the session demo. refresh!')
    }
})

server.listen(port);
console.log('Server started at http://localhost:' + port);