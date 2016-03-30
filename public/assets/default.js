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

function clearPage(){
  removeAllChild(main);
  loginForm.classList.add('hidden');
  newUserForm.classList.add('hidden');
}

// Elements
var main = document.getElementById('main');
var loginForm = document.getElementById('login-form');
var newUserForm = document.getElementById('user-application');
var login = document.getElementById('login-button');
var logout = document.getElementById('logout-button');
var profile = document.getElementById('profile-button');

// EventListeners
document.body.addEventListener('click', function(event){
  if (event.target.hasAttribute('data-type')){
    var id = filterInt(event.target.getAttribute('data-id'));
    var type = event.target.getAttribute('data-type');
  } else {
    var id = filterInt(event.target.parentNode.getAttribute('data-id'));
    var type = event.target.parentNode.getAttribute('data-type');
  }

  if (type==='new-user'){
    newUserForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
  }
  if (type==='logout'){
    var XHR = new XMLHttpRequest();
    XHR.open('get','/logout');
    clearPage();
    login.classList.remove('hidden');
    logout.classList.add('hidden');
    profile.classList.add('hidden');
  }
  if (type==='login'){
    var XHR = new XMLHttpRequest();
    XHR.open('get','/login');
    clearPage();
    loginForm.classList.remove('hidden');
  }
  if (type==='profile'){
    var XHR = new XMLHttpRequest();
    XHR.open('get','/login');
    XHR.send();
    XHR.onload = function(){
      console.log(XHR.responseText);
      var response = JSON.parse(XHR.responseText);
      showUser(response);
    }
  }
})

document.body.addEventListener('submit', function(e){
  e.preventDefault();
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
    console.log(loginUser);
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
    console.log(newUser);
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
      console.log(XHR.responseText);
    }
  }

})

function showUser(user){
  clearPage();
  var panel = document.createElement('div');
  panel.className = "panel panel-default";
  var heading = document.createElement('div');
  heading.className = 'panel-heading';
  heading.textContent = user.firstname + ' ' + user.lastname;
  var body = document.createElement('div');
  body.className = 'panel-body';
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

  main.appendChild(panel);
  panel.appendChild(heading);
  panel.appendChild(body);
  body.appendChild(ul);
}
