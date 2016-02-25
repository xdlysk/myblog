var mongoose = require('mongoose');
var config = require('./config');

var siteconfig = require('../models/siteconfig');
var user = require('../models/user');

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

module.exports = dbset;