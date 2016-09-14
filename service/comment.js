const blogcontext = require('../utils/blogcontext');
module.exports = {
    getManageCommentsByArticleId:(id,callback)=>{
        blogcontext.Comment.find({'articleId':id})
        .sort({'postTime':-1})
        .select({'comment':0})
        .exec((err,comments)=>{
            if(err){
                return callback(err);
            }else{
                callback(null,comments);
            }
        });
    },
    getCommentsByArticleId:(id,callback)=>{
        var criteria={
            'articleId':id,
            'display':true
        };
        blogcontext.Comment.find(criteria)
        .sort({'postTime':-1})
        .exec((err,comments)=>{
            if(err){
                return callback(err);
            }else{
                callback(null,comments);
            }
        });
    },
    addComment:(model,callback)=>{
        blogcontext.Article.findById(model.articleId,(err,article)=>{
            if(err){
                return callback(err);
            }
            if(!article){
                return callback({message:'不存在此Id的文章'});
            }
            var m = new blogcontext.Comment({
                articleId:model.articleId,
                comment:qs.escape(model.comment),
                author:model.author,
                email:model.email,
                url:model.url
            });
            m.save(m,(err,sm)=>{
                if(err){
                    return callback(err);
                }else{
                    callback(null,sm);
                }
            });
        })
    }
};