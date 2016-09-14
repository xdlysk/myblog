var express = require('express');
var formidable = require('formidable');
var config = require('../../utils/config');
var fs = require('fs');
var path = require('path');
var router = express.Router();

router.get('/upload', (req, res, next) => {
    var query = req.query;
    var dirName = query.dir,
        qpath = query.path;
    var dirPath = config.admin.uploadConfig.uploadDir;
    var rootUrl = '/upload/';
    if (dirName) {
        if (config.admin.uploadConfig.uploadSubDirs.indexOf(dirName) < 0) {
            res.send('no such dir');
            res.end();
        }
        dirPath += dirName + "/";
        rootUrl += dirName + "/";
    }

    var moveupDirPath = "",
        currentDirPath = "",
        currentPath = dirPath,
        currentUrl = rootUrl;
    if (qpath) {
        currentDirPath = qpath;
        moveupDirPath = currentDirPath.replace(/(.*?)[^\/]+\/$/, "$1");
        currentPath = dirPath + qpath;
        currentUrl = rootUrl + qpath;
    }

    var ret = {
        moveup_dir_path: moveupDirPath,
        current_dir_path: currentDirPath,
        current_url: currentUrl
    };

    var _dirPath = path.join(currentPath);
    fs.readdir(_dirPath, (err, files) => {
        if (err) {
            res.send(err.message);
            res.end();
            return;
        }
        var dirFileList = [];
        var count = 0;
        files.forEach(x=> {
            var s = fs.statSync(path.join(_dirPath, x));
            if (s.isFile()) {
                dirFileList.push({
                    is_dir: false,
                    has_file: false,
                    filesize: s.size,
                    is_photo: /(gif|jpe?g|png|bmp)/.test(x),
                    filetype: path.extname(x).substr(1),
                    filename:x,
                    datetime:s.mtime
                });
                count++;
            } else if (s.isDirectory()) {
                dirFileList.push({
                    is_dir: true,
                    has_file: true,
                    filesize: 0,
                    is_photo: false,
                    filetype: '',
                    filename: x,
                    datetime:s.mtime
                });
                count++;
            }
        })
        ret.total_count = count;
        ret.file_list = dirFileList;
        res.json(ret);
    })

});

router.post('/upload', (req, res, next) => {
    var dir = req.query.dir;
    if (!dir) {
        res.send(500, { message: '' });
        res.end();
    }
    var yearmonth = new Date().format('yyyyMM');
    var uploadPath = path.join(config.admin.uploadConfig.uploadDir, dir, yearmonth);

    var callback = () => {
        var form = new formidable.IncomingForm();
        form.enableRename = false;
        form.uploadDir = uploadPath;
        form.maxFieldSize = config.admin.uploadConfig.maxFieldSize;
        form.keepExtensions = config.admin.uploadConfig.keepExtensions;
        form.parse(req, (err, fields, file) => {
            var ret;
            if (err) {
                ret = { error: 1, message: err.message };
            } else {
                ret = { error: 0, url: file.imgFile.path.replace(/^public/i, '') };
            }
            res.json(ret);
            res.end();
        });
    };

    fs.stat(uploadPath, (err,stats)=> {
        if (err) {
            fs.mkdir(uploadPath, callback)
        } else {
            callback();
        }
    })

});

module.exports = router;