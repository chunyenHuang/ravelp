var tool = require('./tool.js');
var constructor = require('./constructor.js');
var _ = require('underscore');

function database(){
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

  // Add Random Database
  for (var i=4; i<=500;i++){
    var firstname = tool.randomText(2);
    var lastname = tool.randomText(2);
    var addNewUser = new constructor.User(i, 'user', '123', firstname, lastname, 'email@gmail.com', '123-123-1233', 'address', false );
    users.push(addNewUser);
  }
  for (var i=3; i<=10; i++){
    var randomeUser = _.sample(users, 1);
    var addNewStore = new constructor.Store(i, randomeUser[0].id, tool.randomText(2), tool.randomText(50), '123-321-3333', tool.randomText(10), i+'.jpg');
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
    var addNewReview = new constructor.Review(last, randomeUser[0].id, tool.randomText(150), randomRating, randomDate);
    randomStore[0].reviews.push(addNewReview);
  }
  return {
    stores: stores,
    users: users
  }
}

module.exports = database();
