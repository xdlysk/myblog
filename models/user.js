//define user model
var userModel = {
    userName:String,
    passWord:String,
    niceName:String,
    regDate:Date,
    status:Number,
    displayName:String,
    meta:[{
        name:String,
        val:String
    }]
};

module.exports = userModel;