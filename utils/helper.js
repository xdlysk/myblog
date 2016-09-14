'use strict';
var crypto = require('crypto');

// 对Date的扩展，将 Date 转化为指定格式的String   
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，   
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)   
// 例子：   
// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423   
// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18   
Date.prototype.format = function (fmt) { //author: meizz   
    var o = {
        "M+": this.getMonth() + 1,                 //月份   
        "d+": this.getDate(),                    //日   
        "h+": this.getHours(),                   //小时   
        "m+": this.getMinutes(),                 //分   
        "s+": this.getSeconds(),                 //秒   
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度   
        "S": this.getMilliseconds()             //毫秒   
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

module.exports = {
    encrypt: function (str, secret) {
        var cipher = crypto.createCipher('aes192', secret);
        var enc = cipher.update(str, 'utf8', 'hex');
        enc += cipher.final('hex');
        return enc;
    },
    decrypt: function (str, secret) {
        var decipher = crypto.createDecipher('aes192', secret);
        var dec = decipher.update(str, 'hex', 'utf8');
        dec += decipher.final('utf8');
        return dec;
    },
    removeHtmlTags:function(str){
        return str.replace(/<[^>]+>/g,'');
    },
    getLastDateOfMonth:function(time){
        var fixday = [31,28,31,30,31,30,31,31,30,31,30,31];
        var month = time.getMonth();
        if(month!==1){
            return fixday[month];
        }
        var year = time.getFullYear();
        if ((year % 400 == 0 && year % 3200 != 0)|| (year % 4 == 0 && year % 100 != 0)|| (year % 3200 == 0 && year % 172800 == 0)){
            return 29;
        }
        return 28;
    },
    getCalendar:function(time){
        var monthbegin = new Date();
        monthbegin.setTime(Date.parse(time.format("yyyy-MM-01 00:00:00")));
        var lastDay = this.getLastDateOfMonth(monthbegin);
        var weekday = monthbegin.getDay();
        var calendar = [];
        if(weekday!==0){
            calendar.push({
            date:'',
            colspan:weekday,
                count:0
            })
        }
        
        for(let i = 1;i<=lastDay;i++){
            calendar.push({
                date:i,
                colspan:1,
                count:0
            });
        }
        //尾部
        var length = lastDay + weekday +1 ;
        var mod = length % 7;
        if(mod!==0){
            calendar.push({
                date:'',
                colspan:7-mod,
                count:0
            })
        }
        return calendar;
    }
};