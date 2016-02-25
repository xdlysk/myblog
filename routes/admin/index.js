var express = require('express');
var setup = require('./setup');
var article = require('./article');
var config = require('../../utils/config');
var util = require('../../utils/util');
var blogcontext = require('../../utils/blogcontext');
var router = express.Router();

router.use('/setup', setup);

router
    .get('/login', function (req, res, next) {
        res.render('admin/login');
    })
    .post('/login', function (req, res, next) {
        var data = req.body;
        if (!data.username || !data.password) {
            res.json({ success: false, msg: '请输入用户名或密码' });
            res.end();
        }
        var epassword = util.encrypt(data.password, config.admin.generalEncryptKey);
        blogcontext.User.findOne({ userName: data.username, passWord: epassword }, function (err, user) {
            if (err || !user) {
                res.json({ success: false, msg: '用户名或密码错误' });
                res.end();
            }
            if (user) {
                //登陆成功，构建cookie
                var cookieoptions = {
                  expires:data.rememberme?new Date(Date.now() + config.admin.longTimeout):0,
                  httpOnly:true  
                };
                var value = util.encrypt(JSON.stringify({
                    username:user.userName,
                    displayname:user.displayName
                }),config.admin.cookieEncryptKey);
                res.cookie(config.admin.cookieKey,value,cookieoptions);
                res.json({success:true,returnUrl:req.query.returnUrl||'/admin/index'});
                res.end();
            }
        })

    });

function checkAuthorization(req) {
    var cookies = req.cookies;
    //没有cookie
    var authvalue = cookies[config.admin.cookieKey];
    if (!authvalue) {
        return false;
    }
    //有cookie需验证
    var dstring = util.decrypt(authvalue, config.admin.cookieEncryptKey);
    var obj = JSON.parse(dstring);
    var now = Date.now();
    if (obj.expired <= now) {
        return false;
    }
    return obj.username;
}

router.all('*', function (req, res, next) {
    var username = checkAuthorization(req);
    if (username) {
        req.currentUser = username;
        next();
    } else {
        res.redirect('/admin/login?returnUrl='+req.path);
    }
});

router.use('/article', article);

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.render('admin/index');
});

module.exports = router;
