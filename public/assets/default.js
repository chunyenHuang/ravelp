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
  storeDetail.classList.add('hidden');
  accountDetail.classList.add('hidden');
  // loginForm.classList.add('hidden');
  // newUserForm.classList.add('hidden');
  newStoreForm.classList.add('hidden');
  editStoreForm.classList.add('hidden');
  sortBar.classList.add('hidden');
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
      showStores(response.stores[i], main);
    }
  }
}

homepage();

// Elements
var main = document.getElementById('main');
var storeDetail = document.getElementById('store-detail');
var accountDetail = document.getElementById('account-detail');
var navbarUsername = document.getElementById('show-user-name');
var loginForm = document.getElementById('login-form');
var newUserForm = document.getElementById('user-application');
var newStoreForm = document.getElementById('store-application');
var editStoreForm = document.getElementById('store-edit');
var login = document.getElementById('login-button');
var logout = document.getElementById('logout-button');
var profile = document.getElementById('profile-button');
var sortBar = document.getElementById('sort-bar');
var menu = document.getElementById('sort-menu');

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
  // if (type==='show-login-page'){
  //   event.preventDefault();
  //   showLoginPage();
  // }
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
  // if (type==='new-user'){
  //   newUserForm.classList.remove('hidden');
  //   loginForm.classList.add('hidden');
  // }
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
      var category = document.getElementById('edit-store-category');
      var price = document.getElementById('edit-store-price');
      var description = document.getElementById('edit-store-description');
      var phone = document.getElementById('edit-store-phone');
      var address = document.getElementById('edit-store-address');
      var city = document.getElementById('edit-store-city');
      var state = document.getElementById('edit-store-state');
      var zipCode = document.getElementById('edit-store-zipCode');

      name.value = store.name;
      category.value = store.category[0];
      price.value = store.price;
      description.value = store.description;
      phone.value = store.phone;
      address.value = store.address;
      city.value = store.city;
      state.value = store.state;
      zipCode.value = store.zipCode;
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
  if (type==='search-for'){
    event.preventDefault();
    var query = event.target.getAttribute('data-content');
    var XHR = new XMLHttpRequest();
    XHR.open('get', '/search-for?category=' + query);
    XHR.send();
    XHR.onload = function(){
      var response = JSON.parse(XHR.responseText);
      showAllStores(response.stores, 'revelance', main);
    }
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
        $('#login-window').modal('hide');
        var response = JSON.parse(XHR.responseText);
        // navbar
        profile.classList.remove('hidden');
        logout.classList.remove('hidden');
        login.classList.add('hidden');
        profile.setAttribute('data-id', response.id);
        navbarUsername.textContent = 'Hello~ ' + response.firstname;

        // clearPage();
        // getCurrentUser();
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
    var city = document.getElementById('new-city');
    var state = document.getElementById('new-state');
    var zipCode = document.getElementById('new-zipCode');
    var business = document.getElementById('new-business');

    var newUser = {
      username: username.value,
      password: password.value,
      firstname: firstname.value,
      lastname: lastname.value,
      email: email.value,
      phone: phone.value,
      address: {
        address: address.value,
        city: city.value,
        state: state.value,
        zipCode: zipCode.value,
      },
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
        $('#new-user-window').modal('hide');
        getCurrentUser();
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
      showAllStores(store, 'relevance', main);
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
  if (type==='compliment-user') {
    var content = document.getElementById('compliment-content');
    var msgbox = document.getElementById('compliment-success-msg');
    var XHR = new XMLHttpRequest();
    XHR.open('get', '/compliment-user/' + id + '/' + content.value);
    XHR.send();
    XHR.onload = function(){
      if (XHR.status===200) {
        var msg = document.createElement('span');
        msg.textContent = 'Thanks for your compliment! '
        msgbox.appendChild(msg);
        var close = function(){
          $('#com-window').modal('hide');
        }
        setInterval(close, 1000);
      } else {
        var msg = document.createElement('compliment-success-msg');
        msg.textContent = 'You must login first!'
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
    clearPage();
    profile.classList.remove('hidden');
    logout.classList.remove('hidden');
    login.classList.add('hidden');
    profile.setAttribute('data-id', response.user.id);
    showUser(response);
  }
}

function showUser(object){
  clearPage();
  var user = object.user;
  var store = object.store;
  var reviews = object.reviews;
  var followers = object.others.followers;
  var compliments = object.others.compliments;

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
  // displayUser(user.id, false, accountInfo);
  showUserProfile(object, accountInfo);
  // accountInfo.appendChild(row);

  // My Reviews
  var accountReviews = document.getElementById('account-reviews');

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

  removeAllChild(accountStore);
  if (typeof(store)==='object'){
    // for (var i = 0; i < store.length; i++) {
    //   var storeBox = document.createElement('div');
    //   storeBox.className = 'row reviews';
    //   var storeImgBox = document.createElement('div');
    //   storeImgBox.className = 'col-sm-3';
    //   var storeInfoBox = document.createElement('div');
    //   storeInfoBox.className = 'col-sm-9';
    //   var storeLink = document.createElement('a');
    //   storeLink.href='#';
    //   storeLink.setAttribute('data-type', 'show-store');
    //   storeLink.setAttribute('data-id', filterInt(store[i].id));
    //   var storeImg = document.createElement('img');
    //   storeImg.src = store[i].thumb;
    //   storeImg.className = 'img-responsive';
    //   var storeTitle = document.createElement('h5');
    //   storeTitle.textContent = store[i].name;
    //   var storeEdit = document.createElement('button');
    //   storeEdit.textContent = 'Edit Store';
    //   storeEdit.setAttribute('data-type', 'show-edit-store-page');
    //   storeEdit.setAttribute('data-id', filterInt(store[i].id));
    //   storeEdit.className = 'btn btn-sm btn-default';
    //   accountStore.appendChild(storeBox);
    //   storeBox.appendChild(storeImgBox);
    //   storeBox.appendChild(storeInfoBox);
    //   storeImgBox.appendChild(storeLink);
    //   storeLink.appendChild(storeImg);
    //   storeInfoBox.appendChild(storeTitle);
    //   storeInfoBox.appendChild(storeEdit);
    // }
    // var linkNewStore = document.createElement('a');
    // linkNewStore.textContent = 'Add a new store';
    // linkNewStore.href='#';
    // linkNewStore.setAttribute('data-type', 'show-add-store-page');
    // linkNewStore.setAttribute('data-id', 'nan');
    // accountStore.appendChild(linkNewStore);
    for (var i = 0; i < store.length; i++) {
      showStores(store[i], accountStore);
    }
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

  removeAllChild(accountFollowing);

  function askforLatestReview(userId, location){
    var XHR = new XMLHttpRequest();
    XHR.open('get', '/user-data/' + userId);
    XHR.send();
    XHR.onload = function(){
      var followingRow = document.createElement('div');
      followingRow.className = 'row';
      var followingCol = document.createElement('div');
      followingCol.className = 'col-xs-6 col-sm-4 col-md-2 padding-top-bottom';
      var followingBox = document.createElement('div');
      followingBox.className = 'user-thumb-box';
      followingBox.setAttribute('id', 'user-thumb-box-' + user.following[i]);
      followingCol.appendChild(followingBox);
      followingRow.appendChild(followingCol);
      var newFeed = document.createElement('div');
      newFeed.className = 'col-xs-6 col-sm-8 col-md-10';
      var response = JSON.parse(XHR.responseText);
      response.showLatest = true;
      showUserProfileThumb(response, followingBox);
      followingCol.appendChild(followingBox);
      if (response.reviews.length >0 ){
        showReviews(response, newFeed);
        followingRow.appendChild(newFeed);
      } else {
        var emptybox = document.createElement('div');
        emptybox.className = 'row';
        var empty = document.createElement('div');
        empty.textContent = 'No Review Yet';
        emptybox.appendChild(empty);
        newFeed.appendChild(emptybox);
        followingRow.appendChild(newFeed);
      }
      location.appendChild(followingRow);
    }
  }
  if (user.following.length>0) {
    for (var i = 0; i < user.following.length; i++) {
      askforLatestReview(user.following[i], accountFollowing);
    }
  } else {
    var msgFollowing = document.createElement('p');
    msgFollowing.textContent = 'You did not follow anyone.'
    accountFollowing.appendChild(msgFollowing);
  }

  // My Followers
  var accountFollowers = document.getElementById('account-followers');

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

function showStores(store, location){
  var row = document.createElement('div');
  row.className = "row with-border padding-top-bottom";
  var col4 = document.createElement('div');
  col4.className = 'col-md-4';
  var col6 = document.createElement('div');
  col6.className = 'col-md-6';
  var col2 = document.createElement('div');
  col2.className = 'col-md-2';

  var link = document.createElement('a');
  link.href = store.id;
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
  var categoryField = document.createElement('p');
  var priceRange = document.createElement('span');
  priceRange.textContent = store.price + ' - ';
  var categoryLink = document.createElement('a');
  categoryLink.textContent = store.category[0];
  categoryLink.href = 'search-for?category=' + store.category[0];
  categoryLink.setAttribute('data-id', 0);
  categoryLink.setAttribute('data-type', 'search-for');
  categoryLink.setAttribute('data-content', store.category[0])
  categoryField.appendChild(priceRange);
  categoryField.appendChild(categoryLink);
  var ratings = document.createElement('div');
  showRating(store, false, ratings);
  var description = document.createElement('p');
  description.className = 'padding-top'
  description.textContent = store.description;

  var hours = document.createElement('ul');
  hours.className = 'list-unstyled';
  var hoursArray = _.pairs(store.hours);
  console.log(hoursArray);

  for (var i = 0; i < hoursArray.length; i++) {
    var li = document.createElement('li');
    li.textContent = hoursArray[i][0] + ' - ';
    var span = document.createElement('span');
    span.className = 'pull-right';
    span.textContent = hoursArray[i][1][0] + ':' + hoursArray[i][1][1] + ' - ' + hoursArray[i][1][2] + ':' + hoursArray[i][1][3];
    li.appendChild(span);
    hours.appendChild(li);
  }
  var XHR = new XMLHttpRequest();
  XHR.open('get', '/check-own-store/'+store.id);
  XHR.send();
  XHR.onload = function(){
    if (XHR.status==200){
      var storeEdit = document.createElement('button');
      storeEdit.textContent = 'Edit My Store';
      storeEdit.setAttribute('data-type', 'show-edit-store-page');
      storeEdit.setAttribute('data-id', store.id);
      storeEdit.className = 'btn btn-sm btn-default pull-right';
      name.appendChild(storeEdit);
    }
  }

  location.appendChild(row);
  row.appendChild(col4);
  row.appendChild(col6);
  row.appendChild(col2);
  col4.appendChild(link);
  link.appendChild(img);

  col6.appendChild(name);
  col6.appendChild(phone);
  col6.appendChild(address);
  col6.appendChild(categoryField);
  col6.appendChild(ratings);
  col6.appendChild(description);
  col2.appendChild(hours);
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

  // var storeImg = document.getElementById('store-img');
  var storeInfo = document.getElementById('store-info');
  var storeReviewsStat = document.getElementById('store-review-statistic');
  var storeReviews = document.getElementById('store-reviews');

  clearPage();
  storeDetail.classList.remove('hidden');
  // removeAllChild(storeImg);
  removeAllChild(storeInfo);
  removeAllChild(storeReviewsStat);
  removeAllChild(storeReviews);
  showStores(store, storeInfo);
  // Store info
  // storeImg.src = store.thumb;
  // storeImg.setAttribute('width', '100%');
  // var name = document.createElement('h3');
  // name.textContent = store.name;
  // var phone = document.createElement('h5');
  // phone.textContent = store.phone;
  // var address = document.createElement('h5');
  // address.textContent = store.address + ', ' + store.city + ', ' + store.state + ' ' + store.zipCode;
  // var categoryField = document.createElement('p');
  // var priceRange = document.createElement('span');
  // priceRange.textContent = store.price + ' - ';
  // var categoryLink = document.createElement('a');
  // categoryLink.textContent = store.category[0];
  // categoryLink.href = 'search-for?category=' + store.category[0];
  // categoryLink.setAttribute('data-id', 0);
  // categoryLink.setAttribute('data-type', 'search-for');
  // categoryLink.setAttribute('data-content', store.category[0])
  // categoryField.appendChild(priceRange);
  // categoryField.appendChild(categoryLink);
  // var ratings = document.createElement('div');
  // showRating(store, false, ratings);
  // var description = document.createElement('p');
  // description.className = 'padding-top';
  // description.textContent = store.description;
  //
  // storeInfo.appendChild(name);
  // storeInfo.appendChild(phone);
  // storeInfo.appendChild(address);
  // storeInfo.appendChild(categoryField);
  // storeInfo.appendChild(description);

  showRating(store, true, storeReviewsStat);

  // Write Reviews
  removeAllChild(storeReviews);
  writeReview(store, storeReviews);
  // if (writable){
  //   reviewForm(store, 'comments...', writingZone);
  // }
  // else if (editable) {
  //   var myReview = _.where(theReviews, {userId: userId});
  //   var msgbox = document.createElement('div');
  //   writingZone.appendChild(msgbox);
  //   msgbox.setAttribute('id', 'myReview-' + store.id + '-' + myReview[0].id);
  //   attachReview(store, myReview[0], msgbox);
  // }
  // else  {
  //   var msgbox = document.createElement('p');
  //   msgbox.className="well";
  //   var msg = document.createElement('a');
  //   msg.href='#';
  //   msg.setAttribute('data-type', 'show-login-page');
  //   msg.setAttribute('data-id', 'nan');
  //   msg.textContent = 'You must login for writing review.';
  //   writingZone.appendChild(msgbox);
  //   msgbox.appendChild(msg);
  //
  // }
  // storeReviews.appendChild(writingZone);

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
      setTagButtons(userId, store, theReviews[i], reviewRight);
    }
  }

  loadMoreReviews(theReviews, showedReviews, 10);
  loadReviews(showedReviews, reviewUserlist, userId, store, storeReviews);

  var expand = document.getElementById('expand-reviews');
  removeAllChild(expand);
  var expandButton = document.createElement('button');
  expandButton.className = 'btn btn-sm btn-default btn-block margin-top-bottom';
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
      rating: starValue,
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
  var compliments = object.others.compliments;
  var complimented = object.others.complimented;

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
  var headrow = document.createElement('div');
  headrow.className = 'row';
  var headcol1 = document.createElement('div');
  headcol1.className = 'col-sm-8 col-md-9';
  var headcol2 = document.createElement('div');
  headcol2.className = 'col-sm-4 col-md-3';

  var titleBox = document.createElement('div');
  titleBox.className ='profile-title';

  var followLink = document.createElement('button');
  if (followed){
    followLink.textContent = 'Unfollow ' + user.firstname;
  } else {
    followLink.textContent = 'Follow ' + user.firstname;
  }
  followLink.className = 'btn btn-default btn-block pull-right';
  followLink.setAttribute('data-id', user.id);
  followLink.setAttribute('data-type', 'follow-user');
  followLink.setAttribute('data-value', false);
  followLink.setAttribute('saved-location', location.getAttribute('id'));

  var comIcon = document.createElement('i');
  comIcon.className = "fa fa-angellist fa-lg";
  var complimentLink = document.createElement('button');
  if (complimented){
    complimentLink.textContent = 'UnCompliment ';
  } else {
    complimentLink.textContent = 'Compliment ';
  }
  complimentLink.appendChild(comIcon);
  complimentLink.className = 'btn btn-default btn-block pull-right';
  complimentLink.setAttribute('type', 'button');
  complimentLink.setAttribute('data-toggle', 'modal');
  complimentLink.setAttribute('data-target', '#com-window');
  complimentLink.setAttribute('data-id', user.id);
  complimentLink.setAttribute('data-name', user.firstname);
  var form = document.getElementById('compliment-form');
  form.setAttribute('data-id', user.id);
  form.setAttribute('data-type', 'compliment-user');
  var span = document.getElementById('receiver-name');
  span.textContent = user.firstname;

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

  var list3 = document.createElement('li');
  var list3text = document.createElement('span');
  list3text.textContent = ' ' + compliments.length + ' Compliments';
  var list3icon = document.createElement('i');
  list3icon.className = "fa fa-angellist";

  list1.appendChild(list1icon);
  list1.appendChild(list1text);
  list2.appendChild(list2icon);
  list2.appendChild(list2text);
  list3.appendChild(list3icon);
  list3.appendChild(list3text);
  countlist.appendChild(list1);
  countlist.appendChild(list2);
  countlist.appendChild(list3);
  titleBox.appendChild(name);
  titleBox.appendChild(countlist);
  headcol1.appendChild(titleBox);
  headcol2.appendChild(followLink);
  headcol2.appendChild(complimentLink);
  headrow.appendChild(headcol1);
  headrow.appendChild(headcol2);
  mid.appendChild(headrow);

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
      followingCol.className = 'col-xs-6 col-sm-4 col-md-2 padding-top-bottom';
      var followingBox = document.createElement('div');
      followingBox.className = 'user-thumb-box';
      followingBox.setAttribute('id', 'user-thumb-box-' + followers[i].id);
      displayUser(followers[i].id, true, followingBox);

      followingCol.appendChild(followingBox);
      followingRow.appendChild(followingCol);
    }
    location.appendChild(followingRow)
  } else {
    var msg = document.createElement('p');
    msg.textContent = user.firstname +  'doesn not have any follower.'
    location.appendChild(msg);
  }
}

function writeReview(store, location){
  var writingZone = document.createElement('div');
  writingZone.className = 'writingZone';
  removeAllChild(writingZone);
  var XHR = new XMLHttpRequest();
  XHR.open('get', '/check-review-post/' + store.id);
  XHR.send()
  XHR.onload = function(){
    if (XHR.status === 404){
      var msgbox = document.createElement('p');
      msgbox.className="well";
      var msg = document.createElement('a');
      msg.href='#';
      msg.setAttribute('data-target', '#login-window');
      msg.setAttribute('data-toggle', 'modal');
      msg.textContent = 'Login and Write Your Review.';
      writingZone.appendChild(msgbox);
      msgbox.appendChild(msg);
    } else if (XHR.status === 205){
      reviewForm(store, 'comments...', writingZone);
    } else {
      var response = JSON.parse(XHR.responseText);
      var msgbox = document.createElement('div');
      msgbox.setAttribute('id', 'myReview-' + store.id + '-' + response.review.id);
      attachReview(store, response.review, msgbox);
      writingZone.appendChild(msgbox);
    }
  }
  location.appendChild(writingZone);
}

function checkCurrentUser(){
  var XHR = new XMLHttpRequest();
  XHR.open('get', '/check-current-user');
  XHR.send();
  XHR.onload = function(){
    if (XHR.status === 200){
      var response = JSON.parse(XHR.responseText);
      var currentUserId = response.id;
      return currentUserId;
    }
  }
}

function showAllStores(array, value, location){
  clearPage();
  sortBar.classList.remove('hidden');
  removeAllChild(menu);
  var sortResult = document.createElement('form');
  sortResult.className = "form form-inline";
  sortResult.textContent ="sort by: ";
  var sortResultOptions = document.createElement('select');
  sortResultOptions.className="form-control input-sm";
  var option1 = document.createElement('option');
  option1.textContent = "Relevance";
  option1.value ="relevance";
  var option2 = document.createElement('option');
  option2.textContent = "Price: Low to High";
  option2.value = "priceLow";
  var option3 = document.createElement('option');
  option3.textContent = "Category";
  option3.value = "category";
  var option4 = document.createElement('option');
  option4.textContent = "Most Review";
  option4.value = "mostReview";
  var option5 = document.createElement('option');
  option5.textContent = "Average Rating";
  option5.value = "average";
  sortResultOptions.appendChild(option1);
  sortResultOptions.appendChild(option2);
  sortResultOptions.appendChild(option3);
  sortResultOptions.appendChild(option4);
  sortResultOptions.appendChild(option5);
  sortResultOptions.value = value;
  sortResult.appendChild(sortResultOptions);
  menu.appendChild(sortResult);
  for (var i=0; i<array.length; i++){
    showStores(array[i], location);
  }

  sortResultOptions.addEventListener('change', function(){
    var value = event.target.value;
    if (value === 'category') {
      array = _.sortBy(array, 'category');
    }
    if (value === 'priceLow') {
      array = _.sortBy(array, 'price');
    }
    if (value === 'mostReview') {
      var counts = [];
      for (var i = 0; i < array.length; i++) {
        counts.push({store: array[i], reviews: array[i].reviews.length});
      }
      counts = _.sortBy(counts, 'reviews').reverse();
      array = [];
      for (var i = 0; i < counts.length; i++) {
        array.push(counts[i].store);
      }
    }
    if (value === 'average') {
      var average = [];
      for (var i = 0; i < array.length; i++) {
        var rating = 0;
        for (var x = 0; x < array[i].reviews.length; x++) {
          rating = rating + array[i].reviews[x].rating;
        }
        average.push({store: array[i], average: (rating/array[i].reviews.length)});
      }
      average = _.sortBy(average, 'average').reverse();
      array = [];
      for (var i = 0; i < average.length; i++) {
        array.push(average[i].store);
      }
    }
    showAllStores(array, value, location);
  })

}

function showReviews(object, location) {
  removeAllChild(location);
  var user = object.user;
  var reviews = object.reviews;//{store: store, review: review}
  var followers = object.others.followers;
  var followed = object.others.followed;
  var ratingCount = object.others.ratingCount;
  var tagCount = object.others.tagCount;
  var showLatest = object.showLatest;
  var header = document.createElement('h4');
  // header.textContent = 'Reviews';

  var row = document.createElement('div');
  row.className = 'row';
  if (showLatest===true){
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
    img.src = reviews[0].store.thumb;
    img.setAttribute('width', '100px');
    var body = document.createElement('div');
    body.className = 'media-body';
    var heading = document.createElement('h4');
    heading.className = 'media-heading';
    heading.textContent = reviews[0].store.name;
    var address = document.createElement('p');
    address.textContent = reviews[0].store.address;

    var content1 = document.createElement('p');
    content1.className = 'padding-top';
    showRatingStars(reviews[0].review, content1);
    var dateField = document.createElement('span');
    dateField.textContent = timeStamp(reviews[0].review.date);
    content1.appendChild(dateField);
    var content2 = document.createElement('p');
    content2.textContent = reviews[0].review.description;
    var tags = document.createElement('div');

    setTagButtons(user.id, reviews[0].store, reviews[0].review, tags);

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
  else {
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
  }
  location.appendChild(header);
  location.appendChild(row);
}
