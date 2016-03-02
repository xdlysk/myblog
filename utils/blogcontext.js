var mongoose = require('mongoose');
var config = require('./config');

var siteconfig = require('../models/siteconfig');
var user = require('../models/user');
var article = require('../models/article');
var category = require('../models/category');
var tag = require('../models/tag');
var comment = require('../models/comment');

mongoose.connect(config.mongodb.connectionString);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    // we're connected!
    //console.debug('mongodb connect successed');
});


var dbset = {};

dbset.SiteConfig = mongoose.model('SiteConfig', mongoose.Schema(siteconfig));
dbset.User = mongoose.model('User', mongoose.Schema(user));
dbset.Article = mongoose.model('Article', mongoose.Schema(article));
dbset.Category = mongoose.model('Category', mongoose.Schema(category));
dbset.Tag = mongoose.model('Tag', mongoose.Schema(tag));
dbset.Comment = mongoose.model('Comment', mongoose.Schema(comment));

module.exports = dbset;