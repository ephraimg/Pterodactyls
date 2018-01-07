
const orm = require('./orm.js');
const mongo = require('./mongo.js');

// Gets post to load on home page
searchFrontPosts = () => (
  orm.Posts.findAll({
    order: [['createdAt', 'DESC']],
    include: [{ model: orm.Users }, { model: orm.Locations }] // Include performs joins
  })
    .then(posts => 
      posts.map(post => ({
        id: post.id,
        title: post.title,
        subtitle: post.subtitle,
        author: post.User.username,
        avatar: post.User.pic,
        location: post.Location.location,
        pics: post.pics,
        id_mongo_text: post.id_mongo_text, // eslint-disable-line camelcase
        createdAt: post.createdAt,
        google_name: post.User.google_name, // eslint-disable-line camelcase
        google_id: post.User.google_id, // eslint-disable-line camelcase
        google_avatar: post.User.google_avatar // eslint-disable-line camelcase
      }))
    )
  // TO DO:
  // Add limit and filter once decided, such as
  // top 20 most recent posts or top 10 liked posts
);

// Gets post to load through search field
searchAllPosts = query => (
  orm.Posts.findAll({ 
    order: [['createdAt', 'DESC']],
    include: [{ model: orm.Users }, { model: orm.Locations }] // Include performs joins
  })
    .then(posts => (
      posts.map(post => ({
        id: post.id,
        title: post.title,
        subtitle: post.subtitle,
        author: post.User.username,
        avatar: post.User.pic,
        location: post.Location.location,
        pics: post.pics,
        id_mongo_text: post.id_mongo_text, // eslint-disable-line camelcase
        createdAt: post.createdAt,
        google_name: post.User.google_name, // eslint-disable-line camelcase
        google_id: post.User.google_id, // eslint-disable-line camelcase
        google_avatar: post.User.google_avatar, // eslint-disable-line camelcase
        background_pic: post.pic // eslint-disable-line camelcase
      }))
    ))
);


/**
  * This function retrieves a text body from mongoDB for each of the posts retrieved from mySQL.
  * @func getMongoTextsForSqlResults
  * @param {array} sqlResults - An array of posts retrieved from the mySQL database.
  * @returns {Promise} - A promise that resolves to an array of strings (text bodies).
*/
getMongoTextsForSqlResults = sqlResults => {
  let ids = sqlResults.map(post => post['id_mongo_text']);
  let mongoTexts = ids.map(_id => {
    return mongo.Post.findOne({_id: _id});
  });
  return Promise.all(mongoTexts);
};

/**
  * This function combines text bodies with the rest of the posts (objects containing other post properties).
  * @func addMongoTextsToSqlResults
  * @param {array} sqlPosts - An array of posts retrieved from the mySQL database.
  * @param {array} mongoTexts - An array of strings retrieved from the mongoDB database.
  * @returns {array} - An array of complete post objects.
*/
addMongoTextsToSqlResults = (sqlPosts, mongoTexts) => {
  for (let i = 0; i < sqlPosts.length; i++) {
    let id = sqlPosts[i]['id_mongo_text'];
    sqlPosts[i].text = mongoTexts[id];
  }
  return sqlPosts;
};

/**
  * This function saves a Google user profile to the mySQL user table.
  * @func saveGoogleUser
  * @param {array} googleProfile - An object containing a Google user's profile information.
  * @returns {Promise}
*/
const saveGoogleUser = function(googleProfile) {
  return orm.Users.create({
    google_id: googleProfile.id, // eslint-disable-line camelcase
    google_name: googleProfile.name.givenName, // eslint-disable-line camelcase
    google_avatar: googleProfile.photos[0].value // eslint-disable-line camelcase
  })
    .catch(err => console.log('Error saving user: ', err));
};


module.exports.searchAllPosts = searchAllPosts;
module.exports.searchFrontPosts = searchFrontPosts;
module.exports.getMongoTextsForSqlResults = getMongoTextsForSqlResults;
module.exports.addMongoTextsToSqlResults = addMongoTextsToSqlResults;
module.exports.saveGoogleUser = saveGoogleUser;
