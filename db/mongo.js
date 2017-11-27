/**
 * @fileOverview Connects Mongoose to mongoDB, exports Post model.
 */

const mongoose = require('mongoose');
const faker = require('faker');
const mongoUri = process.env.MONGODB_URI;
mongoose.Promise = global.Promise;

const init = () => {
  mongoose.connect(mongoUri, { useMongoClient: true });

  var db = mongoose.connection;

  db.on('error', function() {
    console.log('Mongo connection error:');
  });

  db.once('open', function() {
    console.log('Mongo connection successful');
  });  

  return Promise.resolve(true);
};

const Post = mongoose.model('Post', { text: String });

module.exports.Post = Post;
module.exports.init = init;
