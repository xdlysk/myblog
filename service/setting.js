const blogcontext = require('../utils/blogcontext');
const config = require('../utils/config');
const helper = require('../utils/helper');

module.exports={
  getSiteConfig:function(callback) {
      blogcontext.SiteConfig.findOne({}, (err, siteconfig) => {
        if (err) {
            return callback(err);
        }
        callback(null,siteconfig);
        
    });
  }
    
};