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
        userId: 3,
        description: tool.randomText(200),
        date: new Date(),
        rating: 5,
        tags: {useful: 5, funny: 100, cool: 0},
        comments: [{userId: 2, comments: tool.randomText(20)}, {userId: 1, comments: tool.randomText(10)}]
      }, {
        userId: 2,
        description: tool.randomText(200),
        date: new Date(),
        rating: 3,
        tags: {useful: 5, funny: 100, cool: 0},
        comments: [{userId: 3, comments: tool.randomText(20)}, {userId: 1, comments: tool.randomText(10)}]
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
        userId: 3,
        description: tool.randomText(200),
        date: new Date(),
        rating: 2,
        tags: {useful: 5, funny: 100, cool: 0},
        comments: [{userId: 2, comments: tool.randomText(20)}, {userId: 1, comments: tool.randomText(10)}]
      }, {
        userId: 2,
        description: tool.randomText(200),
        date: new Date(),
        rating: 1,
        tags: {useful: 5, funny: 100, cool: 0},
        comments: [{userId: 3, comments: tool.randomText(20)}, {userId: 1, comments: tool.randomText(10)}]
      }
    ]
  }
]

function Review(userId, description, rating, date){
  this.userId = userId;
  this.description = description;
  this.rating = rating;
  this.date = date;
}

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
  }, {
    id: 3,
    username: "wahaha",
    password: "123",
    firstname: "Helena",
    lastname: 'Kim',
    email: '123123@gmail.com',
    phone: '123-123-1233',
    address: '100 JD St., Irvine, CA92603',
    business: false
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
function Session(token, id){
  this.token = token;
  this.id = id;
}

// Search EventEmitter
var foundStores = [];
emitter.on('search', function(name, location){
  foundStores = [];
  search.target(name, location, stores, foundStores);
})

// Examination Evmiiter
var matchSession = [];
emitter.on('examination', function(cookie){
  matchSession = [];
  matchSession = _.where(sessions, {token: cookie});
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
        sessions.push(new Session(token, match[0].id));
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
    sessions.push(new Session(token, currentUser[0].id));
    res.json(currentUser[0]);
  }
})

app.get('/login', function(req, res){
  emitter.emit('examination', req.cookies.sessionTokenForRavelp);
  // var currentToken = req.cookies.sessionTokenForRavelp;
  // var matchSession = _.where(sessions, {token: currentToken});
  if (matchSession.length>0){
    var currentUser = _.where(users, {id: matchSession[0].id})
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
  var store = _.where(stores, {id: filterInt(req.params.id)});
  var reviewUserlist = [];
  for (var i = 0; i < store[0].reviews.length; i++) {
    var user = _.where(users, {id: store[0].reviews[i].userId});
    if (user.length>0){
      reviewUserlist.push({id: user[0].id, name: user[0].firstname});
    }
  }
  var currentToken = req.cookies.sessionTokenForRavelp;
  var matchSession = _.where(sessions, {token: currentToken});
  if (matchSession.length>0){
    var written = _.where(store.reviews, {userId: matchSession[0].id});
    if (written.length>0){
      res.json({writable: false, editable: true, store: store[0], reviewers: reviewUserlist});
    } else {
      res.json({writable: true, editable: false, store: store[0], reviewers: reviewUserlist});
    }
  } else {
    res.json({writable: false, editable: false, store: store[0], reviewers: reviewUserlist});
  }
})

app.post('/new-review', jsonParser, function(req, res){
  var id = req.body.id;
  var content = req.body.content;
  var rating = req.body.rating;
  var date = new Date();
  var currentToken = req.cookies.sessionTokenForRavelp;
  var matchSession = _.where(sessions, {token: currentToken});
  if (matchSession.length>0){
    var store = _.where(stores, {id: id});
    var addNewReview = new Review(matchSession[0].id, content, rating, date);
    store[0].reviews.push(addNewReview);
    console.log(store[0].reviews);
    var reviewUserlist = [];
    for (var i = 0; i < store[0].reviews.length; i++) {
      var user = _.where(users, {id: store[0].reviews[i].userId});
      if (user.length>0){
        reviewUserlist.push({id: user[0].id, name: user[0].firstname});
      }
    }
    res.json({writable: false, editable: true, store: store[0], reviewers: reviewUserlist});
  } else {
    res.sendStatus(404);
  }
})

app.listen(port, function(){
  console.log('listening to port: ' + port);
})
