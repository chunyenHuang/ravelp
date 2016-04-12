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
      category: ['Cafe'],
      price: '$',
      hours: {
        mon: ['9', '00', '2', '30'],
        tue: ['9', '00', '6', '30'],
        wed: ['9', '00', '6', '30'],
        thu: ['9', '00', '6', '30'],
        fri: ['9', '00', '6', '30']
      },
      description: tool.randomText(20),
      phone: '123-123-1233',
      address: '105 Research Drive',
      city: 'Irvine',
      state: 'CA',
      zipCode: 90012,
      reviews: []
    }, {
      id: 2,
      userId: 2,
      name: 'Tomo Cafe',
      thumb: '2.jpg',
      category: ['Cafe'],
      price: '$',
      hours: {
        mon: ['9', '00', '2', '30'],
        tue: ['9', '00', '6', '30'],
        wed: ['9', '00', '6', '30'],
        thu: ['9', '00', '6', '30'],
        fri: ['9', '00', '6', '30']
      },
      phone: '890-123-1233',
      description: tool.randomText(20),
      address: '321 Culver Ave.',
      city: 'Irvine',
      state: 'CA',
      zipCode: 90203,
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
      address: {
        address: '100 JD St',
        city: 'Irvine',
        state: 'CA',
        zipCode: 92603,
      },
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
      address: {
        address: '100 JD St',
        city: 'Irvine',
        state: 'CA',
        zipCode: 92603,
      },
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
      address: {
        address: '100 JD St',
        city: 'Irvine',
        state: 'CA',
        zipCode: 92603,
      },
      business: true,
      following: [1, 2, 5, 10]
    }
  ];

  // Add Random Users
  for (var i=4; i<=300;i++){
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
    var randomOtherUsers = _.sample(users, 5);
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
  function pickNumber(min, max) {
    var random = Math.floor(Math.random() * (max) + min);
    return random;
  }
  for (var i=3; i<=10; i++){
    var randomeUser = _.sample(users, 1);
    var randomName = Faker.Company.companyName();
    var randomCategory = pickCatetory();
    var randomPrice = pickPrice();
    var randomPhone = Faker.PhoneNumber.phoneNumber();
    var randomNum1 = pickNumber(6, 12);
    var randomNum2 = pickNumber(2, 10);
    if (randomNum1%2 ===0){
      var zz = '00';
      var tz = '30';
    } else {
      var zz = '00';
      var tz = '00';
    }
    var randomHours = {
      mon: [randomNum1, zz, randomNum2, tz],
      tue: [randomNum1, zz, randomNum2, tz],
      wed: [randomNum1, zz, randomNum2, tz],
      thu: [randomNum1, zz, randomNum2, tz],
      fri: [randomNum1, zz, randomNum2, tz],
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
  function pickDate(){
    var randomYear = Math.floor(Math.random() * (8)) + 2008;
    var randomMonth = Math.floor(Math.random() * (11));
    var randomDay = Math.floor(Math.random() * (29)) + 1;
    var randomDate = new Date(randomYear, randomMonth, randomDay);
    return randomDate;
  }
  var userWhoWrite = _.sample(users, 250);
  var storesArray1 = [stores[0], stores[1], stores[2]];
  var storesArray2 = _.difference(stores, storesArray1);
  function reviewStores(stores, min, max, amount){
    for (var i=1; i<=amount; i++){
      var randomStore = _.sample(stores, 1);
      var randomRating = Math.floor(Math.random() * (max-min+1)) + min;

      var wroteUsers = [];
      if (typeof(randomStore.reviews) === 'array') {
        for (var i = 0; i < randomStore.reviews.length; i++) {
          var matches = _.where(users, {id: randomStore.reviews[i].userId});
          wroteUsers.push(matches[0]);
        }
      }
      var diffUser = _.difference(userWhoWrite, wroteUsers);
      var randomeUser = _.sample(diffUser, 1);
      var last = _.last(randomStore[0].reviews);
      if (typeof(last)==='object'){
        last = last.id+1
      } else {
        last =1;
      }
      var randomDate = pickDate();
      var randomTagsArray = [];
      for (var x = 1; x <= 10; x++) {
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
  }
  reviewStores(storesArray1, 3, 5, 1000);
  reviewStores(storesArray1, 1, 3, 50);
  reviewStores(storesArray2, 3, 5, 100);
  reviewStores(storesArray2, 1, 4, 500);

  // Add Random Compliment
  var compliments = [];
  for (var i = 0; i < 500; i++) {
    var randomeUser1 = _.sample(users, 1);
    var randomeUser2 = _.sample(users, 1);
    var message = Faker.Lorem.sentence();
    var match = _.where(compliments, {giver: randomeUser1, receiver:randomeUser2});
    if (match.length == 0){
      var compliment = new constructor.Compliment(randomeUser1[0].id, randomeUser2[0].id, message);
      compliments.push(compliment);
    }
  }
  return {
    stores: stores,
    users: users,
    sessions: sessions,
    compliments: compliments,
  }
}

module.exports = database();
