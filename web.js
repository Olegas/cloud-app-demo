var db = "mongodb://heroku:fa7056b1616dc231badddde339ad2dc3@alex.mongohq.com:10042/app9488681";
var bucket = "static.imageshare.elifantiev.ru";

var request = require("request");
var fs = require('fs');
var express = require('express');
var connect = require('connect');
var knox = require('knox');
var path = require('path');

var client = knox.createClient({
   key: 'AKIAI6RJ6XPKER5IWNIQ'
   , secret: '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'
   , bucket: bucket
});

var app = express.createServer();

app.configure(function(){
   app.use(connect.middleware.multipart());
});

app.listen(process.env.PORT || 3000);


app.get('/', function(req, res){
   fs.readFile(path.join(__dirname, 'views', 'index.html'), function(e, d){
      if(e)
         res.send(404);
      else
         res.send(d.toString());
   });
});

app.post("/putfile", function(req, res){
   if(res) {
      res.send(req.files && Object.keys(req.files).toString())
   } else {
      res.send(500);
   }
});


  /*
client.putFile('file.txt', '/file.txt', { 'x-amz-acl': 'public-read' }, function(e, r){
   console.log(e || r);
   process.exit();
}); */