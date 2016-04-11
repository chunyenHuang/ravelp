
function timeStamp(date) {
  var data = new Date(date);
  var showDate = [ date.getMonth() + 1, date.getDate(), date.getFullYear() ];
  return showDate.join("/");
}

function pickDate(){
  var randomYear = Math.floor(Math.random() * (8)) + 2008;
  var randomMonth = Math.floor(Math.random() * (11));
  var randomDay = Math.floor(Math.random() * (29)) + 1;
  var randomDate = new Date(randomYear, randomMonth, randomDay);
  return randomDate;
}
console.log(pickDate());
console.log(timeStamp(pickDate()));
//
