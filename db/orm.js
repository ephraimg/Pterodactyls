/**
 * @fileOverview Connects Sequelize to mySQL database, creates tables, and exports models and helper functions.
 */

require('dotenv').config();
const mongo = require('./mongo.js');
const Sequelize = require('sequelize');


// set up the connection
let options;
if (process.env.LOCAL === '0') {
  options = [ process.env.JAWSDB_URL, {} ];
} else {
  options = [
    'kuyikSQL', 
    process.env.SQL_USERNAME,
    process.env.SQL_PASSWORD,
    { host: process.env.SQL_HOST, dialect: 'mysql' }
  ];
}
const orm = new Sequelize(...options);

// check if the connection is working
orm.authenticate()
  .then(() => {
    console.log('Sequelize is connected to the kuyikSQL database');
  })
  .catch(err => {
    console.error('Unable to connect to the kuyikSQL database:', err);
  });


// define our tables (foreign keys come later)
const Users = orm.define('Users', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: Sequelize.STRING,
  email: Sequelize.STRING,
  about_me: Sequelize.TEXT, // eslint-disable-line camelcase
  pic: Sequelize.STRING,
  // below fields used for auth
  google_name: Sequelize.STRING, // eslint-disable-line camelcase
  google_id: Sequelize.STRING, // eslint-disable-line camelcase
  google_avatar: Sequelize.STRING // eslint-disable-line camelcase
});

// Not in use as of 1/1/2018
const Sessions = orm.define('Sessions', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  hash: Sequelize.STRING
});

const Locations = orm.define('Locations', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  location: Sequelize.STRING
});

const Posts = orm.define('Posts', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: Sequelize.STRING,
  subtitle: Sequelize.STRING,
  pics: Sequelize.STRING,
  id_mongo_text: Sequelize.STRING // eslint-disable-line camelcase
});

// create foreign keys in our tables via sequelize "associations"
Posts.belongsTo(Users, {
  foreignKey: 'id_users'
});

// Not in use as of 1/1/2018
Sessions.belongsTo(Users, {
  foreignKey: 'id_users'
});

Posts.belongsTo(Locations, {
  foreignKey: 'id_locations'
});


module.exports.Posts = Posts;
module.exports.Locations = Locations;
module.exports.Users = Users;
module.exports.Sessions = Sessions;
