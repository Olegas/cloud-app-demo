var db = "mongodb://test:test@alex.mongohq.com:10042/app9488681";
var bucket = "static.imageshare.elifantiev.ru";

var request = require("request");
var fs = require('fs');
var express = require('express');
var connect = require('connect');
var knox = require('knox');
var path = require('path');
var mongoose = require('mongoose');

mongoose.connect(db);

var Schema = mongoose.Schema;

var ImagesSchema = new Schema({
   number: Number,
   realname: String
});

var ImageItem = mongoose.model('image', ImagesSchema);


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

app.get('/i/:num', function(req, res){
   ImageItem.find({ number: req.params.num }, function(err, docs){
      if(err)
         res.send(500, err);
      else {
         res.redirect('http://' + bucket + "/" + docs[0].realname);
      }
   })
});

app.post("/putfile", function(req, res){
   if(res) {
      if(req.files && req.files.pic) {
         client.putFile(req.files.pic.path, req.files.pic.name, { 'x-amz-acl': 'public-read' }, function(e, r){
            if(e)
               res.send(500, e);
            else {
               var i = new ImageItem();
               i.number = +new Date();
               i.realname = req.files.pic.name;
               i.save(function(e){
                  if(e) {
                     res.send(500, e);
                  } else {
                     fs.readFile(path.join(__dirname, 'views', 'imageready.html'), function(e, r){
                        if(e)
                           res.send(500, e);
                        else
                           res.send(r.toString().replace(/%NUM%/g, i.number));
                     });
                  }
               });
            }
         });
      } else {
         // TODO no file uploaded!
      }
   } else {
      res.send(500);
   }
});


  /*
 */