// Modules
var express = require('express');
var tool = require('./tool.js');
var search = require('./search.js');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var _ = require('underscore');
var cookieParser = require('cookie-parser');
var events = require('events');
var emitter = new events.EventEmitter();
var port = 3000;
var app = express();

function filterInt(value) {
  if (/^(\-|\+)?([0-9]+|Infinity)$/.test(value)){
    return Number(value);
  }
  return NaN;
}

// Stores Database
var stores =[
  {
    id: 1,
    name: 'Starbucks',
    thumb: '1.jpg',
    description: tool.randomText(150),
    phone: '(123) 123-1233',
    address: '105 Research Drive, Irvine, CA93023',
    tags: ['coffee', 'restaurant'],
    reviews: [
      {
        userId: 1,
        description: tool.randomText(200),
        date: new Date()
      }, {
        userId: 2,
        description: tool.randomText(200),
        date: new Date()
      }
    ]
  }, {
    id: 2,
    name: 'Tomo Cafe',
    thumb: '2.jpg',
    phone: '(123) 123-1233',
    description: tool.randomText(150),
    address: '321 Culver Ave., Irvine, CA93023',
    tags: ['coffee', 'restaurant'],
    reviews: [
      {
        userId: 1,
        description: tool.randomText(200),
        date: new Date(),
      }, {
        userId: 2,
        description: tool.randomText(200),
        date: new Date(),
      }
    ]
  }
]

// Users Database
var users = [
  {
    id: 1,
    username: "test",
    password: "123",
    firstname: "Tesla",
    lastname: 'Ola',
    email: '123123@gmail.com',
    phone: '123-123-1233',
    address: '100 JD St., Irvine, CA92603',
    business: false
  }, {
    id: 2,
    username: "business",
    password: "123",
    firstname: "Steve",
    lastname: 'Ma',
    email: '123123@gmail.com',
    phone: '123-123-1233',
    address: '100 JD St., Irvine, CA92603',
    business: true
  }
];

function User(id, username, password, firstname, lastname, email, phone, address, business){
  this.id = id;
  this.username = username;
  this.password = password;
  this.firstname = firstname;
  this.lastname = lastname;
  this.email = email;
  this.phone = phone;
  this.business = business;
}

// Sessions
var sessions =[];
function Session(token, username){
  this.token = token;
  this.username = username;
}

// Search EventEmitter
var foundStores = [];
emitter.on('search', function(name, location){
  foundStores = [];
  search.target(name, location, stores, foundStores);
})

// Routes
app.use(express.static('./public/assets'));
app.use(express.static('./public/images'));
app.use(cookieParser());

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
})

app.post('/login', jsonParser, function(req, res){
  var username = req.body.username;
  var password = req.body.password;
  var remember = req.body.remember;
  var business = req.body.business;
  var match = _.where(users, {username: username});
  if (match.length>0){
    if (match[0].password === password){
      if (remember) {
        var token = tool.sessionToken(50);
        res.cookie('sessionTokenForRavelp', token);
        sessions.push(new Session(token, match[0].username));
      }
      res.json(match[0]);
    } else {
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(404);
  }
})

app.post('/newuser', jsonParser, function(req, res){
  var username = req.body.username;
  var password = req.body.password;
  var firstname = req.body.firstname;
  var lastname = req.body.lastname;
  var email = req.body.email;
  var phone = req.body.phone;
  var address = req.body.address;
  var business = req.body.business;
  var match = _.where(users, {username: username});
  if (match.length>0){
    res.sendStatus(403);
  } else {
    var last = _.last(users);
    var id = last.id + 1;
    var newUser = new User(id, username, password, firstname, lastname, email, phone, address, business);
    users.push(newUser);
    var currentUser = _.where(users, {username: username});
    var token = tool.sessionToken(50);
    res.cookie('sessionTokenForRavelp', token);
    sessions.push(new Session(token, currentUser[0].username));
    res.json(currentUser[0]);
  }
})

app.get('/login', function(req, res){
  var currentToken = req.cookies.sessionTokenForRavelp;
  var matchSession = _.where(sessions, {token: currentToken});
  if (matchSession.length>0){
    var currentUser = _.where(users, {username: matchSession[0].username})
    res.json(currentUser[0]);
  } else {
    res.redirect('/');
  }
})

app.get('/logout', function(req, res){
  res.clearCookie('sessionTokenForRavelp');
  res.redirect('/');
})

app.post('/search', jsonParser, function(req, res){
  emitter.emit('search', req.body.content, req.body.location);
  res.json(foundStores);
})

app.get('/show-store/:id', function(req, res){
  var match = _.where(stores, {id: filterInt(req.params.id)});
  var reviewUserlist = [];
  for (var i = 0; i < match[0].reviews.length; i++) {
    var user = _.where(users, {id: match[0].reviews[i].userId});
    if (user.length>0){
      reviewUserlist.push({id: user[0].id, name: user[0].firstname});
    }
  }
  res.json({store: match[0], reviewers: reviewUserlist});
})

app.listen(port, function(){
  console.log('listening to port: ' + port);
})
