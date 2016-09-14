var articleModel = {
    source:{type:String,default:'原创'},//原创，转载。。。
    title:String,
    content:String,
    summary:String,
    state:{type:Number,default:0},//0,草稿；1，待审核；2，已发布
    postTime:{
        time:Number,
        y:Number,
        M:Number,
        d:Number
    },
    updateTime:Number,
    poster:String,
    updator:String,
    tags:[{
        v:String,
        t:String
    }],
    categories:[{
        v:String,
        t:String
    }],
    read:{type:Number,default:0},
    comment:{type:Number,default:0}
};

module.exports = articleModel;