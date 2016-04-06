var tool = require('./tool.js');
var constructor = require('./constructor.js');
var _ = require('underscore');
var Faker = require('Faker');
function database(){
  var sessions = [];
  // Stores Database
  var stores =[
    {
      id: 1,
      userId: 2,
      name: 'Starbucks',
      thumb: '1.jpg',
      category: ['cafe'],
      price: '$',
      hours: {
        mon: [['9', '00', '2', '30'], ['4', '00', '6', '30']],
        tue: [['9', '00', '6', '30']],
        wed: [['9', '00', '6', '30']],
        thu: [['9', '00', '6', '30']],
        fri: [['9', '00', '6', '30']]
      },
      description: tool.randomText(20),
      phone: '123-123-1233',
      address: '105 Research Drive',
      city: 'Irvine',
      state: 'CA',
      zipcode: '90012',
      reviews: []
      //   {
      //     id: 1,
      //     userId: 3,
      //     description: tool.randomText(200),
      //     date: new Date(),
      //     rating: 5,
      //     tags: [{
      //       id: 1,
      //       userId: 2,
      //       useful: true,
      //       funny: true,
      //       cool: false
      //     }],
      //     comments: [{
      //       id:1,
      //       userId: 2,
      //       comments: tool.randomText(20)}]
      //   }
    }, {
      id: 2,
      userId: 2,
      name: 'Tomo Cafe',
      thumb: '2.jpg',
      category: ['cafe'],
      price: '$',
      hours: {
        mon: [['9', '00', '2', '30'], ['4', '00', '6', '30']],
        tue: [['9', '00', '6', '30']],
        wed: [['9', '00', '6', '30']],
        thu: [['9', '00', '6', '30']],
        fri: [['9', '00', '6', '30']]
      },
      phone: '890-123-1233',
      description: tool.randomText(20),
      address: '321 Culver Ave.',
      city: 'Irvine',
      state: 'CA',
      zipcode: '90012',
      reviews: []
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
      following: [2, 3, 5, 10, 11, 12, 13, 20]
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
      following: [1, 3, 5, 10, 15, 16, 17, 18, 19, 20]
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
      following: [1, 2, 5, 10]
    }
  ];

  // Add Random Users
  for (var i=4; i<=20;i++){
    var username = Faker.Name.findName();
    var firstname = Faker.Name.firstName();
    var lastname = Faker.Name.lastName();
    var email = Faker.Internet.email();
    var phone = Faker.PhoneNumber.phoneNumber();
    var address = {
      address: Faker.Address.streetAddress(),
      city: Faker.Address.city(),
      state: Faker.Address.usState(),
      zipCode: Faker.Address.zipCode(),
    }
    var thumb = Faker.Image.avatar();
    var following = [];
    var randomOtherUsers = _.sample(users, 50);
    for (var x = 0; x < randomOtherUsers.length; x++) {
      following.push(randomOtherUsers[x].id);
    }
    var addNewUser = new constructor.User(i, username, '123', firstname, lastname, thumb, email, phone, address, false, following);
    users.push(addNewUser);
  }

  // Add Random Stores
  function pickCatetory(){
    var categorys = [
      'Restaurants',
      'Cafe',
      'Shopping',
      'Home & Garden',
      'Fashion',
      'Pet Stores',
      'Automotive',
      'Sporting Goods',
    ];
    var random = Math.floor(Math.random() * (categorys.length));
    var picked = [categorys[random]];
    return picked;
  };
  function pickPrice(){
    var price = [
      '$',
      '$$',
      '$$$',
      '$$$$'
    ];
    var random = Math.floor(Math.random() * (price.length));
    var picked = [price[random]];
    return picked;
  };
  for (var i=3; i<=10; i++){
    var randomeUser = _.sample(users, 1);
    var randomName = Faker.Company.companyName();
    var randomCategory = pickCatetory();
    var randomPrice = pickPrice();
    var randomPhone = Faker.PhoneNumber.phoneNumber();
    var randomHours = {
      mon: [['9', '00', '2', '30'], ['4', '00', '6', '30']],
      tue: [['9', '00', '6', '30']],
      wed: [['9', '00', '6', '30']],
      thu: [['9', '00', '6', '30']],
      fri: [['9', '00', '6', '30']]
    };
    var randomAddress = {
      address: Faker.Address.streetName(),
      city: Faker.Address.city(),
      state: Faker.Address.usState(),
      zipCode: Faker.Address.zipCode(),
    }
    var addNewStore = new constructor.Store(i, randomeUser[0].id, randomName, randomCategory, randomPrice, randomHours,
       tool.randomText(20), randomPhone, randomAddress, i+'.jpg');
    stores.push(addNewStore);
  }
  // Add Random Reviews
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
    // var randomDate = new Date(randomYear, randomMonth, randomDay);
    var randomDate = [randomYear, randomMonth, randomDay];
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
