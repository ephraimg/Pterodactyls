/**
 * @fileOverview Uses faker package to populate databases with fake posts, users, and locations.
 */

var Promise = require('bluebird');
const faker = require('faker');
const mysql = require('mysql');
const orm = require('./orm.js');
const mongo = require('./mongo.js');

// Use this to allow access by save functions
let mongoIds = [];

/* generate data for the sql database using faker */
const seed = () => {
  return createSQLdb()
    .then(() => orm.Users.sync({force: true}))
    .then(() => orm.Locations.sync({force: true}))
    // .then(() => orm.Sessions.sync())
    .then(() => orm.Posts.sync({force: true}))
    .then(() => mongo.Post.remove({}).exec())
    .catch(err => console.log('Error seeding data', err))
    .then(() => {
      let fakePosts = [];
      for (let i = 0; i < 15; i++) {
        let fakePost = { text: faker.lorem.paragraphs(5) };
        fakePost = new mongo.Post(fakePost);
        fakePosts.push(fakePost.save());
      }
      return Promise.all(fakePosts);
    })
    .then(saved => mongo.Post.find({}, '_id').lean())
    .then(idRecords => {
      mongoIds = idRecords.map(rec => rec._id.toString());
      return saveSQLUsers();
    })
    .catch(err => {
      console.log('Error saving SQL', err);
    });
};

/**
 * @fileOverview Connects server to mySQL, creates a kuyikSQL database, and uses that database.
 */

function createSQLdb() {
  let connection;
  if (process.env.LOCAL === '1') {
    connection = mysql.createConnection({
      user: process.env.SQL_USERNAME,
      password: process.env.SQL_PASSWORD
    }); 
  } else {
    connection = mysql.createConnection(process.env.CLEARDB_DATABASE_URL);
  }
  const db = Promise.promisifyAll(connection);
  return connection.connectAsync()
    .tap(() => console.log('mySQL is now connected'))
    .then(() => db.queryAsync('CREATE DATABASE IF NOT EXISTS kuyikSQL'))
    .catch(err => {}) // ignore error caused when db already exists
    .then(() => db.queryAsync('USE kuyikSQL'))
    .tap(() => console.log('mySQL is using the kuyikSQL database'));
}


/** 
  * This function populates the mySQL database with 15 fake users.
  * @func saveSQLUsers
*/
function saveSQLUsers() { 
  var users = [];
  for (var i = 0; i < 15; i++) {
    let userEntry = {
      id: i + 1,
      username: faker.internet.userName(),
      email: faker.internet.email(),
      about_me: faker.lorem.paragraph(), // eslint-disable-line camelcase
      pic: faker.image.avatar()
    };
    users.push(orm.Users.create(userEntry));
  }
  return Promise.all(users)
    .tap(users => console.log(JSON.stringify(users, null, 2)))
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
      id: i + 1,
      location: faker.address.city() + ', ' + faker.address.country()
    };
    locations.push(orm.Locations.create(locationEntry));
  }
  return Promise.all(locations)
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
      id: i + 1,
      id_users: 1 + Math.floor(Math.random() * 15), // eslint-disable-line camelcase
      title: faker.lorem.words(6),
      subtitle: faker.lorem.sentence(),
      id_mongo_text: mongoId, // eslint-disable-line camelcase
      id_locations: 1 + Math.floor(Math.random() * 15), // eslint-disable-line camelcase
      pics: faker.image.image()
    };
    posts.push(orm.Posts.create(postsEntry));
  }
  return Promise.all(posts)
    .tap(posts => console.log('Saved all fake posts...'))
    .catch(err => console.log(err));
}

module.exports.seed = seed;
