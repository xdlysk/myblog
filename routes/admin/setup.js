var express = require('express');
var router = express.Router();
var blogcontext = require('../../utils/blogcontext');
var config = require('../../utils/config');
var helper = require('../../utils/helper');
var path = require('path');
var fs = require('fs');

router.get('/', function (req, res, next) {
    blogcontext.SiteConfig.findOne(function (err, siteconfig) {
        if (siteconfig) {
            res.redirect('/admin');
        } else {
            res.render('admin/setup', {
                title: config.admin.title,
                model: siteconfig
            });
        }
    });


});

router.post('/', function (req, res, next) {
    var m = new blogcontext.SiteConfig({
        siteName: req.body.siteName,
        siteDes: req.body.siteDes,
        siteUrl: req.body.siteUrl
    });
    
    //初始化上传目录
    var uploadroot = config.admin.uploadConfig.uploadDir;
    try {
        fs.statSync(uploadroot);
    } catch (error) {
        fs.mkdirSync(uploadroot);
    }
    var subdirs = config.admin.uploadConfig.uploadSubDirs.split(/,/g);
    for (var i = 0, l = subdirs.length; i < l; i++) {
        var sp = path.join(uploadroot, subdirs[i]);
        try {
            fs.statSync(sp);
            continue;
        } catch (error) {
            fs.mkdirSync(sp);
        }
    }


    blogcontext.SiteConfig.remove({}, function () {
        m.save(function (err, m) {
            if (err) { res.send(500, err); }
            //add user
            var user = new blogcontext.User({
                userName: req.body.userName,
                passWord: helper.encrypt(req.body.passWord, config.admin.generalEncryptKey)
            });
            user.save(function (err, user) {
                if (err) { res.send(500, err); }
                res.redirect('login');
            })
        });
    })


});


module.exports = router;