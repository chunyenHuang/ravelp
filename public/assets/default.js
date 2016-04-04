function filterInt(value) {
  if (/^(\-|\+)?([0-9]+|Infinity)$/.test(value)){
    return Number(value);
  }
  return NaN;
}

function removeAllChild(nodeName){
  while (nodeName.firstChild) {
      nodeName.removeChild(nodeName.firstChild);
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
      toggleClass(event.target, 'active');
      event.target.textContent = event.target.getAttribute('name');
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
    getUserData();
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
        homepage();
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
        getUserData();
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

function getUserData(){
  var XHR = new XMLHttpRequest();
  XHR.open('get', '/get-user');
  XHR.send();
  XHR.onload = function(){
    var response = JSON.parse(XHR.responseText);
    showUser(response.user, response.store, response.reviews);
  }
}

function showUser(user, store, reviews){
  clearPage();

  // My Info
  accountDetail.classList.remove('hidden');
  var heading = document.getElementById('account-title');
  heading.textContent = user.firstname + ' ' + user.lastname;
  var row = document.createElement('div');
  row.className = "row";
  var body = document.createElement('div');
  body.className = 'col-md-12';
  var ul = document.createElement('ul');
  var li1 = document.createElement('li');
  var li2 = document.createElement('li');
  var li3 = document.createElement('li');
  var li4 = document.createElement('li');
  var li5 = document.createElement('li');
  var li6 = document.createElement('li');
  li1.textContent = user.username;
  li2.textContent = user.firstname + ' ' + user.lastname;
  li3.textContent = user.email;
  li4.textContent = user.phone;
  li5.textContent = user.address;
  li6.textContent = 'business: ' + user.business;
  ul.appendChild(li1);
  ul.appendChild(li2);
  ul.appendChild(li3);
  ul.appendChild(li4);
  ul.appendChild(li5);
  ul.appendChild(li6);
  row.appendChild(body);
  body.appendChild(ul);
  var accountInfo = document.getElementById('account-info');
  removeAllChild(accountInfo);
  accountInfo.appendChild(row);

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
      var rStoreImg = document.createElement('img');
      rStoreImg.src = theStore.thumb;
      rStoreImg.className = 'img-responsive';
      var rStoreTitle = document.createElement('h5');
      rStoreTitle.textContent = theStore.name;
      var rContent = document.createElement('p');
      rContent.textContent = myReviews.description;
      var rDate = document.createElement('p');
      rDate.textContent = 'You wrote @ ' + myReviews.date;
      var rRating = document.createElement('p');
      rRating.textContent = 'Your rating: '
      showRatingStars(myReviews, rRating);

      accountReviews.appendChild(rBox);
      rBox.appendChild(rStoreBox);
      rBox.appendChild(rTextBox);
      rStoreBox.appendChild(rStoreImg);
      rTextBox.appendChild(rStoreTitle);
      rTextBox.appendChild(rDate);
      rTextBox.appendChild(rRating);
      rTextBox.appendChild(rContent);
    }
  }
  else {
    accountReviews.textContent = reviews;
  }

  // My Stores
  var accountStore = document.getElementById('account-store');
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
  var panel = document.createElement('div');
  panel.className = "panel panel-default";
  var heading = document.createElement('div');
  heading.className = 'panel-heading';
  heading.textContent = store.name;
  var body = document.createElement('div');
  body.className = 'panel-body';
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

  main.appendChild(panel);
  panel.appendChild(heading);
  panel.appendChild(body);
  body.appendChild(box);
  box.appendChild(left);
  box.appendChild(right);
  left.appendChild(link);
  showRating(store, left);
  link.appendChild(img);
  right.appendChild(phone);
  right.appendChild(address);
  right.appendChild(description);
}

function showRatingStars(target, location){
  var showStars = document.createElement('img');
  showStars.src = "rating-" + target.rating + ".png";
  showStars.className = "rating-stars";
  location.appendChild(showStars);
}

function showRating(store, location){
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
    var reviewCount = document.createTextNode("("+store.reviews.length+")");
    reviewBox.appendChild(showReview);
    reviewBox.appendChild(reviewCount);
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
    location.appendChild(reviewBox);
  } else {
    var noReview = document.createTextNode("No Rating yet");
    location.appendChild(noReview);
  }
}

function showStoreDetail(target){
  var store = target.store;
  console.log(store);
  var reviewUserlist = target.reviewers;
  var writable = target.writable;
  var editable = target.editable;
  var userId = target.currentUserId;
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
  showRating(store, left);
  link.appendChild(img);
  right.appendChild(phone);
  right.appendChild(address);
  right.appendChild(description);

  // Write Reviews
  removeAllChild(storeReviews);
  var writingZone = document.createElement('div');
  removeAllChild(writingZone);
  if (writable){
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
    var button = document.createElement('button');
    button.setAttribute('data-id', store.id);
    button.setAttribute('date-type', 'write-review');
    button.setAttribute('type', 'submit');
    button.className = 'btn btn-default pull-right';
    button.textContent = "Write My Review";
    writingZone.appendChild(formRow);
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
  else if (editable) {
    var msgbox = document.createElement('p');
    msgbox.className="well";
    var msg = document.createElement('a');
    msg.href='login';
    msg.textContent = 'You can edit';
    writingZone.appendChild(msgbox);
    msgbox.appendChild(msg);
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

  var theReviews = _.sortBy(store.reviews, 'date');
  var showedReviews = [];
  function loadMoreReviews(review, showed, num){
    review.reverse();
    var notShown = _.difference(review, showed);
    var toShow = _.first(notShown, num);
    toShow.reverse();
    showedReviews.push(toShow);
    showedReviews = _.flatten(showedReviews);
  }

  function loadReviews(theReviews, reviewUserlist, userId, store){
    for (var i = (theReviews.length-1); i >= 0; i--) {
      var reviewBox = document.createElement('div');
      reviewBox.className = 'row reviews';
      var reviewLeft = document.createElement('div');
      reviewLeft.className ='col-sm-2';
      var reviewRight = document.createElement('div');
      reviewRight.className ='col-sm-10';
      var reviewUser = document.createElement('h5');
      var reviewers = _.where(reviewUserlist, {id: theReviews[i].userId});
      reviewUser.textContent = reviewers[0].name;

      var reviewDate = document.createElement('span');
      reviewDate.textContent = theReviews[i].date;

      var reviewContent = document.createElement('p');
      reviewContent.textContent = theReviews[i].description;

      storeReviews.appendChild(reviewBox);
      reviewBox.appendChild(reviewLeft);
      reviewBox.appendChild(reviewRight);
      reviewLeft.appendChild(reviewUser);
      showRatingStars(theReviews[i], reviewRight);
      reviewRight.appendChild(reviewDate);
      reviewRight.appendChild(reviewContent);
      if (typeof(userId)!='undefined'){
        setTagButtons(userId, store, theReviews[i], reviewRight);
      }
    }
  }
  loadMoreReviews(theReviews, showedReviews, 10);
  loadReviews(showedReviews, reviewUserlist, userId, store);

  var expand = document.getElementById('expand-reviews');
  var expandButton = document.createElement('button');
  expandButton.className = 'btn btn-sm btn-default btn-block';
  expandButton.textContent = 'Load more reviews.'
  expand.appendChild(expandButton);
  expandButton.addEventListener('click', function(){
    loadMoreReviews(theReviews, showedReviews, 10);
    loadReviews(showedReviews, reviewUserlist, userId, store);
  })
}

function setTagButtons(userId, store, reviews, location){
  var buttonUseful = document.createElement('button');
  buttonUseful.className = 'btn btn-sm btn-success';
  buttonUseful.setAttribute('name', 'useful');
  buttonUseful.setAttribute('data-id', store.id);
  buttonUseful.setAttribute('data-sub-id', reviews.id);
  buttonUseful.setAttribute('data-type', 'review-tags');
  buttonUseful.textContent = 'useful';

  var buttonFunny = document.createElement('button');
  buttonFunny.className = 'btn btn-sm btn-warning';
  buttonFunny.setAttribute('name', 'funny');
  buttonFunny.setAttribute('data-id', store.id);
  buttonFunny.setAttribute('data-sub-id', reviews.id);
  buttonFunny.setAttribute('data-type', 'review-tags');
  buttonFunny.textContent = 'funny';

  var buttonCool = document.createElement('button');
  buttonCool.className = 'btn btn-sm btn-primary';
  buttonCool.setAttribute('name', 'cool');
  buttonCool.setAttribute('data-id', store.id);
  buttonCool.setAttribute('data-sub-id', reviews.id);
  buttonCool.setAttribute('data-type', 'review-tags');
  buttonCool.textContent = 'cool';

  if (userId){
    var check = _.findWhere(reviews.tags, {userId: userId});
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
  buttons.appendChild(buttonUseful);
  buttons.appendChild(buttonFunny);
  buttons.appendChild(buttonCool);
  location.appendChild(buttons);
}
