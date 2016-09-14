'use strict';
const child_process = require('child_process')
const email = require('emailjs');
//generator compressed file
child_process.execFile("compress.bat",
    null,
    { cwd: 'C:\\backandemail' },
    (err, stdout, stderr) => {
        console.log(stdout);
        console.log(stderr);
        sendEmail(err);
    });

function sendEmail(err) {
    var time = (new Date()).toLocaleString();
    var content = { subject: "备份成功" + time, text: '每日数据备份' };

    //send email
    var server = email.server.connect({
        user: "xdlysk@163.com",
        password: "wb_wow159",
        host: "smtp.163.com",
        ssl: true
    });

    var message = {
        from: "blogback <xdlysk@163.com>",
        to: "xdlysk <xdlysk@live.cn>"
    };

    if (err) {
        content.subject = "备份出错" + time;
        content.text = err.message;
    } else {
        message.attachment =
            [
                { path: "C:/db/back/blog/backup.7z", type: "application/7z", name: "backup.7z" }
            ];
    }
    message.text = content.text;
    message.subject = content.subject;

    // send the message and get a callback with an error or details of the message that was sent
    server.send(message, function(err, message) { console.log(err || message); });
}
