var commentModel = {
    articleId:String,
    content:String,
    poster:String,
    email:String,
    postTime:{type:Date,default:Date.now},
    display:{type:Boolean , default:true}
};

module.exports = commentModel;