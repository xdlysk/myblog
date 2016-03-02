var express = require('express');
var blogcontext = require('../../utils/blogcontext');
var config = require('../../utils/config');
var router = express.Router();

/* article begin */
router.get('/',  (req, res, next) => {
    res.send('hello artile')
});

router.get('/edit/:id', (req, res, next) => {
    var id = req.params.id;
    res.render('admin/article/edit', { title: '编辑文章', aid: id||'' });
});

router.post('/edit',(req,res,next)=>{
    var model = req.body;
    var id = model.id;
    if(id){
        //update
        blogcontext.Article.findByIdAndUpdate(id,{$set:{
            source:model.source,
            title:model.title,
            partialUrl:model.partialUrl,
            content:model.content,
            state:model.state,
            updateTime:Date.now(),
            updater:req.User.username,
            tags:model.tags,
            categories:model.categories,
            keywords:model.keywords,
            description:model.description
        }},(err)=>{
            if(err){
                res.json({success:false,msg:err.message});
            }else{
                res.json({success:true});
            }
        })
    }else{
        //new
        var article = new blogcontext.Article({
            source:model.source,
            title:model.title,
            partialUrl:model.partialUrl,
            content:model.content,
            state:model.state,
            postTime:Date.now(),
            poster:req.User.username,
            tags:model.tags,
            categories:model.categories,
            keywords:model.keywords,
            description:model.description
        });
        article.save((err,at)=>{
            if(err){
                res.json({success:false,msg:err.message});
            }else{
                res.json({success:true,id:at.id});
            }
        })
    }
});

//获取article主体数据
router.get('/content/:id',(req, res, next)=>{
    var aid = req.params.id;
    if(!aid){
        res.send(500,{message:'参数错误'});
    }
    blogcontext.Article.findById(aid,(err,article)=>{
       if(err){
           res.send(500,err);
       } else{
           res.json(article);
       }
    });
});

router.get('/list',(req,res,next)=>{
    res.render('admin/article/list',{title:'所有文章'});
});

router.get('/list/:page',(req,res,next)=>{
   var page = req.params.page;
   if(!isNaN(page)){
       page = 1;
   } 
   var query = blogcontext.Article.find();
   query.count({},(err,count)=>{
       if(err){
           res.json({success:false,msg:err.message});
           res.end();
       }
       query.setOptions({
            sort:{postTime:-1},
            limit:config.admin.pageSize,
            skip:page-1
        }).select({
            id:1,
            title:1,
            postTime:1
        }).exec((err,articles)=>{
            if(err){
                res.json({success:false,msg:err.message});
                res.end();
            }
            res.json({
                count,
                articles
                });
        });
   })
   
});

/* article end */

router.get('/category',(req,res,next)=>{
    blogcontext.Category.find({},(err,categories)=>{
        if(err){
            res.send(500,err);
        }else{
            res.json(categories);
        }
    });
});

router.get('/tag',(req,res,next)=>{
    blogcontext.Tag.find({},(err,tags)=>{
        if(err){
            res.send(500,err);
        }else{
            res.json(tags);
        }
    });
});

module.exports = router;