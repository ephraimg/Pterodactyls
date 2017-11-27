/**
 * @fileOverview Connects server to mySQL, creates a kuyikSQL database, and uses that database.
 */

require('dotenv').config();
const Promise = require('bluebird');
const mysql = require('mysql');

// below for dev environment
// const connection = mysql.createConnection({
//   user: process.env.SQL_USERNAME,
//   password: process.env.SQL_PASSWORD
// });

// below for deployment environment
const connection = mysql.createConnection(process.env.CLEARDB_DATABASE_URL);

const db = Promise.promisifyAll(connection);

connection.connectAsync()
  .then(() => console.log('mySQL is now connected'))
  // .then(() => db.queryAsync('CREATE DATABASE kuyikSQL'))
  .catch(err => {}) // ignore error caused when db already exists
  // .then(() => db.queryAsync('USE kuyikSQL'))
  // .then(() => console.log('mySQL is using the kuyikSQL database'));
