var commentModel = {
    articleId:String,
    comment:String,
    author:String,
    email:String,
    url:String,
    deal:{type:Boolean , default:false},
    postTime:{type:Date,default:Date.now},
    display:{type:Boolean , default:false}
};

module.exports = commentModel;