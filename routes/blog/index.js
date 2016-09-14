const express = require('express');
const blogcontext = require('../../utils/blogcontext');
const config = require('../../utils/config');
const helper = require('../../utils/helper');
const articleService = require('../../service/article');
const settingService = require('../../service/setting');
const commentService = require('../../service/comment');
const async = require('async');
const router = express.Router();

//add website info 
router.all('*', (req, res, next) => {
    var nowEtag = parseInt(Date.now() / config.blog.etageCache);
    var lastEtag = req.get('if-none-match');
    if (nowEtag == lastEtag) {
        res.status(304);
        res.end();
        return;
    }
    res.append("Etag", nowEtag)

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

function getHeadInfo(options) {
    var ret = { label: '', content: '' };
    if (options.year) {
        ret.label = "Year";
        ret.content = options.year;
        ret.partUrl = options.year;
        if (options.month) {
            ret.label = "Month";
            ret.content += "-" + options.month;
            ret.partUrl = `${options.year}/${options.month}`;
            if (options.day) {
                ret.label = "Day";
                ret.content += "-" + options.day;
                ret.partUrl += `${options.year}/${options.month}/${options.day}`;
            }
        }
        return ret;
    }
    if (options.category) {
        ret.label = "Category";
        ret.content = options.category;
        ret.partUrl ='category/' + options.category;
        return ret;
    }
    if (options.tag) {
        ret.label = "Tag";
        ret.content = options.tag;
        ret.partUrl = 'tag/' + options.tag;
        return ret;
    }
    if (options.author) {
        ret.label = "Author";
        ret.content = options.author;
        ret.partUrl = 'author/' + options.author;
        return ret;
    }
}


function processIndex(req, res, next, options) {
    var sc = req.siteconfig;
    options = options || {};
    var page = options.page || 1,
        now = options.now || new Date(),
        hashead = options.hashead || false;
    if (options.month) {
        var year = options.year || now.getFullYear();
        now.setTime(Date.parse(`${year}-${options.month}-01 00:00:00`));
    }
    async.parallel({
        article: (callback) => articleService.getArticlePageByCondition(page, options, callback),
        latestArticles: (callback) => articleService.getLatestArticles(config.blog.latestCount, callback),
        monthArticle: (callback) => articleService.getMonthArticleCalendar(now, callback),
        gtArticle: (callback) => articleService.hasArticleGTTime(now, callback),
        ltArticle: (callback) => articleService.hasArticleLTTime(now, callback),
        archives:(callback) => articleService.getArchives(callback),
        categoryTag:(callback) => articleService.getCategoryAndTag(callback)
    }, (err, result) => {
        if (err || result.article.articles.length === 0) {
            res.status(404)
            res.render('404');
            res.end();
            return;
        }
        var obj = {
            title: sc.siteName + ' – ' + sc.siteDes,
            siteName: sc.siteName,
            siteDes: sc.siteDes,
            siteUrl: sc.siteUrl,
            articles: result.article.articles,
            hasNextPage: result.article.hasNextPage,
            page: result.article.page,
            latestArticles: result.latestArticles,
            archives : result.archives,
            calendar: {
                calendar: result.monthArticle,
                now,
                gtArticle: result.gtArticle,
                ltArticle: result.ltArticle
            },
            hashead,
            headInfo: getHeadInfo(options),
            categoryTag:result.categoryTag
        };
        res.render('blog/index', obj);
    })
}


router.get('/', function(req, res, next) {
    processIndex(req, res, next);
});

router.get('/page/:page', (req, res, next) => {
    var page = parseInt(req.params.page);
    if (isNaN(page)) {
        page = 1;
    }
    processIndex(req, res, next, {
        page: page
    });
});

router.get('/author/:author',(req,res,next)=>{
    var author = req.params.author;
    processIndex(req, res, next, {
        author,
        hashead: true
    })
});

router.get('/author/:author/page/:page',(req,res,next)=>{
    var page = parseInt(req.params.page),
        author = req.params.author;
    if (isNaN(page)) {
        page = 1;
    }
    processIndex(req, res, next, {
        author,
        page,
        hashead: true
    });
});

router.get('/category/:category/page/:page', (req, res, next) => {
    var page = parseInt(req.params.page),
        category = req.params.category;
    if (isNaN(page)) {
        page = 1;
    }
    processIndex(req, res, next, {
        category,
        page,
        hashead: true
    });
});


router.get('/category/:category', (req, res, next) => {
    var category = req.params.category;
    processIndex(req, res, next, {
        category,
        hashead: true
    })
});

router.get('/tag/:tag/page/:page', (req, res, next) => {
    var page = parseInt(req.params.page),
        tag = req.params.tag;
    if (isNaN(page)) {
        page = 1;
    }
    processIndex(req, res, next, {
        tag,
        page,
        hashead: true
    })
});

router.get('/tag/:tag', (req, res, next) => {
    var tag = req.params.tag;
    processIndex(req, res, next, {
        tag,
        hashead: true
    })
});

router.post('/article/comment',(req,res,next)=>{
    var model = req.body;
    if(!model.articleId){
        res.json({success:false,message:'无效的文章Id'});
        return;
    }
    if(!model.author || !model.email){
        res.json({success:false,message:'必填字段为空'});
        return;
    }
    commentService.addComment(model,(err)=>{
       if(err){
           res.json({success:false,message:err.message});
       } else{
           res.json({success:true});
       }
    });
})

router.get('/article/comment/:id',(req,res,next)=>{
   var articleid = req.params.id;
   commentService.getCommentsByArticleId(articleid,(err,comments)=>{
       if(err){
           res.send(err.message);
       }else{
           res.render('blog/comment',{id:articleid,comments:comments});
       }
   }) ;
});


router.get('/article/:id', function(req, res, next) {
    var id = req.params.id,
        now = new Date(),
        sc = req.siteconfig;
        async.waterfall([(cb)=>{
            async.parallel({
                article: (callback) => articleService.getArticleById(id, callback),        
                latestArticles: (callback) => articleService.getLatestArticles(config.blog.latestCount, callback),
                monthArticle: (callback) => articleService.getMonthArticleCalendar(now, callback),
                gtArticle: (callback) => articleService.hasArticleGTTime(now, callback),
                ltArticle: (callback) => articleService.hasArticleLTTime(now, callback),
                archives:(callback) => articleService.getArchives(callback),
                categoryTag:(callback) => articleService.getCategoryAndTag(callback)
            }, (err, result) => {
                if(err){
                    return cb(err);
                }
                cb(null,result);
            });
        },(preres,cb)=>{
            var time = preres.article.postTime.time;
            async.parallel({
                prevArticle: (callback) => articleService.getPrevArticleByBaseTime(time, callback),
                nextArticle: (callback) => articleService.getNextArticleByBaseTime(time, callback)
            }, (err, result) => {
                if(err){
                    return cb(err);
                }
                result.article = preres.article;
                result.latestArticles = preres.latestArticles;
                result.monthArticle = preres.monthArticle;
                result.gtArticle = preres.gtArticle;
                result.ltArticle = preres.ltArticle;
                result.archives = preres.archives;
                result.categoryTag = preres.categoryTag
                cb(null,result);
            });
        }
        ],(err,result)=>{
            if (err || result.article.state !== 0/*不展示未发布项*/) {
                    res.status(404).send(err);
                    return;
                }
                var obj = {
                    title: result.article.title + ' – ' + sc.siteName,
                    siteName: sc.siteName,
                    siteDes: sc.siteDes,
                    siteUrl: sc.siteUrl,
                    article: result.article,
                    latestArticles: result.latestArticles,
                    calendar: {
                        calendar: result.monthArticle,
                        now,
                        gtArticle: result.gtArticle,
                        ltArticle: result.ltArticle
                    },
                    archives : result.archives,
                    prevArticle: result.prevArticle,
                    nextArticle: result.nextArticle,
                    categoryTag:result.categoryTag
                };
                res.render('blog/article', obj);
        });
});

function processDay(req, res, next) {
    var year = req.params.year,
        month = req.params.month,
        day = req.params.day,
        page = req.params.page;
    if (!/\d{4}/.test(year) || !/\d{1,2}/.test(month) || !/\d{1,2}/.test(day)) {
        res.status(404).render("404");
    }
    if (!page) {
        page = 1;
    } else if (!/\d+/.test(page)) {
        res.status(404).render("404");
    }

    processIndex(req, res, next, {
        year, month, day, page,
        hashead: true
    });
}

//yyyy/MM/dd
router.get('/:year/:month/:day', (req, res, next) => {
    processDay(req, res, next);
});

router.get('/:year/:month/:day/page/:page', (req, res, next) => {
    processDay(req, res, next);
});


function processMonth(req, res, next) {
    var year = req.params.year,
        month = req.params.month,
        page = req.params.page;
    if (!/\d{4}/.test(year) || !/\d{1,2}/.test(month)) {
        res.status(404).render("404");
    }
    if (!page) {
        page = 1;
    } else if (!/\d+/.test(page)) {
        res.status(404).render("404");
    }

    processIndex(req, res, next, {
        year, month, page,
        hashead: true
    });
}



router.get('/:year/:month', (req, res, next) => {
    processMonth(req, res, next);
});

router.get('/:year/:month/page/:page', (req, res, next) => {
    processMonth(req, res, next);
});

function processYear(req, res, next) {
    var year = req.params.year,
        page = req.params.page;
    if (!/\d{4}/.test(year)) {
        res.status(404).render("404");
    }
    if (!page) {
        page = 1;
    } else if (!/\d+/.test(page)) {
        res.status(404).render("404");
    }

    processIndex(req, res, next, {
        year, page,
        hashead: true
    });
}


router.get('/:year', (req, res, next) => {
    processYear(req, res, next);
});

router.get('/:year/page/:page', (req, res, next) => {
    processYear(req, res, next);
});

module.exports = router;
