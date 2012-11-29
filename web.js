var db = "mongodb://USER:PASSWORD@HOSTNAME.mongohq.com:PORT/DATABASEID";
var bucket = "s3.bucket.name";
var amazonAPIKey = "AMAZONAPIKEYNAME";
var amazonSecretKEy = "MySecretAmazonKey";

var fs = require('fs');
var express = require('express');
var connect = require('connect');
var knox = require('knox');
var path = require('path');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * Заранее прочитаем все "шаблоны" страниц
 */
var indexTemplate = fs.readFileSync(path.join(__dirname, 'views', 'index.html')).toString();
var imageTemplate = fs.readFileSync(path.join(__dirname, 'views', 'imageready.html')).toString();

mongoose.connect(db);

/**
 * "Модель" данных для MongoDB
 */
var ImageItem = mongoose.model('image', new Schema({
   number: Number,
   realname: String
}));

/**
 * Клиент для S3
 */
var s3Client = knox.createClient({
   key: amazonAPIKey,
   secret: amazonSecretKEy,
   bucket: bucket
});

var app = express.createServer();

app.configure(function(){
   app.use(connect.middleware.multipart());
});

/**
 * Показывает "индексную" страницу
 */
app.get('/', function(req, res){
   res.send(indexTemplate);
});

/**
 * Обрабатывает "короткие" ссылки
 */
app.get('/i/:num', function(req, res){
   ImageItem.find({ number: req.params.num }, function(err, docs){
      if(err)
         res.send(500, err);
      else {
         res.redirect('http://' + bucket + "/" + docs[0].realname);
      }
   })
});

/**
 * Обрабатывает POST-запрос с файлом
 */
app.post("/putfile", function(req, res){
   if(res) {
      if(req.files && req.files.pic) {
         // Загрузим файл
         s3Client.putFile(req.files.pic.path, req.files.pic.name, { 'x-amz-acl': 'public-read' }, function(e, r){
            if(e)
               res.send(500, e);
            else {
               // Если все в порядке, сохраним инфррмацию о файле в MongoDB
               var i = new ImageItem();
               // Генерируем "уникальный" идентификатор
               i.number = +new Date();
               i.realname = req.files.pic.name;
               i.save(function(e){
                  if(e) {
                     res.send(500, e);
                  } else {
                     // Когда инфррмация сохранена - выводим страничку с короткой ссылкой
                     res.send(imageTemplate.replace(/%NUM%/g, i.number));
                  }
               });
            }
         });
      } else {
         res.send(500, "No file to upload");
      }
   } else {
      res.send(500);
   }
});

app.listen(process.env.PORT || 3000);
console.log("App listening on port " + (process.env.PORT || 3000));