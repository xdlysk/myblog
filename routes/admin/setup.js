var express = require('express');
var router = express.Router();
var blogcontext = require('../../utils/blogcontext');
var config = require('../../utils/config');

router.get('/',function(req,res,next){
    blogcontext.SiteConfig.findOne(function(err,siteconfig){
        if(siteconfig){
            res.redirect('/admin');
        }else{
            res.render('admin/setup',{
                title: config.admin.title,
                model: siteconfig
            }); 
        }
    });
    
    
});

router.post('/',function(req,res,next){
    var m = new blogcontext.SiteConfig({
       siteName:req.body.siteName,
       siteDes:req.body.siteDes,
       siteUrl:req.body.siteUrl
    });
    
    blogcontext.SiteConfig.remove({},function(){
        m.save(function(err,m){
                if(err) console.log(err);
            });
    })
    
    res.redirect('login');
});


module.exports = router;