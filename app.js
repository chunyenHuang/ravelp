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
    userId: 2,
    name: 'Starbucks',
    thumb: '1.jpg',
    description: tool.randomText(150),
    phone: '(123) 123-1233',
    address: '105 Research Drive, Irvine, CA93023',
    tags: ['coffee', 'restaurant'],
    reviews: [
      {
        id: 1,
        userId: 3,
        description: tool.randomText(200),
        date: new Date(),
        rating: 5,
        tags: [{
          id: 1,
          userId: 2,
          useful: true,
          funny: true,
          cool: false
        }],
        comments: [{
          id:1,
          userId: 2,
          comments: tool.randomText(20)}]
      }, {
        id: 2,
        userId: 2,
        description: tool.randomText(200),
        date: new Date(),
        rating: 3,
        tags: [{id: 1, userId: 2, useful: true, funny: true, cool: false},{id:2, userId: 1, useful: false, funny: true, cool: false}],
        comments: [{id: 1, userId: 3, comments: tool.randomText(20)}, {id: 2, userId: 1, comments: tool.randomText(10)}]
      }
    ]
  }, {
    id: 2,
    userId: 2,
    name: 'Tomo Cafe',
    thumb: '2.jpg',
    phone: '(123) 123-1233',
    description: tool.randomText(150),
    address: '321 Culver Ave., Irvine, CA93023',
    tags: ['coffee', 'restaurant'],
    reviews: [
      {
        id: 1,
        userId: 3,
        description: tool.randomText(200),
        date: new Date(),
        rating: 2,
        tags: [{userId: 2, useful: true, funny: true, cool: false},{userId: 1, useful: false, funny: true, cool: false}],
        comments: [{userId: 2, comments: tool.randomText(20)}, {userId: 1, comments: tool.randomText(10)}]
      }, {
        id: 2,
        userId: 2,
        description: tool.randomText(200),
        date: new Date(),
        rating: 1,
        tags: [{userId: 1, useful: true, funny: true, cool: false},{userId: 1, useful: false, funny: true, cool: false}],
        comments: [{userId: 3, comments: tool.randomText(20)}, {userId: 1, comments: tool.randomText(10)}]
      }
    ]
  }
]

function Store(id, userId, name, description, phone, address, thumb){
  this.id = id;
  this.userId = userId;
  this.name = name;
  this.description = description;
  this.phone = phone;
  this.address = address;
  this.thumb = thumb;
  this.tags = [];
  this.reviews = [];
}

function Review(id, userId, description, rating, date, tags, comments){
  this.id = id;
  this.userId = userId;
  this.description = description;
  this.rating = rating;
  this.date = date;
  this.tags = [];
  this.commemts = [];
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
    username: "new",
    password: "123",
    firstname: "Helena",
    lastname: 'Kim',
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

// Add Random Database
for (var i=4; i<=500;i++){
  var firstname = tool.randomText(2);
  var lastname = tool.randomText(2);
  var addNewUser = new User(i, 'user', '123', firstname, lastname, 'email@gmail.com', '123-123-1233', 'address', false );
  users.push(addNewUser);
}
for (var i=3; i<=10; i++){
  var randomeUser = _.sample(users, 1);
  var addNewStore = new Store(i, randomeUser[0].id, tool.randomText(2), tool.randomText(50), '123-321-3333', tool.randomText(10), i+'.jpg');
  stores.push(addNewStore);
}
for (var i=1; i<=3000;i++){
  var randomStore = _.sample(stores, 1);
  var last = _.last(randomStore[0].reviews);
  if (typeof(last)==='object'){
    last = last.id+1
  } else {
    last =1;
  }
  var randomRating = Math.floor(Math.random() * (5)) + 1;
  var randomeUser = _.sample(users, 1);
  var randomYear = Math.floor(Math.random() * (8)) + 2008;
  var randomMonth = Math.floor(Math.random() * (11)) + 1;
  var randomDay = Math.floor(Math.random() * (29)) + 1;
  var randomDate = new Date(randomYear, randomMonth, randomDay);
  var addNewReview = new Review(last, randomeUser[0].id, tool.randomText(150), randomRating, randomDate);
  randomStore[0].reviews.push(addNewReview);
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
app.use(express.static('./public'));
app.use(express.static('./public/assets'));
app.use(express.static('./public/images'));
app.use(cookieParser());

app.get('/', function(req, res){
  res.redirect('/home');
})

app.get('/home', function(req, res){
  emitter.emit('examination', req.cookies.sessionTokenForRavelp);
  if (matchSession.length>0){
    var currentUser = _.where(users, {id: matchSession[0].id});
    res.json({login: true, user: currentUser[0], stores: stores});
  } else {
    res.json({login: false, stores: stores});
  }
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
    console.log(users);
    var currentUser = _.where(users, {username: username});
    var token = tool.sessionToken(50);
    res.cookie('sessionTokenForRavelp', token);
    sessions.push(new Session(token, currentUser[0].id));
    res.json(currentUser[0]);
  }
})

app.post('/new-store', jsonParser, function(req, res){
  emitter.emit('examination', req.cookies.sessionTokenForRavelp);
  if (matchSession.length>0){
    var name = req.body.name;
    var description = req.body.description;
    var phone = req.body.phone;
    var address = req.body.address;
    var thumb = req.body.thumb;
    var userId = matchSession[0].id;
    var last = _.last(stores);
    var id = last.id + 1;
    var newStore = new Store(id, userId, name, description, phone, address, thumb);
    stores.push(newStore);
    console.log(stores);
    res.sendStatus('200');
  }
  else {
    res.sendStatus('404');
  }
})

app.post('/edit-store', jsonParser, function(req, res){
  emitter.emit('examination', req.cookies.sessionTokenForRavelp);
  if (matchSession.length>0){
    var id = req.body.id;
    var name = req.body.name;
    var description = req.body.description;
    var phone = req.body.phone;
    var address = req.body.address;
    var userId = matchSession[0].id;
    var theStore = _.where(stores, {id: id, userId: userId});
    theStore[0].name = name;
    theStore[0].description = description;
    theStore[0].phone = phone;
    theStore[0].address = address;
    res.sendStatus('200');
  }
  else {
    res.sendStatus('404');
  }
})

app.get('/get-user', function(req, res){
  emitter.emit('examination', req.cookies.sessionTokenForRavelp);
  if (matchSession.length>0){
    var currentUser = _.where(users, {id: matchSession[0].id});
    var store = _.where(stores, {userId: matchSession[0].id});
    var allReviews = [];
    for (var i = 0; i < stores.length; i++) {
      var theReview = _.where(stores[i].reviews, {userId: matchSession[0].id});
      if (theReview.length>0){
        allReviews.push({store: stores[i], review: theReview[0]});
      }
    }
    if (store.length>0){
      var theStore = store;
    } else if (currentUser[0].business){
      var theStore = 'Add your store.';
    } else {
      var theStore = 'You have to register a business account.';
    }
    if (allReviews.length == 0){
      allReviews = 'You have not written any reviews yet.';
    }
    res.json({user: currentUser[0], store: theStore, reviews: allReviews});
  } else {
    res.redirect('/home');
  }
})

app.get('/logout', function(req, res){
  res.clearCookie('sessionTokenForRavelp');
  res.sendStatus(200);
})

app.post('/search', jsonParser, function(req, res){
  emitter.emit('search', req.body.content, req.body.location);
  res.json(foundStores);
})

app.get('/review-tags/:id/:review/:tag/:change', function(req, res){
  console.log(req.url);
  emitter.emit('examination', req.cookies.sessionTokenForRavelp);
  if (matchSession.length>0){
    var store = _.where(stores, {id: filterInt(req.params.id)});
    var theReview = _.where(store[0].reviews, {id: filterInt(req.params.review)});
    var tagName = req.params.tag;
    var change = req.params.change;
    var theTag = _.where(theReview[0].tags, {userId: matchSession[0].id});
    if (theTag.length < 1){
      var array = theReview[0].tags;
      array.push({userId: matchSession[0].id, useful: false, funny: false, cool: false });
      theTag = _.where(array, {userId: matchSession[0].id});
    }
    if (tagName === 'useful'){
      theTag[0].useful = change;
    }
    if (tagName === 'funny'){
      theTag[0].funny = change;
    }
    if (tagName === 'cool'){
      theTag[0].cool = change;
    }
    console.log(theTag[0]);
    res.send(theTag[0]);
  } else {
    res.sendStatus(404);
  }
})

app.get('/store-data/:id', function(req, res){
  var store = _.where(stores, {id: filterInt(req.params.id)});
  res.json(store[0]);
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
      res.json({writable: false, editable: true, store: store[0], reviewers: reviewUserlist, currentUserId: matchSession[0].id});
    } else {
      res.json({writable: true, editable: false, store: store[0], reviewers: reviewUserlist, currentUserId: matchSession[0].id});
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
