const blogcontext = require('../utils/blogcontext');
const config = require('../utils/config');
const helper = require('../utils/helper');

module.exports = {
    getCategoryAndTag:function(callback){
        blogcontext.Article.find({state:0}).select({
            'categories.t':1,
            'categories.v':1,
            'tags.t':1,
            'tags.v':1
        }).exec((err, ct) => {
            if (err) {
                return callback(err);
            }
            var ret = {
                category:{},
                tag:{}
            };
            ct.forEach((item)=>{
                if(item.categories){
                    item.categories.forEach((c)=>{
                        var cc = ret.category[c.v];
                        if(!cc){
                            ret.category[c.v] = {t:c.t,c:1};
                        }else{
                            cc.c=cc.c+1;
                        }
                    });
                }
                if(item.tags){
                    item.tags.forEach((t)=>{
                        var tt = ret.tag[t.v];
                        if(!tt){
                            ret.tag[t.v] = {t:t.t,c:1};
                        }else{
                            tt.c=tt.c+1;
                        }
                    });
                }
            });
            callback(null,ret);
        });
    },
    getArchives:function(callback){
        blogcontext.Article.aggregate([{
            $match:{'state':0}
        },{
            $group:{
                _id:{'y':'$postTime.y','M':'$postTime.M'},
                count:{$sum:1}
            }
        }],(err,ret)=>{
            if(err){
                return callback(err);
            }
            callback(null,ret);
        });
    },
    updateArticleState:function(id,state,callback){
        blogcontext.Article.findByIdAndUpdate(id,{$set:{
            state:state
        }},
        (err)=>{
            if(err){
                return callback(err);
            }
            callback(null);
        });
    },
    updateArticle:function(model,user,callback){
        var id = model.id;
        var postTime = new Date();
        var timeticket = Date.parse(model.postTime);
        postTime.setTime(timeticket);
        //update
        blogcontext.Article.findByIdAndUpdate(id,{$set:{
            source:model.source,
            title:model.title,
            content:model.content,
            state:model.state,
            updateTime:Date.now(),
            updater:user.username,
            tags:model.tags,
            categories:model.categories,
            summary:helper.removeHtmlTags(model.content).substr(0,config.admin.summaryLength),
            postTime:{
                time:timeticket,
                y:postTime.getFullYear(),
                M:postTime.getMonth()+1,
                d:postTime.getDate()
            }
        }},(err)=>{
            if(err){
                return callback(err);
            }else{
                callback(null);
            }
        })
    },
    saveArticle:function(model,user,callback){
        //new
        var postTime = new Date();
        var timeticket = Date.parse(model.postTime);
        postTime.setTime(timeticket);
        var article = new blogcontext.Article({
            source:model.source,
            title:model.title,
            content:model.content,
            state:model.state,
            poster:user.username,
            tags:model.tags,
            categories:model.categories,
            summary:helper.removeHtmlTags(model.content).substr(0,config.admin.summaryLength),
            postTime:{
                time:timeticket,
                y:postTime.getFullYear(),
                M:postTime.getMonth()+1,
                d:postTime.getDate()
            }
        });
        article.save((err,at)=>{
            if(err){
                return callback(err);
            }else{
                callback(err,at);
            }
        })
    },
    getPrevArticleByBaseTime:function(time,callback){
        blogcontext.Article.find({state:0,'postTime.time':{$lt:time}})
        .sort({'postTime.time':-1})
        .limit(1)
        .select({
            id:1,
            title:1
        })
        .exec((err, articles) => {
            if (err) {
                return callback(err);
            }
            var ret = null;
            if(articles.length){
                ret = {
                    id:articles[0].id,
                    title:articles[0].title
                };
            }
            callback(null,ret);
        });
    },
    getNextArticleByBaseTime:function(time,callback){
        blogcontext.Article.find({state:0,'postTime.time':{$gt:time}})
        .sort({'postTime.time':1})
        .limit(1)
        .select({
            id:1,
            title:1
        })
        .exec((err, articles) => {
            if (err) {
                return callback(err);
            }
            var ret = null;
            if(articles.length){
                ret = {
                    id:articles[0].id,
                    title:articles[0].title
                };
            }
            callback(null,ret);
        });
    },
    //根据articleid获取article
    getArticleById: function(id, callback) {
        blogcontext.Article.findById(id, (err, article) => {
            if (err) {
                return callback(err);
            } else if(!article){
                return callback({message:`cannot find article with id ${id}`});
            }else {
                callback(null, article)
            }
        });
    },
    //根据条件的分页查询
    getArticlePageByCondition: function(page, options, callback) {
        var query = {state: 0};
        if(options.year){
            query['postTime.y'] = parseInt(options.year);
            if(options.month){
                query['postTime.M'] = parseInt(options.month);
                if(options.day){
                    query['postTime.d'] = parseInt(options.day);
                }
            }
        }
        if(options.category){
            query['categories.v'] = options.category;
        }
        if(options.tag){
            query['tags.v']= options.tag;
        }
        if(options.author){
            query['poster'] = options.author;
        }
        blogcontext.Article.find(query)
            .sort({'postTime.time':-1})
            .skip((page - 1) * config.blog.pageSize)
            .limit(config.blog.pageSize + 1)//多取一个判断个数可以判定是否有下一页
            .select({
                id: 1,
                title: 1,
                postTime: 1,
                poster: 1,
                state: 1,
                tags: 1,
                categories: 1,
                comment: 1,
                summary: 1
            }).exec((err, articles) => {
                if (err) {
                    return callback(err);
                }
                var hasNextPage = false;
                if (articles.length === config.blog.pageSize + 1) {
                    articles.pop();
                    hasNextPage = true;
                }
                callback(null, {
                    hasNextPage,
                    articles,
                    page
                });
            });
    },
    //获取最新count条blog标题和id
    getLatestArticles: function(count, callback) {
        blogcontext.Article.find({ state: 0 })
            .sort({'postTime.time':-1})
            .limit(count)
            .select({
                id: 1,
                title: 1,
            }).exec((err, latest) => {
                if (err) {
                    return callback(err);
                }
                callback(null,
                    latest
                );
            });
    },
    hasArticleGTTime:function(time, callback){
        var year = time.getFullYear(),
        month = time.getMonth()+1;
        if(month===12){
            year=year+1;
            month = 1;
        }else{
            month++;
        }
        var timeticket = Date.parse(`${year}-${month}-01 00:00:00`);
        var criteria ={
            state:0,
            'postTime.time':{$gte: timeticket}
        };
        blogcontext.Article
            .find(criteria)
            .sort({'postTime.time':1})
            .limit(1)
            .select({
                'postTime.y':1,
                'postTime.M':1
            }).exec((err,articles)=>{
                if(err){
                    return callback(err);
                }
                if(articles.length>0){
                    var a = articles[0];
                    var m = a.postTime.M;
                    if(m<10){
                        m =`0${m}`
                    }
                    callback(null,{
                        month:month,
                        subUrl:`${a.postTime.y}/${m}`}
                        );
                }else{
                    callback(null,null);
                }
            });
       
    },
    hasArticleLTTime:function(time, callback){
        var year = time.getFullYear(),
        month = time.getMonth()+1;
        var timeticket = Date.parse(`${year}-${month}-01 00:00:00`);
        var criteria ={
            state:0,
            'postTime.time':{$lt: timeticket}
        };
       blogcontext.Article
            .find(criteria)
            .sort({'postTime.time':-1})
            .limit(1)
            .select({
                'postTime.y':1,
                'postTime.M':1
            }).exec((err,articles)=>{
                if(err){
                    return callback(err);
                }
                if(articles.length>0){
                    var a = articles[0];
                    var m = a.postTime.M;
                    if(m<10){
                        m =`0${m}`
                    }
                    callback(null,{
                        month:a.postTime.M,
                        subUrl:`${a.postTime.y}/${m}`
                    });
                }else{
                    callback(null,null);
                }
            });
       
    },
    //获取当月发布的博客时间
    getMonthArticleCalendar: function(time, callback) {
        var year = time.getFullYear(),
        month = time.getMonth()+1;
        var criteria ={
            state:0,
            'postTime.y':{$eq:year},
            'postTime.M' :{$eq:month},
        };        
        blogcontext.Article
            .find(criteria)
            .select({
                'postTime.d':1}
            ).exec((err, monthArticle) => {
                if (err) {
                    return callback(err);
                }
                var calendar = helper.getCalendar(time);
                for(var i=0,l=monthArticle.length;i<l;i++){
                    for(var j=0,jl = calendar.length;j<jl;j++){
                        if(monthArticle[i].postTime.d==calendar[j].date){
                            calendar[j].count++
                        }
                    }
                }
                callback(null,
                    calendar
                );
            });
    },
    upsertCategory:function(model,callback){
        if(!model.id){
            var m = new blogcontext.Category({
                display:model.t,
                value:model.v
            });
            m.save(m,(err,sm)=>{
                if(err){
                return callback(err);
            }else{
                callback(null,sm);
            }
            });
        }else{
            blogcontext.Category.findByIdAndUpdate(model.id,{
            diaplay:model.t,
            value:model.v
        },(err,m)=>{
            if(err){
                return callback(err);
            }else{
                callback(null,m);
            }
        });
        }
    },
    removeCategory:function(id,callback){
        blogcontext.Category.findOneAndRemove({'_id':id},(err)=>{
           if(err){
               return callback(err);
           } else{
               callback(null);
           }
        });
    },
    upsertTag:function(model,callback){
        if(!model.id){
            var m = new blogcontext.Tag({
                display:model.t,
                value:model.v
            });
            m.save(m,(err,sm)=>{
                if(err){
                return callback(err);
            }else{
                callback(null,sm);
            }
            });
        }else{
            blogcontext.Tag.findByIdAndUpdate(model.id,{
            diaplay:model.t,
            value:model.v
        },(err,m)=>{
            if(err){
                return callback(err);
            }else{
                callback(null,m);
            }
        });
        }
    },
    removeTag:function(id,callback){
        blogcontext.Tag.findOneAndRemove({'_id':id},(err)=>{
           if(err){
               return callback(err);
           } else{
               callback(null);
           }
        });
    },
    getAllTags:function(callback){
        blogcontext.Tag.find({},(err,tags)=>{
           if(err){
               return callback(err);
           } else{
               callback(null,tags);
           }
        });
    },
    getAllCategories:function(callback){
        blogcontext.Category.find({},(err,categories)=>{
           if(err){
               return callback(err);
           } else{
               callback(null,categories);
           }
        });
    }
};