// Modules
var express = require('express');
var database = require('./modules/database.js');
var authorization = require('./modules/authorization.js');
var session = require('./modules/session.js');
var loginStatus = require('./modules/loginStatus.js');
var tool = require('./modules/tool.js');
var statistic = require('./modules/statistic.js');
var search = require('./modules/search.js');
var constructor = require('./modules/constructor.js');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var _ = require('underscore');
var cookieParser = require('cookie-parser');
var events = require('events');
var emitter = new events.EventEmitter();
var port = 3000;
var app = express();

var users = database.users;
var stores = database.stores;
var sessions = database.sessions;

// Sessions
// emitter.on('examination', function(cookie){
//   matchSession = [];
//   matchSession = _.where(sessions, {token: cookie});
// })

// Search EventEmitter
var foundStores = [];
emitter.on('search', function(name, location){
  foundStores = [];
  search.target(name, location, stores, foundStores);
})

// Routes
app.use(cookieParser());
// app.use(session);
app.use(express.static('./public'));
app.use(express.static('./public/assets'));
app.use(express.static('./public/images'));

// CRUD
app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
})

app.get('/home', authorization, function(req, res) {
  var matchUser = req.matchUser;
  var currentUser = _.where(users, {id: matchUser.id});
  res.json({login: true, user: currentUser[0], stores: stores});
})

app.get('/guest', function(req, res) {
  res.json({login: false, stores: stores});
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
        sessions.push(new constructor.Session(token, match[0].id));
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
app.post('/new-store', session, jsonParser, function(req, res){
  var matchUser = req.matchUser;
  var name = req.body.name;
  var description = req.body.description;
  var phone = req.body.phone;
  var address = req.body.address;
  var thumb = req.body.thumb;
  var userId = matchUser.id;
  var last = _.last(stores);
  var id = last.id + 1;
  var newStore = new constructor.Store(id, userId, name, description, phone, address, thumb);
  stores.push(newStore);
  console.log(stores);
  res.sendStatus('200');
})
app.post('/edit-store', session, jsonParser, function(req, res){
  var matchUser = req.matchUser;
  var id = req.body.id;
  var name = req.body.name;
  var description = req.body.description;
  var phone = req.body.phone;
  var address = req.body.address;
  var userId = matchUser.id;
  var theStore = _.where(stores, {id: id, userId: userId});
  theStore[0].name = name;
  theStore[0].description = description;
  theStore[0].phone = phone;
  theStore[0].address = address;
  res.sendStatus('200');
})

app.get('/logout', function(req, res){
  res.clearCookie('sessionTokenForRavelp');
  res.sendStatus(200);
})
app.post('/search', jsonParser, function(req, res){
  emitter.emit('search', req.body.content, req.body.location);
  res.json(foundStores);
})

app.get('/store-data/:id', function(req, res){
  var store = _.where(stores, {id: tool.filterInt(req.params.id)});
  res.json(store[0]);
})
app.get('/get-currentUser', session, function(req, res){
  var matchUser = req.matchUser;
  var id = matchUser.id;
  var currentUser = _.where(users, {id: id});
  var store = _.where(stores, {userId: id});
  var userReviews = statistic.reviews(id);
  var followers = statistic.followers(id);

  if (store.length>0){
    var theStore = store;
  }
  else if (currentUser[0].business){
    var theStore = 'Add your store.';
  }
  else {
    var theStore = 'You have to register a business account.';
  }
  if (userReviews.length == 0){
    userReviews = 'You have not written any reviews yet.';
  }

  var others = {
    followers: followers,
    ratingCount: statistic.ratingCount(id),
  }
  res.json({
    user: currentUser[0],
    store: theStore,
    reviews: userReviews,
    others: others
  });
})

app.get('/user-data/:id', loginStatus, function(req, res){
  var currentUser = _.where(users, {id: req.matchUser.id});
  var id = tool.filterInt(req.params.id);
  var user = _.where(users, {id: id});
  var userReviews = statistic.reviews(id);
  var followers = statistic.followers(id);

  if (_.contains(followers, currentUser[0])) {
    var followed = true;
  } else {
    var followed = false;
  }
  var others = {
    followers: followers,
    followed: followed,
    ratingCount: statistic.ratingCount(id),
    tagCount: statistic.tagCount(id),
  }
  console.log(user[0].firstname);
  res.json({
    user: user[0],
    reviews: userReviews,
    others: others,
  });
})

app.get('/show-store/:id', function(req, res){
  var store = _.where(stores, {id: tool.filterInt(req.params.id)});
  var reviewUserlist = [];
  for (var i = 0; i < store[0].reviews.length; i++) {
    var user = _.where(users, {id: store[0].reviews[i].userId});
    if (user.length>0){
      reviewUserlist.push(user[0]);
      // reviewUserlist.push({id: user[0].id, name: user[0].firstname});
    }
  }
  var matchSession = _.where(sessions, {token: req.cookies.sessionTokenForRavelp});
  if (matchSession.length>0) {
    var written = _.where(store[0].reviews, {userId: matchSession[0].id});
    if (written.length>0) {
      res.json({writable: false, editable: true, store: store[0], reviewers: reviewUserlist, currentUserId: matchSession[0].id});
    } else {
      res.json({writable: true, editable: false, store: store[0], reviewers: reviewUserlist, currentUserId: matchSession[0].id});
    }
  } else {
    res.json({writable: false, editable: false, store: store[0], reviewers: reviewUserlist});
  }
})

app.get('/follow-user/:id', session, function(req, res){
  var matchUser = _.where(users, {id: req.matchUser.id});
  var id = tool.filterInt(req.params.id);
  var user = _.where(users, {id: id});
  var position = _.indexOf(matchUser[0].following, id);
  if (position != -1) {
    matchUser[0].following.splice(position, 1);
    res.json({id: user[0].id});
  } else {
    matchUser[0].following.push(id);
    res.json({id: user[0].id});
  }
  console.log(matchUser[0].following);
})

app.get('/review-tags/:id/:review/:tag/:change', session, function(req, res){
  var matchUser = req.matchUser;
  var store = _.where(stores, {id: tool.filterInt(req.params.id)});
  var theReview = _.where(store[0].reviews, {id: tool.filterInt(req.params.review)});
  var tagName = req.params.tag;
  var change = req.params.change;
  if (change === 'true'){
    change = true;
  } else {
    change = false;
  }
  var theTag = _.where(theReview[0].tags, {userId: matchUser.id});
  if (theTag.length < 1){
    var array = theReview[0].tags;
    if (theReview[0].tags.length>0){
      var last = _.last(theReview[0].tags);
      var id = last.id+1;
    } else{
      var id = 1;
    }
    array.push({id: id, userId: matchUser.id, useful: false, funny: false, cool: false });
    theTag = _.where(array, {userId: matchUser.id});
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
  var response = {
    tag: theTag[0],
    tagCount: statistic.countTag(theReview[0], tagName),
  }
  res.json(response);
})

app.post('/new-review', session, jsonParser, function(req, res){
  var matchUser = req.matchUser;
  var id = req.body.id;
  var description = req.body.content;
  var rating = req.body.rating;
  var date = new Date();
  var store = _.where(stores, {id: id});
  var check = _.where(store[0].reviews, {userId: matchUser.id});
  if (check.length > 0){
    check[0].description = description;
    check[0].rating = rating;
    check[0].date = date;
  } else {
    var last = _.last(store[0].reviews);
    if (last.id > 0){
      var newId = last.id + 1;
    } else {
      var newId = 1;
    }
    var addNewReview = new constructor.Review(newId, matchUser.id, content, rating, date);
    store[0].reviews.push(addNewReview);
  }
  var reviewUserlist = [];
  for (var i = 0; i < store[0].reviews.length; i++) {
    var user = _.where(users, {id: store[0].reviews[i].userId});
    if (user.length>0){
      reviewUserlist.push({id: user[0].id, name: user[0].firstname});
    }
  }
  res.json({writable: false, editable: true, store: store[0], reviewers: reviewUserlist, currentUserId: matchUser.id});
})

app.get('/get-review/:id/:subId', function(req, res){
  var store = _.where(stores, {id: tool.filterInt(req.params.id)});
  var review = _.where(store[0].reviews, {id: tool.filterInt(req.params.subId)});
  res.json({store: store[0], review: review[0]});
})

app.get('/check-current-user', session, function(req, res){
  console.log('ask for current user id');
  res.json({id: req.matchUser.id});
})

app.listen(port, function(){
  console.log('listening to port: ' + port);
})
