var articleModel = {
    source:{type:String,default:'原创'},//原创，转载。。。
    title:String,
    partialUrl:String,
    content:String,
    state:{type:Number,default:0},//0,草稿；1，待审核；2，已发布
    postTime:{type:Date,default:Date.now},
    updateTime:{type:Date,default:Date.now},
    poster:String,
    updator:String,
    tags:[],
    categories:[],
    read:{type:Number,default:0},
    comment:{type:Number,default:0},
    keywords:String,
    description:String
};

module.exports = articleModel;