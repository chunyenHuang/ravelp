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
var port = process.env.PORT || 1337;
var app = express();

// Database
var users = database.users;
var stores = database.stores;
var sessions = database.sessions;
var compliments = database.compliments;

// EventEmitter
var foundStores = [];
emitter.on('search', function(name, location){
  foundStores = [];
  search.target(name, location, stores, foundStores);
})

// Routes
app.use(cookieParser());
app.use('/', loginStatus);
app.use(express.static('./public'));
app.use(express.static('./public/assets'));
app.use(express.static('./public/images'));

// get
app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
})

app.get('/check-current-user', session, function(req, res){
  res.json({id: req.matchUser.id});
})

app.get('/check-own-store/:storeId', session, function(req, res){
  var userId = req.matchUser.id;
  var storeId = tool.filterInt(req.params.storeId);
  var store = _.where(stores, {id: storeId});
  if (store[0].userId === userId){
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
})

app.get('/check-review-post/:storeId', session, function(req, res){
  var userId = req.matchUser.id;
  var storeId = tool.filterInt(req.params.storeId);
  var store = _.where(stores, {id: storeId});
  var review = _.where(store[0].reviews, {userId: userId});
  if (review.length > 0) {
    res.json({review: review[0]});
  } else {
    res.sendStatus(205);
  }
})

app.get('/compliment-user/:id/:content', session, function(req, res){
  var currentUserId = req.matchUser.id;
  var id = tool.filterInt(req.params.id);
  var content = req.params.content;
  var compliment = new constructor.Compliment(currentUserId, id, content);
  compliments.push(compliment);
  res.sendStatus(200);
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
})

app.get('/get-currentUser', session, function(req, res){
  var matchUser = req.matchUser;
  var id = matchUser.id;
  var currentUser = _.where(users, {id: id});
  var store = _.where(stores, {userId: id});
  var userReviews = statistic.reviews(id);
  var followers = statistic.followers(id);
  currentUser[0].following = statistic.arrUserIdByReviewDate(currentUser[0].following);
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
    userReviews = [];
  }
  var others = {
    followers: followers,
    ratingCount: statistic.ratingCount(id),
    compliments: statistic.compliments(id),
  }
  res.json({
    user: currentUser[0],
    store: theStore,
    reviews: userReviews,
    others: others
  });
})

app.get('/get-compliments/:id', function(req, res) {
  var userId = tool.filterInt(req.params.id);
  var userCompliments = _.where(compliments, {receiver: userId});
  var givers = [];
  for (var i = 0; i < userCompliments.length; i++) {
    var matches = _.where(users, {id: userCompliments[i].giver});
    givers.push(matches[0]);
  }
  var object = {
    compliments: userCompliments,
    givers: givers,
  }
  res.json(object);
})

app.get('/get-review/:id/:subId', function(req, res){
  var store = _.where(stores, {id: tool.filterInt(req.params.id)});
  var review = _.where(store[0].reviews, {id: tool.filterInt(req.params.subId)});
  res.json({store: store[0], review: review[0]});
})

app.get('/guest', function(req, res) {
  res.json({login: false, stores: stores});
})

app.get('/home', authorization, function(req, res) {
  var matchUser = req.matchUser;
  var currentUser = _.where(users, {id: matchUser.id});
  res.json({login: true, user: currentUser[0], stores: stores});
})

app.get('/logout', function(req, res){
  res.clearCookie('sessionTokenForRavelp');
  res.sendStatus(200);
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
  if (theTag.length == 0){
    var array = theReview[0].tags;
    if (array.length>0){
      var last = _.last(array);
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
  var response = {
    tag: theTag[0],
    tagCount: statistic.countTag(theReview[0], tagName),
  }
  res.json(response);
})

app.get('/review-tags-count/:id/:review/', function(req, res){
  var matchUser = req.matchUser;
  var store = _.where(stores, {id: tool.filterInt(req.params.id)});
  var theReview = _.where(store[0].reviews, {id: tool.filterInt(req.params.review)});
  var theTag = _.where(theReview[0].tags, {userId: matchUser.id});
  var response = {
    useful: statistic.countTag(theReview[0], 'useful'),
    funny: statistic.countTag(theReview[0], 'funny'),
    cool: statistic.countTag(theReview[0], 'cool'),
  }
  res.json(response);
})

app.get('/search-for', function(req, res){
  var category = req.query.category;
  var found = [];
  for (var i = 0; i < stores.length; i++) {
    var check = _.contains(stores[i].category, category);
    if (check){
      found.push(stores[i]);
    }
  }
  res.json({stores: found});
})

app.get('/show-store/:id', function(req, res){
  var store = _.where(stores, {id: tool.filterInt(req.params.id)});
  var reviewUserlist = [];
  for (var i = 0; i < store[0].reviews.length; i++) {
    var user = _.where(users, {id: store[0].reviews[i].userId});
    if (user.length>0){
      reviewUserlist.push(user[0]);
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

app.get('/store-data/:id', function(req, res){
  var store = _.where(stores, {id: tool.filterInt(req.params.id)});
  res.json(store[0]);
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
  var matchComploments = _.where(compliments, {giver: req.matchUser.id, receiver: id});
  if (matchComploments.length>0) {
    var comlimented = true;
  } else {
    var comlimented = false;
  }
  var others = {
    followers: followers,
    followed: followed,
    ratingCount: statistic.ratingCount(id),
    tagCount: statistic.tagCount(id),
    compliments: statistic.compliments(id),
    comlimented: comlimented,
    currentUserId: req.matchUser.id,
  }
  res.json({
    user: user[0],
    reviews: userReviews,
    others: others,
  });
})

// post
app.post('/edit-store', session, jsonParser, function(req, res){
  var matchUser = req.matchUser;
  var id = req.body.id;
  var userId = matchUser.id;
  var theStore = _.where(stores, {id: id, userId: userId});
  theStore[0].name = req.body.name;
  theStore[0].category[0] = req.body.category;
  theStore[0].price = req.body.price;
  theStore[0].description = req.body.description;
  theStore[0].phone = req.body.phone;
  theStore[0].address = req.body.address;
  theStore[0].city = req.body.city;
  theStore[0].state = req.body.state;
  theStore[0].zipCode = req.body.zipCode;
  res.sendStatus('200');
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
  var thumb = 'p1.jpg';
  var email = req.body.email;
  var phone = req.body.phone;
  var address = req.body.address;
  var business = req.body.business;
  var following = [];
  var match = _.where(users, {username: username});
  if (match.length>0){
    res.sendStatus(403);
  } else {
    var last = _.last(users);
    var id = last.id + 1;
    var newUser = new constructor.User(id, username, password, firstname,
      lastname, thumb, email, phone, address, business, following);
    users.push(newUser);
    var currentUser = _.where(users, {username: username});
    var token = tool.sessionToken(50);
    res.cookie('sessionTokenForRavelp', token);
    sessions.push(new constructor.Session(token, currentUser[0].id));
    res.sendStatus(200);
  }
})

app.post('/new-store', session, jsonParser, function(req, res){
  var name = req.body.name;
  var category = [req.body.category];
  var price = req.body.price;
  var description = req.body.description;
  var phone = req.body.phone;
  var address = req.body.address;
  var hours = req.body.hours;
  var thumb = req.body.thumb;
  var matchUser = req.matchUser;
  var userId = matchUser.id;
  var last = _.last(stores);
  var id = last.id + 1;
  var newStore = new constructor.Store(id, userId, name, category, price, hours, description, phone, address, thumb);
  stores.push(newStore);
  res.json({id: id});
})

app.post('/new-review', session, jsonParser, function(req, res){
  var matchUser = req.matchUser;
  var id = tool.filterInt(req.body.id);
  var description = req.body.content;
  var rating = req.body.rating;
  var date = new Date();
  var store = _.where(stores, {id: id});
  var check = _.where(store[0].reviews, {userId: matchUser.id});
  var tags = [];
  var comments = [];
  if (check.length > 0){
    check[0].description = description;
    check[0].rating = rating;
    check[0].date = date;
  } else {
    var last = _.last(store[0].reviews);
    if (typeof(last) === 'object'){
      var newId = last.id + 1;
    } else {
      var newId = 1;
    }
    var addNewReview = new constructor.Review(newId, matchUser.id, description, rating, date, tags, comments);
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

app.post('/search', jsonParser, function(req, res){
  emitter.emit('search', req.body.content, req.body.location);
  res.json(foundStores);
})

// Server On
app.listen(port, function(){
  console.log('listening to port: ' + port);
})
