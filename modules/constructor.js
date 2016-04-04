function constructor() {
  function Store(id, userId, name, description, phone, address, thumb) {
    this.id = id;
    this.userId = userId;
    this.name = name;
    this.description = description;
    this.phone = phone;
    this.address = address;
    this.thumb = thumb;
    this.tags = [];
    this.reviews = [];
  }
  function Review(id, userId, description, rating, date, tags, comments) {
    this.id = id;
    this.userId = userId;
    this.description = description;
    this.rating = rating;
    this.date = date;
    this.tags = [];
    this.commemts = [];
  }
  function User(id, username, password, firstname, lastname, email, phone, address, business) {
    this.id = id;
    this.username = username;
    this.password = password;
    this.firstname = firstname;
    this.lastname = lastname;
    this.email = email;
    this.phone = phone;
    this.business = business;
  }
  return {
    Store: Store,
    Review: Review,
    User: User,
  }
}

module.exports = constructor();
