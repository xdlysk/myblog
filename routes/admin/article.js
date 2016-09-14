const express = require('express');
const blogcontext = require('../../utils/blogcontext');
const config = require('../../utils/config');
const helper = require('../../utils/helper');
const articleService = require('../../service/article');
const commentService = require('../../service/comment');
const async = require('async');
const router = express.Router();

/* article begin */
router.get('/', (req, res, next) => {
    res.send('hello artile')
});

router.get('/edit.html', (req, res, next) => {
    var id = req.query.id;
    if (id) {
        res.render('admin/article/edit1', { title: '编辑文章', id: id });
    } else {
        res.render('admin/article/edit1', { title: '新建文章', id: null });
    }

});

router.post('/edit', (req, res, next) => {
    var model = req.body;
    if (model.id) {
        //update
        articleService.updateArticle(model, req.User, (err, at) => {
            if (err) {
                res.json({ success: false, msg: err.message });
            } else {
                res.json({ success: true });
            }
        })
    } else {
        articleService.saveArticle(model, req.User, (err, at) => {
            if (err) {
                res.json({ success: false, msg: err.message });
            } else {
                res.json({ success: true, id: at.id });
            }
        })
    }
});


router.get('/drop/:id', (req, res, next) => {
    var aid = req.params.id;
    if (!aid) {
        res.send(500, { message: '参数错误' });
    }
    articleService.updateArticleState(aid, -1, (err) => {
        if (err) {
            res.json({ success: false });
        } else {
            res.json({ success: true });
        }
    });

});

//获取article主体数据
router.get('/content', (req, res, next) => {
    var id = req.query.id;
    var actions = {
        tags: (callback) => articleService.getAllTags(callback),
        categories: (callback) => articleService.getAllCategories(callback)
    }
    if (id) {
        actions.article = (callback) => articleService.getArticleById(id, callback);
    }

    async.parallel(actions, (err, result) => {
        if (err) {
            res.json({ success: false, msg: err.message });
            return;
        } else {
            res.json({
                success: true,
                article: result.article,
                tags: result.tags,
                categories: result.categories
            });
            return;
        }
    });
});

router.get('/list', (req, res, next) => {
    res.render('admin/article/list', { title: '所有文章' });
});

router.get('/list/:page', (req, res, next) => {
    var page = parseInt(req.params.page);
    if (isNaN(page)) {
        page = 1;
    }
    var query = blogcontext.Article.find();
    query.count({}, (err, count) => {
        if (err) {
            res.json({ success: false, msg: err.message });
            res.end();
        }
        blogcontext.Article.find()
            .sort({ 'postTime.time': -1 })
            .skip((page - 1) * config.admin.pageSize)
            .limit(config.admin.pageSize)
            .select({
                id: 1,
                title: 1,
                postTime: 1,
                poster: 1,
                state: 1,
                tags: 1,
                categories: 1,
                comment: 1
            }).exec((err, articles) => {
                if (err) {
                    res.json({ success: false, msg: err.message });
                    res.end();
                }
                res.json({
                    success: true,
                    page: Math.ceil(count / config.admin.pageSize),
                    count,
                    articles
                });
            });
    })

});

/* article end */

router.get('/comment.html',(req,res,next)=>{
    var articleId = req.query.id;
    if(!articleId){
        res.send(500, {message:'文章Id不能为空'});
        return;
    }
    res.render('admin/article/comment.html',{title:'',articleId})
});

router.get('/comment/:id',(req,res,next)=>{
   var articleId = req.params.id;
   commentService.getManageCommentsByArticleId(articleId,(err,comments)=>{
       if(err){
           res.json({success:false,message:err.message});
       }else{
           res.json({success:true,comments});
       }
   })
});

/*comment end */

router.get('/category.html', (req, res, next) => {
    res.render('admin/article/category', { title: '' });
});

router.get('/category', (req, res, next) => {
    blogcontext.Category.find({}, (err, categories) => {
        if (err) {
            res.send(500, err);
        } else {
            res.json(categories);
        }
    });
});

router.post('/category', (req, res, next) => {
    var model = req.body;
    articleService.upsertCategory(model, (err, m) => {
        if (err) {
            res.json({ success: false, msg: err.message });
        } else {
            res.json({ success: true, id: m._id });
        }
    })
});

router.delete('/category/:id', (req, res, next) => {
    var id = req.params.id;
    articleService.removeCategory(id, (err) => {
        if (err) {
            res.json({ success: false, msg: err.message });
        } else {
            res.json({ success: true });
        }
    })
});

router.get('/tag.html', (req, res, next) => {
    res.render('admin/article/tag', { title: '' });
})

router.get('/tag', (req, res, next) => {
    blogcontext.Tag.find({}, (err, categories) => {
        if (err) {
            res.send(500, err);
        } else {
            res.json(categories);
        }
    });
});

router.post('/tag', (req, res, next) => {
    var model = req.body;
    articleService.upsertTag(model, (err, m) => {
        if (err) {
            res.json({ success: false, msg: err.message });
        } else {
            res.json({ success: true, id: m._id });
        }
    })
});

router.delete('/tag/:id', (req, res, next) => {
    var id = req.params.id;
    articleService.removeTag(id, (err) => {
        if (err) {
            res.json({ success: false, msg: err.message });
        } else {
            res.json({ success: true });
        }
    })
});

module.exports = router;