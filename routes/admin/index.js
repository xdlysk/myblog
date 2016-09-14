var express = require('express');
var setup = require('./setup');
var article = require('./article');
var common = require('./common');
var config = require('../../utils/config');
var helper = require('../../utils/helper');
var blogcontext = require('../../utils/blogcontext');
const settingService = require('../../service/setting');
var router = express.Router();

router.use('/setup', setup);

//后台无需缓存etage
router.all('*', function (req, res, next) {
    res.append("Etag", Date.now());
    next();
});

router
    .get('/login', function (req, res, next) {
        res.render('admin/login', { title: 'login - ' + config.admin.title });
    })
    .post('/login', function (req, res, next) {
        var data = req.body;
        if (!data.username || !data.password) {
            res.json({ success: false, msg: '请输入用户名或密码' });
            return;
        }
        var epassword = helper.encrypt(data.password, config.admin.generalEncryptKey);
        blogcontext.User.findOne({ userName: data.username, passWord: epassword }, function (err, user) {
            if (err) {
                res.send(500, err);
                res.end();
            }
            if (!user) {
                res.json({ success: false, msg: '用户名或密码错误' });
                res.end();
            } else {
                //登陆成功，构建cookie
                var cookieoptions = {
                    expires: data.rememberme ? new Date(Date.now() + config.admin.longTimeout) : 0,
                    httpOnly: true,
                    path: '/admin'
                };
                var value = helper.encrypt(JSON.stringify({
                    username: user.userName,
                    displayname: user.displayName
                }), config.admin.cookieEncryptKey);
                res.cookie(config.admin.cookieKey, value, cookieoptions);
                res.json({ success: true, returnUrl: req.query.returnUrl || '/admin' });
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
    var dstring = helper.decrypt(authvalue, config.admin.cookieEncryptKey);
    var obj = JSON.parse(dstring);
    var now = Date.now();
    if (obj.expired <= now) {
        return false;
    }
    req.User = obj;
    return true;
}

router.get('/logout', function (req, res, next) {
    res.clearCookie(config.admin.cookieKey, { path: '/admin' });
    res.redirect('/admin/login');
});

router.all('*', function (req, res, next) {
    var validate = checkAuthorization(req);
    if (!validate) {
        res.redirect('/admin/login?returnUrl=' + req.path);
        return;
    }
    
    settingService.getSiteConfig((err, siteconfig) => {
        if (err) {
            res.send(404, err);
        }
        req.siteconfig = {
            siteName: siteconfig.siteName,
            siteDes: siteconfig.siteDes,
            siteUrl: siteconfig.siteUrl
        };
        next();
    })
});

router.use('/article', article);

router.use('/common', common);

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.render('admin/index', { title: '' });
});

router.get('/dashboard', function (req, res, next) {
    res.render('admin/dashboard', { title: '' })
})


//dashboard2

router.get('/index2',(req,res,next)=>{
    res.render('admin/index2', { title: '' })
});

module.exports = router;
