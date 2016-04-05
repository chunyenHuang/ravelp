var tool = require('./tool.js');
var constructor = require('./constructor.js');
var _ = require('underscore');

function database(){
  var sessions = [];
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
          tags: [{id: 1, userId: 2, useful: true, funny: true, cool: false},
                 {id: 2, userId: 1, useful: false, funny: true, cool: false}],
          comments: [{userId: 2, comments: tool.randomText(20)}, {userId: 1, comments: tool.randomText(10)}]
        }, {
          id: 2,
          userId: 2,
          description: tool.randomText(200),
          date: new Date(),
          rating: 1,
          tags: [{id: 1, userId: 1, useful: true, funny: true, cool: false},
                 {id: 2, userId: 1, useful: false, funny: true, cool: false}],
          comments: [{userId: 3, comments: tool.randomText(20)}, {userId: 1, comments: tool.randomText(10)}]
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
      thumb: 'p1.jpg',
      email: '123123@gmail.com',
      phone: '123-123-1233',
      address: '100 JD St., Irvine, CA92603',
      business: false,
      following: [2, 3, 5, 10, 31, 23, 123, 200]
    }, {
      id: 2,
      username: "business",
      password: "123",
      firstname: "Steve",
      lastname: 'Ma',
      thumb: 'p2.jpg',
      email: '123123@gmail.com',
      phone: '123-123-1233',
      address: '100 JD St., Irvine, CA92603',
      business: true,
      following: [1, 3, 5, 10, 31, 23, 123, 200]
    }, {
      id: 3,
      username: "new",
      password: "123",
      firstname: "Helena",
      lastname: 'Kim',
      thumb: 'p3.jpg',
      email: '123123@gmail.com',
      phone: '123-123-1233',
      address: '100 JD St., Irvine, CA92603',
      business: true,
      following: [1, 2, 5, 10, 31, 23, 123, 200]
    }
  ];

  // Add Random Database
  for (var i=4; i<=20;i++){
    var firstname = tool.randomText(2);
    var lastname = tool.randomText(2);
    var count = Math.floor(Math.random() * (10)) + 1;
    var thumb = 'p'+count+'.jpg';
    var following = [];
    var randomOtherUsers = _.sample(users, 50);
    for (var x = 0; x < randomOtherUsers.length; x++) {
      if (randomOtherUsers[x] != i){
        following.push(randomOtherUsers[x].id);
      }
    }
    var addNewUser = new constructor.User(i, 'user', '123', firstname, lastname, thumb, 'email@gmail.com', '123-123-1233', 'address', false, following);
    users.push(addNewUser);
  }
  for (var i=3; i<=10; i++){
    var randomeUser = _.sample(users, 1);
    var addNewStore = new constructor.Store(i, randomeUser[0].id, tool.randomText(2), tool.randomText(50), '123-321-3333', tool.randomText(10), i+'.jpg');
    stores.push(addNewStore);
  }
  for (var i=1; i<=300;i++){
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
    var randomTagsArray = [];
    for (var x = 1; x <= 50; x++) {
      var tf1 = Math.floor(Math.random() * (2)) + 1;
      if (tf1 == 1){tf1 = true;} else {tf1= false;}
      var tf2 = Math.floor(Math.random() * (2)) + 1;
      if (tf2 == 1){tf2 = true;} else {tf2= false;}
      var tf3 = Math.floor(Math.random() * (2)) + 1;
      if (tf3 == 1){tf3 = true;} else {tf3= false;}
      var randomTag = new constructor.Tags(x, x, tf1, tf2, tf3);
      randomTagsArray.push(randomTag);
    }
    var addNewReview = new constructor.Review(last, randomeUser[0].id, tool.randomText(150), randomRating, randomDate, randomTagsArray);
    randomStore[0].reviews.push(addNewReview);
  }
  return {
    stores: stores,
    users: users,
    sessions: sessions
  }
}

module.exports = database();
