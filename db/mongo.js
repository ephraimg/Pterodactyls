/**
 * @fileOverview Connects Mongoose to mongoDB, exports Post model.
 */

const mongoose = require('mongoose');
const faker = require('faker');
const mongoUri = process.env.MONGODB_URI;
mongoose.Promise = global.Promise;


mongoose.connect(mongoUri, { useMongoClient: true });
mongoose.connection.on('error', function() {
  console.log('Mongo connection error:');
});
mongoose.connection.once('open', function() {
  console.log('Mongo connection successful');
});

module.exports.Post = mongoose.model('Post', { text: String });
