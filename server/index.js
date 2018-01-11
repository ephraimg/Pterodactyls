/**
 * @fileOverview Server set-up, routes, and authorization.
 */

require('dotenv').config();
const express = require('express');
const Sequelize = require('sequelize');
const bodyParser = require('body-parser');
const orm = require('../db/orm.js');
const mongo = require('../db/mongo.js');
const data = require('../db/saveFakeData.js');
const dbHelpers = require('../db/dbHelpers.js');
const axios = require('axios');


// Seed database if needed
if (process.env.SEEDED === '0') { data.seed(); }

const app = express();

app.use(express.static(__dirname + '/../client'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


/////////// For auth /////////////
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
app.use(session({
  secret: process.env.SESSION_SECRET,
  saveUninitialized: true,
  resave: false
}));
app.use(passport.initialize());
app.use(passport.session());

// these two are needed for sessions (using default storage)
passport.serializeUser(function(user, done) {
  done(null, user.google_id);
});
passport.deserializeUser(function(googleId, done) {
  orm.Users.find({where: {google_id: googleId} }) // eslint-disable-line camelcase
    .then(user => done(null, user))
    .catch(err => done(err, null));
});

// configure passport to use Google OAuth2
passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
  },
  verifyCallback
));

/**
  * This is the "verify callback" we use with OAuth2 and Google. See Passport docs for more info: <a href="http://www.passportjs.org/docs/authenticate/">http://www.passportjs.org/docs/authenticate/</a>.
  * @func verifyCallback
  * @param {string} accessToken
  * @param {string} refreshToken
  * @param {profile} object
  * @param {done} function
*/
function verifyCallback(accessToken, refreshToken, profile, done) {
  return orm.Users.findOne({where: {google_id: profile.id} }) // eslint-disable-line camelcase
    .then(user => {
      if (user) {
        return done(null, user);
      } else {
        dbHelpers.saveGoogleUser(profile)
          .then(user => done(null, user));
      }
    })
    .catch(err => done(err, null));
}

// using Google auth requires these two routes
/*
This function is required for OAuth2 with Google. Sign-in requests are directed to this endpoint for processing by Google, after which Google redirects the request to the callback endpoint with the logged in user (if the login was successful).
*/
app.get('/auth/google',
  passport.authenticate('google', {
    scope: ['https://www.googleapis.com/auth/plus.login']
  })
);
app.get('/auth/google/callback',
  passport.authenticate('google', {
    successRedirect: '/',
    failureRedirect: '/'
  })
);
//////////////////////////////////


app.get('/home', (req, res) => {
  let sqlPosts = []; // need this external variable!!
  let user = {};
  dbHelpers.searchFrontPosts() // get posts from sql for the home page
    .then(results => {
      sqlPosts = results; // set external variable
      return dbHelpers.getMongoTextsForSqlResults(sqlPosts);
    })
    .then(results => {
      let mongoTexts = {}; // transform results into easier-to-use form
      results.forEach(record => mongoTexts[record._id] = record.text);
      // If user is logged in, send the user info back to the client
      if (req.isAuthenticated()) { user = req.user; }
      res.send({
        user: user, 
        posts: dbHelpers.addMongoTextsToSqlResults(sqlPosts, mongoTexts)
      });
    })
    .catch(err => console.log('GET /home error:', err));
});

app.get('/search', (req, res) => {
  let sqlPosts = [];
  dbHelpers.searchAllPosts(req.query.search)
    .then(posts => {
      sqlPosts = posts; // set external variable
      return dbHelpers.getMongoTextsForSqlResults(sqlPosts);
    })
    .then(results => { // use external variable --v
      return dbHelpers.addMongoTextsToSqlResults(sqlPosts, results);
    })
    .then(allPosts => {
      let filteredPosts = [];
      // Filter for post where the query is part of the title, author, or location
      allPosts.map(post => {
        let q = req.query.search.toLowerCase();
        if (post.title.toLowerCase().includes(q) || post.author.toLowerCase().includes(q) || post.location.toLowerCase().includes(q)) {
          filteredPosts.push(post);
        }
      });
      res.send(filteredPosts);
    })
    .catch(err => console.log('GET /search error:', err));
});

app.post('/posts', (req, res) => {
  // console.log('req.body is: ', req.body);
  // console.log('req.user is:', req.user);
  let newPost = {
    // find or create user id below...
    id_users: 99999, // eslint-disable-line camelcase
    title: req.body.title,
    subtitle: req.body.subtitle,
    id_locations: 99999, // eslint-disable-line camelcase
    pics: req.body.pics,
    // create mongo text id below...
    id_mongo_text: '' // eslint-disable-line camelcase
  };
  orm.Users.findOrCreate({
    where: {id: req.user.id},
    defaults: {
      google_name: req.user.google_name, // eslint-disable-line camelcase
      google_id: req.user.google_id, // eslint-disable-line camelcase
      google_avatar: req.user.google_avatar // eslint-disable-line camelcase
    }
  })
    .spread((user, created) => {
      // console.log('user from db: ', user);
      newPost.id_users = user.get('id'); // eslint-disable-line camelcase
    })
    .then(() => orm.Locations.findOrCreate({
      where: {location: req.body.location}
    }))
    .spread((loc, created) => {
      // console.log('loc from db: ', loc.get('id'));
      newPost.id_locations = loc.get('id'); // eslint-disable-line camelcase
      Promise.resolve(true);
    })
    .then(() => {
      let mongoText = new mongo.Post({text: req.body.main});
      return mongoText.save();
    })
    .then(savedText => {
      newPost.id_mongo_text = savedText['_id'].toString(); // eslint-disable-line camelcase
      orm.Posts.create(newPost);
    })
    .then(() => res.redirect('/'));
});

// logout route added to work with passport
app.get('/signout', function (req, res) {
  req.logout();
  res.clearCookie('connect.sid');
  res.redirect('/');
  // req.session.destroy(function (err) {
  //
  //   res.redirect('/home');
  // });
});

// Uploading image to Imgur API
app.post('/image', function(req, res) {

  console.log('Image URL: ', req.body.imageUrl);

  const temp = req.body.imageUrl.split(',');
  const image = temp[1];
  const form = { 'image': image };
  const config = {
    baseURL: 'https://api.imgur.com',
    headers: { 'Authorization': `Client-ID ${process.env.IMGUR_CLIENT_ID}` }
  };
  // Send to Imgur
  return axios.post('/3/image', form, config)
    .then(result => {
      console.log('Image post success');
      // HERE IS THE LINK THAT NEEDS TO BE STORED IN THE DB WITH THE POST
      console.log(result.data.data.link);
      res.status(201);
      return res.send(result.data.data.link);
    })
    .catch(error => console.log('Image post error', error));
});

app.listen(process.env.PORT, () => {
  console.log(`Listening on port ${process.env.PORT}...`);
});
