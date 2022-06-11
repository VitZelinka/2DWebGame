const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const path = require('path');
const mongoose = require('mongoose');
const db = require('./models/models.js');
const session = require('express-session');
const func = require('./funcs.js');

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
const sessionMiddleware = session({
    secret: 'random',
    resave: false,
    saveUninitialized: false,
});
app.use(sessionMiddleware);


const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);
io.use(wrap(sessionMiddleware));

// only allow authenticated users
io.use((socket, next) => {
  const session = socket.request.session;
  if (session && session.username) {
    next();
  } else {
    next(new Error("unauthorized"));
  }
});


const regNetComm = require("./net_comm.js");
const req = require('express/lib/request');
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
            req.session.userid = user._id.toString();
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










/*
const crypto = require('crypto');
function getRandom(secret, nonce) {
    const fullSeed = crypto
        .createHash("sha256")
        .update(`${secret}:${nonce}`)
        .digest("hex");

    const seed = fullSeed.substr(0, 8);

    return parseInt(seed, 16) % 15;
}


const fs = require('fs/promises');
app.get('/rul', function(req, res) {
    const from = Number(req.query.from);
    const to = Number(req.query.to);
    const secret = req.query.secret;
    console.log(from, to, secret);
    let output = [];
    for (let index = from; index < to+1; index++) {
        let strNum = index.toString();
        let luckyNum = getRandom(secret, strNum);
        output.push(luckyNum);
    }

    let finalStr = ""; 
    output.forEach(element => {
        finalStr += element.toString() + "\n";
    });
    finalStr += "X\n";
    fs.appendFile('output.log', finalStr, err => {
        if (err) {
          console.error(err);
        }
    }); 
    res.end("wrote "+output);
})
*/