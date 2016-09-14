rem 在c:/db/back目录中生成数据备份文件
"C:/Program Files/MongoDB/Server/3.2/bin/mongodump.exe" -d blog -o c:/db/back
rem 删除原来的备份压缩文件
del "C:\db\back\blog\backup.7z"
rem 调用7z生成新的备份文件
"C:/Program Files (x86)/7-Zip/7z" a c:/db/back/blog/backup.7z c:/db/back/blog/*.*