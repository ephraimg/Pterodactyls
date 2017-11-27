/**
 * @fileOverview Uses faker package to populate databases with fake posts, users, and locations.
 */

const faker = require('faker');
var Promise = require('bluebird');
// var mysql = require('mysql2');
var orm = require('./orm.js');
var mongo = require('./mongo.js');

/* generate data for the sql database using faker */

let mongoIds = [];

// create the database and tables
orm.db.sync()
  .then(() => orm.Users.sync())
  .then(() => orm.Locations.sync())
  .then(() => orm.Sessions.sync())
  .then(() => orm.Posts.sync())
  .then(() => {
    return mongo.Post.remove({}).exec();
  })
  .catch(err => console.log('Error syncing in saveFakeData.js', err))
  .then(() => {
    let fakePosts = [];
    for (let i = 0; i < 15; i++) {
      let fakePost = { text: faker.lorem.paragraphs(5) };
      fakePost = new mongo.Post(fakePost);
      fakePosts.push(fakePost.save());
    }
    return Promise.all(fakePosts);
  })
  .then(saved => {
    return mongo.Post.find({}, '_id')
      .lean();
  })
  .then(idRecords => {
    mongoIds = idRecords.map(rec => rec._id.toString());
    saveSQLUsers();
  })
  .catch(err => {
    console.log('Error saving SQL', err);
  });


// save new fake records; using func declarations to hoist


/** 
  * This function populates the mySQL database with 15 fake users.
  * @func saveSQLUsers
*/
function saveSQLUsers() { 
  var users = [];
  for (var i = 0; i < 15; i++) {
    let userEntry = {
      username: faker.internet.userName(),
      email: faker.internet.email(),
      about_me: faker.lorem.paragraph(), // eslint-disable-line camelcase
      pic: faker.image.avatar()
    };
    users.push(orm.Users.create(userEntry));
  }
  Promise.all(users)
    .then(users => saveSQLLocations())
    .catch(err => console.log('Error saving locations: ', err));
}


/** 
  * This function populates the mySQL database with 15 fake locations.
  * @func saveSQLLocations
*/
function saveSQLLocations() { 
  var locations = [];
  for (var i = 0; i < 15; i++) {
    let locationEntry = {
      location: faker.address.city() + ', ' + faker.address.country()
    };
    locations.push(orm.Locations.create(locationEntry));
  }
  Promise.all(locations)
    .then(locations => saveSQLPosts())
    .catch(err => console.log('Error saving locations: ', err));
}


/** 
  * This function populates the mySQL database with 15 fake posts.
  * @func saveSQLPosts
*/
function saveSQLPosts() { 
  var posts = [];
  for (var i = 0; i < 15; i++) {
    let mongoId = mongoIds[i];
    let postsEntry = {
      id_users: 1 + Math.floor(Math.random() * 15), // eslint-disable-line camelcase
      title: faker.lorem.words(6),
      subtitle: faker.lorem.sentence(),
      id_mongo_text: mongoId, // eslint-disable-line camelcase
      id_locations: 1 + Math.floor(Math.random() * 15), // eslint-disable-line camelcase
      pics: faker.image.image()
    };
    posts.push(orm.Posts.create(postsEntry));
  }
  Promise.all(posts)
    .then(posts => console.log('Saved all fake posts...'))
    .catch(err => console.log(err));
}
