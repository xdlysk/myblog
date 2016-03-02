//define user model
var userModel = {
    userName: String,
    passWord: String,
    regDate: { type: Date, default: Date.now },
    enable: { type: Boolean, default: true },
    level: { type: Number, default: 4 },
    displayName: String,
    meta: [{
        name: String,
        val: String
    }]
};

module.exports = userModel;