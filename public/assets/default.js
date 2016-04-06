
function filterInt(value) {
  if (/^(\-|\+)?([0-9]+|Infinity)$/.test(value)){
    return Number(value);
  }
  return NaN;
}

function timeStamp(date) {
  // var showDate = [ date.getMonth() + 1, date.getDate(), date.getFullYear() ];
  var showDate = [ date[1], date[2], date[0]];
  return showDate.join("/");
}

function removeAllChild(nodeName){
  while (nodeName.firstChild) {
      nodeName.removeChild(nodeName.firstChild);
  }
}

var currentUser = 0;
function checkCurrentUser(){
  var XHR = new XMLHttpRequest();
  XHR.open('get', '/check-current-user');
  XHR.send();
  XHR.onload = function(){
    if (XHR.status != 404){
      var response = JSON.parse(XHR.responseText);
      currentUser = response.id;
    } else {
      console.log('not found');
    }
  }
}

function toggleClass(target, value){
  var classes = target.className.split(' ');
  var position = classes.indexOf(value);
  if (position === -1 ){
    classes.push(value);
  } else {
    classes.splice(position, 1);
  }
  target.className = classes.join(' ');
}

function clearPage(){
  removeAllChild(main);
  removeAllChild(storeReviews);
  storeDetail.classList.add('hidden');
  accountDetail.classList.add('hidden');
  loginForm.classList.add('hidden');
  newUserForm.classList.add('hidden');
  newStoreForm.classList.add('hidden');
  editStoreForm.classList.add('hidden');
}

function homepage(){
  var XHR = new XMLHttpRequest();
  XHR.open('get', '/home');
  XHR.send();
  XHR.onload = function(){
    var response = JSON.parse(XHR.responseText);
    if (response.login) {
      clearPage();
      profile.classList.remove('hidden');
      logout.classList.remove('hidden');
      login.classList.add('hidden');
      profile.setAttribute('data-id', response.user.id);
      // navbar
      navbarUsername.textContent = 'Hello~ ' + response.user.firstname;
    }
    for (var i = 0; i < response.stores.length; i++) {
      showStores(response.stores[i]);
    }
  }
}

homepage();

// Elements
var main = document.getElementById('main');
var storeDetail = document.getElementById('store-detail');
var storeReviews = document.getElementById('store-reviews');
var accountDetail = document.getElementById('account-detail');
var navbarUsername = document.getElementById('show-user-name');
var loginForm = document.getElementById('login-form');
var newUserForm = document.getElementById('user-application');
var newStoreForm = document.getElementById('store-application');
var editStoreForm = document.getElementById('store-edit');
var login = document.getElementById('login-button');
var logout = document.getElementById('logout-button');
var profile = document.getElementById('profile-button');

// EventListeners
document.body.addEventListener('click', function(event){
  if (event.target.hasAttribute('data-type')){
    var id = filterInt(event.target.getAttribute('data-id'));
    var type = event.target.getAttribute('data-type');
  }
  else {
    var id = filterInt(event.target.parentNode.getAttribute('data-id'));
    var type = event.target.parentNode.getAttribute('data-type');
  }
  if (type==='home'){
    homepage();
  }
  if (type==='show-login-page'){
    event.preventDefault();
    showLoginPage();
  }
  if (type==='review-tags'){
    event.preventDefault();
    var review = event.target.getAttribute('data-sub-id');
    var tag = event.target.getAttribute('name');
    var XHR = new XMLHttpRequest();
    if (event.target.classList.contains('active')){
      var change = false;
    } else {
      var change = true;
    }
    XHR.open('get','/review-tags/' + id + '/' + filterInt(review) + '/' + tag + '/' + change);
    XHR.send();
    XHR.onload = function(){
      var response = JSON.parse(XHR.response);
      toggleClass(event.target, 'active');
      event.target.textContent = event.target.getAttribute('name') + ' ' + response.tagCount ;
    }
  }
  if (type==='new-user'){
    newUserForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
  }
  if (type==='logout'){
    var XHR = new XMLHttpRequest();
    XHR.open('get','/logout');
    XHR.send();
    clearPage();
    login.classList.remove('hidden');
    logout.classList.add('hidden');
    profile.classList.add('hidden');
    navbarUsername.textContent = '';
    XHR.onload = function(){
      homepage();
    }
  }
  if (type==='profile'){
    getCurrentUser();
  }
  if (type==='show-store'){
    event.preventDefault();
    getStoreData(id);
  }
  if (type==='show-add-store-page'){
    clearPage();
    newStoreForm.classList.remove('hidden');
  }
  if (type==='show-edit-store-page'){
    clearPage();
    var XHR = new XMLHttpRequest();
    XHR.open('get', '/store-data/' + id);
    XHR.send();
    XHR.onload = function(){
      var store = JSON.parse(XHR.responseText);
      editStoreForm.setAttribute('data-id', filterInt(store.id));
      var name = document.getElementById('edit-store-name');
      var description = document.getElementById('edit-store-description');
      var phone = document.getElementById('edit-store-phone');
      var address = document.getElementById('edit-store-address');
      name.value = store.name;
      description.value = store.description;
      phone.value = store.phone;
      address.value = store.address;
      editStoreForm.classList.remove('hidden');
    }
  }
  if (type==='edit-review'){
    var subId = filterInt(event.target.getAttribute('data-sub-id'));
    var editBox = document.getElementById('myReview-' + id + '-' + subId);
    removeAllChild(editBox);
    var XHR = new XMLHttpRequest();
    XHR.open('get', '/get-review/' + id + '/' + subId);
    XHR.send();
    XHR.onload = function(){
      var response = JSON.parse(XHR.responseText);
      console.log(response);
      reviewForm(response.store, response.review, editBox);
    }
  }
  if (type==='follow-user') {
    event.preventDefault();
    var value = event.target.getAttribute('data-value');
    var XHR = new XMLHttpRequest();
    XHR.open('get', '/follow-user/' + id);
    XHR.send();
    XHR.onload = function(){
      var response = JSON.parse(XHR.responseText);
      if (value === 'true'){
        var location = document.getElementById('user-thumb-box-'+id);
        removeAllChild(location);
        displayUser(response.id, true, location);
      } else {
        var locationId = event.target.getAttribute('saved-location');
        var location = document.getElementById(locationId);
        displayUser(response.id, false, location);
      }
    }
  }
  if (type==='show-user') {
    event.preventDefault();
    clearPage();
    displayUser(id, false, main);
  }
})

document.body.addEventListener('submit', function(event){
  event.preventDefault();
  var id = filterInt(event.target.getAttribute('data-id'));
  var type = event.target.getAttribute('data-type');

  if (type==='login'){
    var inputUsername = document.getElementById('input-username');
    var inputPassword = document.getElementById('input-password');
    var inputRemember = document.getElementById('remember-me');
    var inputBusiness = document.getElementById('business');
    var loginUser = {
      username: inputUsername.value,
      password: inputPassword.value,
      remember: inputRemember.checked,
      business: inputBusiness.checked,
    };
    var payload = JSON.stringify(loginUser);
    var XHR = new XMLHttpRequest();
    XHR.open('POST','/login');
    XHR.setRequestHeader('content-type', 'application/json');
    XHR.send(payload);

    var msg = document.getElementById('error-msg');
    XHR.onload = function(){
      if (XHR.status === 404) {
        msg.textContent = '(username not exists)';
      } else if (XHR.status === 403){
        msg.textContent = '(wrong password)';
      } else {
        var response = JSON.parse(XHR.responseText);
        clearPage();
        profile.classList.remove('hidden');
        logout.classList.remove('hidden');
        login.classList.add('hidden');
        profile.setAttribute('data-id', response.id);
        // navbar
        navbarUsername.textContent = 'Hello~ ' + response.firstname;
        getCurrentUser();
      }
    }
  }
  if (type==='new-user'){
    var username = document.getElementById('new-username');
    var password = document.getElementById('new-password');
    var firstname = document.getElementById('new-firstname');
    var lastname = document.getElementById('new-lastname');
    var email = document.getElementById('new-email');
    var phone = document.getElementById('new-phone');
    var address = document.getElementById('new-address');
    var business = document.getElementById('new-business');

    var newUser = {
      username: username.value,
      password: password.value,
      firstname: firstname.value,
      lastname: lastname.value,
      email: email.value,
      phone: phone.value,
      address: address.value,
      business: business.checked,
    };
    var payload = JSON.stringify(newUser);
    var XHR = new XMLHttpRequest();
    XHR.open('POST', '/newuser');
    XHR.setRequestHeader('content-type', 'application/json');
    XHR.send(payload);

    var msg = document.getElementById('error-msg-2');
    XHR.onload = function(){
      if (XHR.status === 403) {
        msg.textContent = '(username is already taken)';
      } else {
        var response = JSON.parse(XHR.responseText);
        clearPage();
        profile.classList.remove('hidden');
        logout.classList.remove('hidden');
        login.classList.add('hidden');
        profile.setAttribute('data-id', response.id);
      }
    }
  }
  if (type==='search'){
    var content = document.getElementById('search-content');
    var location = document.getElementById('search-location');
    var newSearch = {
      content: content.value,
      location: location.value
    }
    var payload = JSON.stringify(newSearch);
    var XHR = new XMLHttpRequest();
    XHR.open('POST', '/search');
    XHR.setRequestHeader('content-type', 'application/json');
    XHR.send(payload);

    XHR.onload = function(){
      var store = JSON.parse(XHR.responseText);
      clearPage();
      for (var i=0; i<store.length; i++){
        showStores(store[i]);
      }
    }
  }
  if (type==='new-store'){
    var name = document.getElementById('new-store-name');
    var description = document.getElementById('new-store-description');
    var phone = document.getElementById('new-store-phone');
    var address = document.getElementById('new-store-address');
    var newStore = {
      name: name.value,
      description: description,
      phone: phone.value,
      address: address.value,
      thumb: 'store.jpg'
    }
    var payload = JSON.stringify(newStore);
    var XHR = new XMLHttpRequest();
    XHR.open('post', '/new-store');
    XHR.setRequestHeader('content-type', 'application/json');
    XHR.send(payload);

    XHR.onload = function(){
      if (XHR.status===200){
        getUserData();
      }
      else {
        clearPage();
      }
    }
  }
  if (type==='edit-store'){
    var name = document.getElementById('edit-store-name');
    var description = document.getElementById('edit-store-description');
    var phone = document.getElementById('edit-store-phone');
    var address = document.getElementById('edit-store-address');
    var editStore = {
      id: id,
      name: name.value,
      description: description.value,
      phone: phone.value,
      address: address.value,
    }
    var payload = JSON.stringify(editStore);
    var XHR = new XMLHttpRequest();
    XHR.open('post', '/edit-store');
    XHR.setRequestHeader('content-type', 'application/json');
    XHR.send(payload);

    XHR.onload = function(){
      if (XHR.status===200){
        getCurrentUser();
      }
      else {
        clearPage();
      }
    }
  }
})

function showLoginPage(){
  clearPage();
  loginForm.classList.remove('hidden');
}

function getCurrentUser(){
  var XHR = new XMLHttpRequest();
  XHR.open('get', '/get-currentUser');
  XHR.send();
  XHR.onload = function(){
    var response = JSON.parse(XHR.responseText);
    showUser(response);
  }
}

function showUser(object){
  clearPage();
  var user = object.user;
  var store = object.store;
  var reviews = object.reviews;
  var followers = object.others.followers;
  accountDetail.classList.remove('hidden');

  // My Info
  // var heading = document.getElementById('account-title');
  // heading.textContent = '';
  // var row = document.createElement('div');
  // row.className = "row";
  // var body = document.createElement('div');
  // body.className = 'col-md-12';
  // var ul = document.createElement('ul');
  // var li1 = document.createElement('li');
  // var li2 = document.createElement('li');
  // var li3 = document.createElement('li');
  // var li4 = document.createElement('li');
  // var li5 = document.createElement('li');
  // var li6 = document.createElement('li');
  // li1.textContent = user.username;
  // li2.textContent = user.firstname + ' ' + user.lastname;
  // li3.textContent = user.email;
  // li4.textContent = user.phone;
  // li5.textContent = user.address;
  // li6.textContent = 'business: ' + user.business;
  // ul.appendChild(li1);
  // ul.appendChild(li2);
  // ul.appendChild(li3);
  // ul.appendChild(li4);
  // ul.appendChild(li5);
  // ul.appendChild(li6);
  // row.appendChild(body);
  // body.appendChild(ul);
  var accountInfo = document.getElementById('account-info');
  removeAllChild(accountInfo);
  showUserProfile(object, accountInfo);
  // accountInfo.appendChild(row);

  // My Reviews
  var accountReviews = document.getElementById('account-reviews');
  var myReviewsCount = document.getElementById('my-reviews-count');
  myReviewsCount.textContent = reviews.length;
  removeAllChild(accountReviews);
  if (typeof(reviews)==='object'){
    for (var i = 0; i < reviews.length; i++) {
      var myReviews = reviews[i].review;
      var theStore = reviews[i].store;

      var rBox = document.createElement('div');
      rBox.className = 'row reviews';
      var rStoreBox = document.createElement('div');
      rStoreBox.className = 'col-sm-3';
      var rTextBox = document.createElement('div');
      rTextBox.className = 'col-sm-9';
      var rLink = document.createElement('a');
      rLink.href='#';
      rLink.setAttribute('data-type', 'show-store');
      rLink.setAttribute('data-id', filterInt(theStore.id));
      var rStoreImg = document.createElement('img');
      rStoreImg.src = theStore.thumb;
      rStoreImg.className = 'img-responsive';
      var rStoreTitle = document.createElement('h5');
      rStoreTitle.textContent = theStore.name;
      var rField = document.createElement('div');
      rField.setAttribute('id', 'myReview-' + theStore.id + '-' + myReviews.id);

      accountReviews.appendChild(rBox);
      rBox.appendChild(rStoreBox);
      rBox.appendChild(rTextBox);
      rStoreBox.appendChild(rLink);
      rLink.appendChild(rStoreImg)
      rTextBox.appendChild(rStoreTitle);
      rTextBox.appendChild(rField);
      attachReview(theStore, myReviews, rField);
    }
  }
  else {
    accountReviews.textContent = reviews;
  }

  // My Stores
  var accountStore = document.getElementById('account-store');
  var myStoresCount = document.getElementById('my-stores-count');
  myStoresCount.textContent = store.length;
  removeAllChild(accountStore);
  if (typeof(store)==='object'){
    for (var i = 0; i < store.length; i++) {
      var storeBox = document.createElement('div');
      storeBox.className = 'row reviews';
      var storeImgBox = document.createElement('div');
      storeImgBox.className = 'col-sm-3';
      var storeInfoBox = document.createElement('div');
      storeInfoBox.className = 'col-sm-9';
      var storeLink = document.createElement('a');
      storeLink.href='#';
      storeLink.setAttribute('data-type', 'show-store');
      storeLink.setAttribute('data-id', filterInt(store[i].id));
      var storeImg = document.createElement('img');
      storeImg.src = store[i].thumb;
      storeImg.className = 'img-responsive';
      var storeTitle = document.createElement('h5');
      storeTitle.textContent = store[i].name;
      var storeEdit = document.createElement('button');
      storeEdit.textContent = 'Edit Store';
      storeEdit.setAttribute('data-type', 'show-edit-store-page');
      storeEdit.setAttribute('data-id', filterInt(store[i].id));
      storeEdit.className = 'btn btn-sm btn-default';
      accountStore.appendChild(storeBox);
      storeBox.appendChild(storeImgBox);
      storeBox.appendChild(storeInfoBox);
      storeImgBox.appendChild(storeLink);
      storeLink.appendChild(storeImg);
      storeInfoBox.appendChild(storeTitle);
      storeInfoBox.appendChild(storeEdit);
    }
    var linkNewStore = document.createElement('a');
    linkNewStore.textContent = 'Add a new store';
    linkNewStore.href='#';
    linkNewStore.setAttribute('data-type', 'show-add-store-page');
    linkNewStore.setAttribute('data-id', 'nan');
    accountStore.appendChild(linkNewStore);
  }
  else if (user.business){
    var accountStore = document.getElementById('account-store');
    var linkNewStore = document.createElement('a');
    linkNewStore.textContent = store;
    linkNewStore.href='#';
    linkNewStore.setAttribute('data-type', 'show-add-store-page');
    linkNewStore.setAttribute('data-id', 'nan');
    accountStore.appendChild(linkNewStore);
  }
  else {
    var accountStore = document.getElementById('account-store');
    accountStore.textContent = store;
  }

  // My Following
  var accountFollowing = document.getElementById('account-following');
  var myFollowingCount = document.getElementById('my-following-count');
  myFollowingCount.textContent = user.following.length;
  removeAllChild(accountFollowing);
  if (user.following.length>0) {
    var followingRow = document.createElement('div');
    followingRow.className = 'row';
    for (var i = 0; i < user.following.length; i++) {
      var followingCol = document.createElement('div');
      followingCol.className = 'col-xs-4 col-sm-3 col-md-2 padding-top-bottom';
      var followingBox = document.createElement('div');
      followingBox.className = 'user-thumb-box';
      followingBox.setAttribute('id', 'user-thumb-box-' + user.following[i]);
      followingCol.appendChild(followingBox);
      followingRow.appendChild(followingCol);
      displayUser(user.following[i], true, followingBox);
    }
    accountFollowing.appendChild(followingRow)
  } else {
    var msgFollowing = document.createElement('p');
    msgFollowing.textContent = 'You did not follow anyone.'
    accountFollowing.appendChild(msgFollowing);
  }

  // My Followers
  var accountFollowers = document.getElementById('account-followers');
  var myFollowersCount = document.getElementById('my-followers-count');
  myFollowersCount.textContent = followers.length;
  showFollowers(object ,accountFollowers);
}

function attachReview(store, review, location){
  var editReview = document.createElement('button');
  editReview.className = 'btn btn-sm btn-default pull-right';
  editReview.textContent = 'Update My Review'
  editReview.setAttribute('data-id', store.id);
  editReview.setAttribute('data-sub-id', review.id);
  editReview.setAttribute('data-type', 'edit-review');
  var rContent = document.createElement('p');
  rContent.textContent = review.description;
  var rDate = document.createElement('p');
  rDate.textContent = 'You wrote @ ' + timeStamp(review.date);
  var rRating = document.createElement('p');
  rRating.textContent = 'Your rating: '
  showRatingStars(review, rRating);
  location.appendChild(editReview);
  location.appendChild(rDate);
  location.appendChild(rRating);
  location.appendChild(rContent);
}

function getStoreData(id){
  var XHR = new XMLHttpRequest();
  XHR.open('get', '/show-store/'+id);
  XHR.send();
  XHR.onload = function(){
    var response = JSON.parse(XHR.responseText);
    showStoreDetail(response);
  }
}

function showStores(store){
  var row = document.createElement('div');
  row.className = "row with-border padding-top-bottom";
  var col4 = document.createElement('div');
  col4.className = 'col-md-4';
  var col8 = document.createElement('div');
  col8.className = 'col-md-8';

  var link = document.createElement('a');
  link.href = store.id;
  link.className = 'pull-right';
  var img = document.createElement('img');
  img.src = store.thumb;
  img.setAttribute('width', '100%');
  img.setAttribute('data-id', store.id);
  img.setAttribute('data-type', 'show-store');

  var name = document.createElement('h5');
  name.textContent = store.name;
  var phone = document.createElement('p');
  phone.textContent = store.phone;
  var address = document.createElement('p');
  address.textContent = store.address + ', ' + store.city + ', ' + store.state + ' ' + store.zipCode;
  var priceRange = document.createElement('h5');
  priceRange.textContent = 'price range: ' + store.price;
  var ratings = document.createElement('div');
  showRating(store, false, ratings);
  var description = document.createElement('p');
  description.className = 'padding-top'
  // description.textContent = store.description;

  main.appendChild(row);
  row.appendChild(col4);
  row.appendChild(col8);
  col4.appendChild(link);
  link.appendChild(img);

  col8.appendChild(name);
  col8.appendChild(phone);
  col8.appendChild(address);
  col8.appendChild(priceRange);
  col8.appendChild(ratings);
  col8.appendChild(description);
}

function showRatingStars(review, location){
  var showStars = document.createElement('img');
  showStars.src = "rating-" + review.rating + ".png";
  showStars.className = "rating-stars";
  location.appendChild(showStars);
}

function showRating(store, all,location){
  if (store.reviews.length>0){
    var reviewRating = 0;
    for (var i=0; i<store.reviews.length; i++){
      reviewRating = reviewRating + store.reviews[i].rating;
    }
    var average = reviewRating/(store.reviews.length);
    var reviewBox = document.createElement('div');
    var showReview = document.createElement('img');
    showReview.src = "rating-" + Math.floor(average) + ".png";
    showReview.className="rating-stars";
    var reviewCount = document.createTextNode(" "+store.reviews.length+" reviews");
    reviewBox.appendChild(showReview);
    reviewBox.appendChild(reviewCount);
    if (all){
      var hr = document.createElement('hr');
      reviewBox.appendChild(hr);

      for (var i=5; i>=1; i--){
        theReviewRatings = _.where(store.reviews, {rating: i});
        var ratingCount = document.createTextNode("("+theReviewRatings.length+")");
        var showRating = document.createElement('img');
        showRating.src = "rating-" + i + ".png";
        showRating.className="rating-stars";
        var displayReviews = document.createElement('div');
        displayReviews.appendChild(showRating);
        displayReviews.appendChild(ratingCount);
        reviewBox.appendChild(displayReviews);
      }
    }
    location.appendChild(reviewBox);
  } else {
    var noReview = document.createTextNode("No Rating yet");
    location.appendChild(noReview);
  }
}

function showStoreDetail(target){
  var store = target.store;
  var reviewUserlist = target.reviewers;
  var theReviews = _.sortBy(store.reviews, 'date');
  var userId = target.currentUserId;
  var writable = target.writable;
  var editable = target.editable;
  clearPage();
  storeDetail.classList.remove('hidden');
  var title = document.getElementById('store-title');
  title.textContent = store.name;

  // Store info
  var info = document.getElementById('store-info');
  removeAllChild(info);
  var box = document.createElement('div');
  box.className = 'row';
  var left = document.createElement('div');
  left.className ='col-sm-4';
  var right = document.createElement('div');
  right.className ='col-sm-8';

  var link = document.createElement('a');
  link.href = store.id;
  var img = document.createElement('img');
  img.src = store.thumb;
  img.setAttribute('width', '100%');
  img.setAttribute('data-id', store.id);
  img.setAttribute('data-type', 'show-store');
  var phone = document.createElement('h5');
  phone.textContent = store.phone;
  var address = document.createElement('h5');
  address.textContent = store.address;
  var description = document.createElement('p');
  description.textContent = store.description;

  info.appendChild(box);
  box.appendChild(left);
  box.appendChild(right);
  left.appendChild(link);
  showRating(store, true, left);
  link.appendChild(img);
  right.appendChild(phone);
  right.appendChild(address);
  right.appendChild(description);

  // Write Reviews
  removeAllChild(storeReviews);
  var writingZone = document.createElement('div');
  writingZone.className = 'writingZone';
  removeAllChild(writingZone);
  if (writable){
    reviewForm(store, 'comments...', writingZone);
  }
  else if (editable) {
    var myReview = _.where(theReviews, {userId: userId});
    var msgbox = document.createElement('div');
    writingZone.appendChild(msgbox);
    msgbox.setAttribute('id', 'myReview-' + store.id + '-' + myReview[0].id);
    attachReview(store, myReview[0], msgbox);
  }
  else  {
    var msgbox = document.createElement('p');
    msgbox.className="well";
    var msg = document.createElement('a');
    msg.href='#';
    msg.setAttribute('data-type', 'show-login-page');
    msg.setAttribute('data-id', 'nan');
    msg.textContent = 'You must login for writing review.';
    writingZone.appendChild(msgbox);
    msgbox.appendChild(msg);

  }
  storeReviews.appendChild(writingZone);

  var showedReviews = [];
  function loadMoreReviews(review, showed, num){
    review.reverse();
    var notShown = _.difference(review, showed);
    var toShow = _.first(notShown, num);
    toShow.reverse();
    showedReviews.push(toShow);
    showedReviews = _.flatten(showedReviews);
  }

  function loadReviews(theReviews, reviewUserlist, userId, store, location){
    for (var i = (theReviews.length-1); i >= 0; i--) {
      var reviewBox = document.createElement('div');
      reviewBox.className = 'row reviews';
      var reviewLeft = document.createElement('div');
      reviewLeft.className ='col-sm-2';
      reviewLeft.setAttribute('id', 'user-thumb-box-' + theReviews[i].userId);
      var reviewRight = document.createElement('div');
      reviewRight.className ='col-sm-10';

      var reviewers = _.where(reviewUserlist, {id: theReviews[i].userId});
      displayUser(theReviews[i].userId, true, reviewLeft);

      var reviewDate = document.createElement('span');
      reviewDate.textContent = timeStamp(theReviews[i].date);

      var reviewContent = document.createElement('p');
      reviewContent.textContent = theReviews[i].description;

      location.appendChild(reviewBox);
      reviewBox.appendChild(reviewLeft);
      reviewBox.appendChild(reviewRight);
      showRatingStars(theReviews[i], reviewRight);
      reviewRight.appendChild(reviewDate);
      reviewRight.appendChild(reviewContent);
      if (typeof(userId)!='undefined'){
        setTagButtons(userId, store, theReviews[i], reviewRight);
      }
    }
  }

  loadMoreReviews(theReviews, showedReviews, 10);
  loadReviews(showedReviews, reviewUserlist, userId, store, storeReviews);

  var expand = document.getElementById('expand-reviews');
  removeAllChild(expand);
  var expandButton = document.createElement('button');
  expandButton.className = 'btn btn-sm btn-default btn-block';
  expandButton.textContent = 'Load more reviews.'
  expand.appendChild(expandButton);
  expandButton.addEventListener('click', function(){
    loadMoreReviews(theReviews, showedReviews, 10);
    loadReviews(showedReviews, reviewUserlist, userId, store, storeReviews);
  })
}

function setTagButtons(userId, store, review, location){
  var XHR = new XMLHttpRequest();
  XHR.open('get', '/review-tags-count/' + store.id + '/' + review.id);
  XHR.send();
  XHR.onload = function (){
    if (XHR.stats != 404){
      var response = JSON.parse(XHR.responseText);
      var buttonUseful = document.createElement('button');
      buttonUseful.className = 'btn btn-sm btn-default';
      buttonUseful.setAttribute('name', 'useful');
      buttonUseful.setAttribute('data-id', store.id);
      buttonUseful.setAttribute('data-sub-id', review.id);
      buttonUseful.setAttribute('data-type', 'review-tags');
      buttonUseful.textContent = 'useful ' + response.useful;

      var buttonFunny = document.createElement('button');
      buttonFunny.className = 'btn btn-sm btn-default';
      buttonFunny.setAttribute('name', 'funny');
      buttonFunny.setAttribute('data-id', store.id);
      buttonFunny.setAttribute('data-sub-id', review.id);
      buttonFunny.setAttribute('data-type', 'review-tags');
      buttonFunny.textContent = 'funny ' + response.funny;

      var buttonCool = document.createElement('button');
      buttonCool.className = 'btn btn-sm btn-default';
      buttonCool.setAttribute('name', 'cool');
      buttonCool.setAttribute('data-id', store.id);
      buttonCool.setAttribute('data-sub-id', review.id);
      buttonCool.setAttribute('data-type', 'review-tags');
      buttonCool.textContent = 'cool ' + response.cool;

      if (userId){
        var check = _.findWhere(review.tags, {userId: userId});
        if (check){
          if (check.useful){
            buttonUseful.classList.add('active');
          }
          if (check.funny){
            buttonFunny.classList.add('active');
          }
          if (check.cool){
            buttonCool.classList.add('active');
          }
        }
      }

      var buttons = document.createElement('div');
      var header = document.createElement('h5');
      header.textContent = 'Was this review …?';
      buttons.appendChild(header);
      buttons.appendChild(buttonUseful);
      buttons.appendChild(buttonFunny);
      buttons.appendChild(buttonCool);
      location.appendChild(buttons);
    }
  }
}

function reviewForm(store, review, location){
  var formRow = document.createElement('div');
  formRow.className = 'row';
  var form = document.createElement('form');
  form.className = 'form';
  var leftFromRow = document.createElement('div');
  leftFromRow.className = 'col-sm-3';
  var midFromRow = document.createElement('div');
  midFromRow.className = 'col-sm-6';
  var rightFromRow = document.createElement('div');
  rightFromRow.className = 'col-sm-3';
  var starRatings = document.createElement('div');
  for (var i = 1; i <= 5; i++) {
    var starLabel = document.createElement('label');
    starLabel.className = "radio-inline";
    starLabel.textContent = i;
    var starInput = document.createElement('input');
    starInput.setAttribute('type', 'radio');
    starInput.setAttribute('name', 'star-options');
    starInput.setAttribute('value', i);
    starInput.setAttribute('required', 'required');
    starLabel.appendChild(starInput);
    starRatings.appendChild(starLabel);
  }
  var textarea = document.createElement('textarea');
  textarea.className= 'form-control';
  textarea.setAttribute('id', 'write-review-content')
  if (typeof(review.description) != 'undefined'){
    textarea.value = review.description;
  }
  var button = document.createElement('button');
  button.setAttribute('data-id', store.id);
  button.setAttribute('date-type', 'write-review');
  button.setAttribute('type', 'submit');
  button.className = 'btn btn-sm btn-default pull-right';
  if (typeof(review.description) != 'undefined'){
    button.textContent = "Update My Review";
    var buttonCancel = document.createElement('button');
    buttonCancel.className = 'btn btn-sm btn-default pull-right';
    buttonCancel.textContent = "Cancel";
    rightFromRow.appendChild(buttonCancel);
  } else {
    button.textContent = "Write My Review";
  }

  location.appendChild(formRow);
  formRow.appendChild(form);
  form.appendChild(leftFromRow);
  form.appendChild(midFromRow);
  form.appendChild(rightFromRow);
  leftFromRow.appendChild(starRatings);
  midFromRow.appendChild(textarea);
  rightFromRow.appendChild(button);
  form.addEventListener('submit', function(e){
    e.preventDefault();
    var starOptions = document.getElementsByName('star-options');
    for (var x=0; x<starOptions.length; x++){
      if (starOptions[x].checked){
        var starValue = filterInt(starOptions[x].value);
        break;
      }
    }
    var newReview = {
      id: store.id,
      content: textarea.value,
      rating: starValue
    }
    var payload = JSON.stringify(newReview);
    var XHR = new XMLHttpRequest();
    XHR.open('POST', '/new-review');
    XHR.setRequestHeader('content-type', 'application/json');
    XHR.send(payload);

    XHR.onload = function(){
      var response = JSON.parse(XHR.responseText);
      showStoreDetail(response);
    }
  })
}

function showUserProfileThumb(object, location){
  var user = object.user;
  var reviews = object.reviews;
  var followers = object.others.followers;
  var followed = object.others.followed;
  var box = document.createElement('div');
  box.className = 'user-thumb-box';
  var name = document.createElement('h5');
  name.textContent = user.firstname;
  var link = document.createElement('a');
  link.href="#";
  var thumb = document.createElement('img');
  thumb.src = user.thumb;
  thumb.className = 'img-responsive img-rounded';
  thumb.setAttribute('data-id', user.id);
  thumb.setAttribute('data-type', 'show-user');
  link.appendChild(thumb);
  var followLink = document.createElement('button');
  followLink.className = 'btn btn-xs btn-default';
  followLink.setAttribute('data-id', user.id);
  followLink.setAttribute('data-type', 'follow-user');
  followLink.setAttribute('data-value', true);
  followLink.setAttribute('saved-location', location);
  if (followed) {
    followLink.classList.add('active');
    followLink.textContent = 'Unfollow';
  } else {
    followLink.textContent = 'Follow';
  }

  var totalReviewCounts = document.createElement('p');
  totalReviewCounts.textContent = reviews.length + ' Reviews';
  var totalFollowers = document.createElement('p');
  totalFollowers.textContent = followers.length + ' Followers';
  box.appendChild(link);
  box.appendChild(name);
  box.appendChild(totalReviewCounts);
  box.appendChild(totalFollowers);
  box.appendChild(followLink);
  location.appendChild(box);
}

function showUserProfile(object, location){
  removeAllChild(location);
  var user = object.user;
  var reviews = object.reviews;
  var followers = object.others.followers;
  var followed = object.others.followed;
  var ratingCount = object.others.ratingCount;
  var tagCount = object.others.tagCount;

  var row = document.createElement('div');
  row.className = 'row';
  var left = document.createElement('div');
  left.className = 'col-md-3 text-center';
  var mid = document.createElement('div');
  mid.className = 'col-md-9';
  // Left
  var img = document.createElement('img');
  img.src = user.thumb;
  img.setAttribute('width', '100%');
  var btnGroup = document.createElement('div');
  btnGroup.className = "btn-group-vertical padding-top-bottom";
  btnGroup.setAttribute('role', 'group');
  var btnOverview = document.createElement('div');
  btnOverview.className = 'btn btn-default';
  btnOverview.textContent = 'Overview';
  var btnReviews = document.createElement('div');
  btnReviews.className = 'btn btn-default';
  btnReviews.textContent = 'Reviews';
  var btnFollowers = document.createElement('div');
  btnFollowers.className = 'btn btn-default';
  btnFollowers.textContent = 'Followers';

  btnGroup.appendChild(btnOverview);
  btnGroup.appendChild(btnReviews);
  btnGroup.appendChild(btnFollowers);
  left.appendChild(img);
  left.appendChild(btnGroup);
  // Mid
  var titleBox = document.createElement('div');
  titleBox.className ='profile-title';

  var followLink = document.createElement('button');
  if (followed){
    followLink.textContent = 'Unfollow ' + user.firstname;
  } else {
    followLink.textContent = 'Follow ' + user.firstname;
  }
  followLink.className = 'btn btn-default pull-right';
  followLink.setAttribute('data-id', user.id);
  followLink.setAttribute('data-type', 'follow-user');
  followLink.setAttribute('data-value', false);
  followLink.setAttribute('saved-location', location.getAttribute('id'));
  var name = document.createElement('h1');
  name.textContent = user.firstname + ' ' + user.lastname;

  var countlist = document.createElement('ul');
  countlist.className = 'list-inline list-unstyled profile-list';

  var list1 = document.createElement('li');
  var list1text = document.createElement('span');
  list1text.textContent = ' ' + reviews.length + ' Reviews';
  var list1icon = document.createElement('i');
  list1icon.className = "fa fa-star-o";

  var list2 = document.createElement('li');
  var list2text = document.createElement('span');
  list2text.textContent = ' ' + followers.length + ' Followers';
  var list2icon = document.createElement('i');
  list2icon.className = "fa fa-users fa";

  list1.appendChild(list1icon);
  list1.appendChild(list1text);
  list2.appendChild(list2icon);
  list2.appendChild(list2text);
  countlist.appendChild(list1);
  countlist.appendChild(list2);
  titleBox.appendChild(followLink);
  titleBox.appendChild(name);
  titleBox.appendChild(countlist);
  mid.appendChild(titleBox);

  // Mid2 stars distribution
  var body = document.createElement('div');
  mid.appendChild(body);
  row.appendChild(left);
  row.appendChild(mid);
  location.appendChild(row);

  function overview(object, location){
    removeAllChild(location);
    var user = object.user;
    var reviews = object.reviews;
    var followers = object.others.followers;
    var followed = object.others.followed;
    var ratingCount = object.others.ratingCount;
    var tagCount = object.others.tagCount;

    var ratingHeader = document.createElement('h4');
    ratingHeader.textContent = 'Rating Distribution';
    var ratingCountsBox = document.createElement('div');
    var totalRating = 0;
    for (var i=1; i<= 5; i++) {
      if (typeof(ratingCount[i]) != 'undefined'){
        totalRating = totalRating + ratingCount[i];
      }
    }
    for (var i=5; i>= 1; i--) {
      var progressTitle =document.createElement('div');
      if (typeof(ratingCount[i]) != 'undefined'){
        progressTitle.textContent = ' ' + i + ' Stars: ' + ratingCount[i];
      } else {
        progressTitle.textContent = ' ' + i + ' Stars: 0';
      }

      var progress = document.createElement('div');
      progress.className = 'progress';

      var progressBar = document.createElement('div');
      progressBar.className = 'progress-bar progress-bar-success text-left';
      progressBar.setAttribute('role', 'progressbar');
      progressBar.setAttribute('aria-valuemin', '0');
      progressBar.setAttribute('aria-valuemax', '100');
      progressBar.setAttribute('aria-valuenow', Math.floor(ratingCount[i]*100/totalRating));
      progressBar.setAttribute('style', 'width:' + Math.floor(ratingCount[i]*100/totalRating) +'%');
      // progressBar.textContent = ' ' + i + ' Stars: ' + ratingCount[i];
      progress.appendChild(progressBar);
      progressTitle.appendChild(progress);
      ratingCountsBox.appendChild(progressTitle);
    }
    // Mid3 tag counts
    tagCountArray = _.pairs(tagCount);
    var tagRow = document.createElement('div');
    tagRow.className = 'row';
    var tagHeader = document.createElement('h4');
    tagHeader.textContent = 'People vote for ' + user.firstname + "'s review:'";
    for (var i = 0; i < tagCountArray.length; i++) {
      tagCol = document.createElement('div');
      tagCol.className = 'col-md-4 text-center';
      tagBtn = document.createElement('button');
      tagBtn.className = 'btn btn-lg btn-default';
      tagBtn.textContent = tagCountArray[i][0] + ': ' + tagCountArray[i][1];
      tagCol.appendChild(tagBtn);
      tagRow.appendChild(tagCol);
    }

    var hr = document.createElement('hr');
    location.appendChild(ratingHeader);
    location.appendChild(ratingCountsBox);
    location.appendChild(hr);
    location.appendChild(tagHeader);
    location.appendChild(tagRow);
  }
  function showReviews(object, location) {
    removeAllChild(location);
    console.log(object.reviews[0]);
    var user = object.user;
    var reviews = object.reviews;
    var followers = object.others.followers;
    var followed = object.others.followed;
    var ratingCount = object.others.ratingCount;
    var tagCount = object.others.tagCount;

    var header = document.createElement('h4');
    header.textContent = 'Reviews';

    var row = document.createElement('div');
    row.className = 'row';
    for (var i = 0; i < reviews.length; i++) {
      var col = document.createElement('div');
      col.className = 'col-md-12 padding-top-bottom with-border';
      var media = document.createElement('div');
      media.className = 'media';
      var left = document.createElement('div');
      left.className = 'media-left';
      var link = document.createElement('a');
      link.href = '#';
      var img = document.createElement('img');
      img.className = 'media-object';
      img.src = reviews[i].store.thumb;
      img.setAttribute('width', '100px');
      var body = document.createElement('div');
      body.className = 'media-body';
      var heading = document.createElement('h4');
      heading.className = 'media-heading';
      heading.textContent = reviews[i].store.name;
      var address = document.createElement('p');
      address.textContent = reviews[i].store.address;

      var content1 = document.createElement('p');
      content1.className = 'padding-top';
      showRatingStars(reviews[i].review, content1);
      var dateField = document.createElement('span');
      dateField.textContent = timeStamp(reviews[i].review.date);
      content1.appendChild(dateField);
      var content2 = document.createElement('p');
      content2.textContent = reviews[i].review.description;
      var tags = document.createElement('div');

      setTagButtons(user.id, reviews[i].store, reviews[i].review, tags);

      row.appendChild(col);
      col.appendChild(media);
      media.appendChild(left);
      media.appendChild(body);
      left.appendChild(link);
      link.appendChild(img);
      body.appendChild(heading);
      body.appendChild(address);
      col.appendChild(content1);
      col.appendChild(content2);
      col.appendChild(tags);
    }
    location.appendChild(header);
    location.appendChild(row);
  }

  overview(object, body);

  btnOverview.addEventListener('click', function(event){
    event.preventDefault();
    overview(object, body);
  })
  btnReviews.addEventListener('click', function(event){
    event.preventDefault();
    showReviews(object, body);
  })
  btnFollowers.addEventListener('click', function(event){
    event.preventDefault();
    showFollowers(object, body);
  })
}

function displayUser(id, thumb, location){
  var XHR = new XMLHttpRequest();
  XHR.open('get', '/user-data/' + id);
  XHR.send()
  XHR.onload = function(){
    var response = JSON.parse(XHR.responseText);
    if (thumb) {
      showUserProfileThumb(response, location);
    } else {
      showUserProfile(response, location);
    }
  }
}

function showFollowers(object, location) {
  removeAllChild(location);
  var user = object.user;
  var reviews = object.reviews;
  var followers = object.others.followers;
  var followed = object.others.followed;
  var ratingCount = object.others.ratingCount;
  var tagCount = object.others.tagCount;
  // console.log(followers);
  // var header = document.createElement('h4');
  // header.textContent = 'Followers';
  // location.appendChild(header);

  if (followers.length>0) {
    var followingRow = document.createElement('div');
    followingRow.className = 'row';
    for (var i = 0; i < followers.length; i++) {
      var followingCol = document.createElement('div');
      followingCol.className = 'col-xs-4 col-sm-3 col-md-2 padding-top-bottom';
      var followingBox = document.createElement('div');
      followingBox.className = 'user-thumb-box';
      followingBox.setAttribute('id', 'user-thumb-box-' + followers[i].id);
      followingCol.appendChild(followingBox);
      followingRow.appendChild(followingCol);
      displayUser(followers[i].id, true, followingBox);
    }
    location.appendChild(followingRow)
  } else {
    var msg = document.createElement('p');
    msg.textContent = user.firstname +  'doesn not have any follower.'
    location.appendChild(msg);
  }

}
