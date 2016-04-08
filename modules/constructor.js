function constructor() {
  function Store(id, userId, name, category, price, hours,
                 description, phone, address, thumb) {
    //address = {};
    this.id = id;
    this.userId = userId;
    this.name = name;
    this.category = category;
    this.price = price;
    this.hours = hours;
    this.description = description;
    this.phone = phone;
    this.address = address.address;
    this.city = address.city;
    this.state = address.state;
    this.zipCode = address.zipCode;
    this.thumb = thumb;
    this.reviews = [];
  }
  function Review(id, userId, description, rating, date, tags, comments) {
    this.id = id;
    this.userId = userId;
    this.description = description;
    this.rating = rating;
    this.date = date;
    this.tags = tags;
    this.commemts = [];
  }
  function User(id, username, password, firstname, lastname, thumb,
                email, phone, address, business, following) {
    this.id = id;
    this.username = username;
    this.password = password;
    this.firstname = firstname;
    this.lastname = lastname;
    this.thumb = thumb;
    this.email = email;
    this.phone = phone;
    this.address = address;
    this.business = business;
    this.following = following;
  }
  function Tags(id, userId, useful, funny, cool){
    this.id = id;
    this.userId = userId;
    this.useful = useful;
    this.funny = funny;
    this.cool = cool;
  }
  function Session(token, id){
    this.token = token;
    this.id = id;
  }
  function Compliment(giverId, receiverId, message) {
    this.giver = giverId;
    this.receiver = receiverId;
    this.message = message;
  }
  return {
    Store: Store,
    Review: Review,
    User: User,
    Session: Session,
    Tags: Tags,
    Compliment: Compliment,
  }
}

module.exports = constructor();
