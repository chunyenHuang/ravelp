var tool = require('./tool.js');
var database = require('./database.js');
var constructor = require('./constructor.js');
var _ = require('underscore');

var users = database.users;
var stores = database.stores;
var sessions = database.sessions;

function statistic(){
  function reviews(id){
    var userReviews = [];
    for (var i = 0; i < stores.length; i++) {
      var match = _.where(stores[i].reviews, {userId: id});
      if (match.length>0){
        userReviews.push({store: stores[i], review: match[0]});
      }
    }
    return userReviews;
  }
  function followers(id){
    var followers = [];
    for (var i = 0; i < users.length; i++) {
      for (var x = 0; x < users[i].following.length; x++) {
        if (users[i].following[x]===id){
          followers.push(users[i]);
        }
      }
    }
    return followers;
  }
  return {
    reviews: reviews, // [{store, review}, {}...]
    followers: followers, // [id, ids...]
  }
}
module.exports = statistic();
