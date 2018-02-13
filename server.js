var express = require('express');
var app = express();
var mongodb = require('mongodb')
var ObjectId = require('mongodb').ObjectID;
var server = require('http').Server(app);
var io = require('socket.io')(server);
var https = require('https')
server.listen(process.env.PORT,function () {
  console.log('Your app is listening on port ' + process.env.PORT);
});

app.use(express.static('myApp'));

app.get("/", function (req, res) {
  res.sendFile(__dirname + '/index.html');
});
app.get("/ping", function (req, res) {
  io.emit('test', 'ping')
  res.end();
});

setInterval(() => {
  https.get('https://stockmarket.glitch.me/ping')
}, 280000)

setInterval(() => {
  mongodb.connect(process.env.MONGODB, function(err, client) {
    if (err) {console.log(err)}
    var db = client.db("stockmarket")
    var collection = db.collection('saved')
    collection.find({}).toArray(function(err, data){       
      if (err) throw err;
      var joined = []
      var i = 0;
      setInterval(() => {
        if (i <= data.length-1){
          getNewData(data[i])
          i++;
        }       
      }, 2000)
      function getNewData(savedCode){
        var d = new Date();
        var start_date = (d.getDate())+"-"+(d.getMonth()+1)+"-"+(d.getFullYear()-2)
        var end_date = d.getDate()+"-"+(d.getMonth()+1)+"-"+(d.getFullYear())
        var url = "https://www.quandl.com/api/v3/datasets/WIKI/"+savedCode.code+".json?column_index=4&start_date="+start_date+"&end_date="+end_date+"&api_key="+process.env.APIKEY
        https.get(url, function(response) {
          var results = ""
          response.setEncoding("utf8");
          response.on('data', function (data) {
            results += data;
          });
          response.on('end', () => {
            results = JSON.parse(results)
            if (results.quandl_error){  
            } else {
              console.log('updated')             
              collection.update({code: savedCode.code}, {code: savedCode.code, snippet: savedCode.snippet, data: results.dataset.data, input: false, date:  d.toUTCString()})
            }
          })
        })
      }
    })
  })
}, 20*60*1000);

mongodb.connect(process.env.MONGODB, function(err, client) {
  if (err) {console.log(err)}
  var db = client.db("stockmarket")
  var collection = db.collection('saved')
  io.on('connection', function (socket) {
    socket.emit('draw', 'getOld')
    socket.on('code', function (data) {
      var code = data.code     
      collection.find({code : code}).toArray(function (err, data){       
        if (err) throw err;       
        if (data.length >=1){         
          socket.emit('err', {error : "A code can only be added once."})       
        } else if (data. length >= 10) {
          socket.emit('err', {error : "Limit of 10 maximum codes."})
        } else {
          var d = new Date();
          var start_date = (d.getDate())+"-"+(d.getMonth()+1)+"-"+(d.getFullYear()-2)
          var end_date = d.getDate()+"-"+(d.getMonth()+1)+"-"+(d.getFullYear())
          var checkUrl = "https://www.quandl.com/api/v3/datasets/WIKI/"+code+".json?column_index=4&start_date="+start_date+"&end_date="+end_date+"&api_key="+process.env.APIKEY
          https.get(checkUrl, function (response){           
            var results = ""           
            response.setEncoding("utf8");           
            response.on('data', function (data) {             
              results += data;           
            });           
            response.on('end', () => {             
              results = JSON.parse(results)
              if (results.quandl_error){    
                console.log(results)
                socket.emit("err", {error: "Incorrect or not existing stock code"})             
              } else {               
                collection.insert({code : code, snippet : results.dataset.name, data : results.dataset.data, input: false})               
                io.emit("draw", "draw")             
              }
            })
          })
        }
      })
    })
    socket.on('get', function (data) {
      var type = data
      collection.find({}).toArray(function(err, data){       
        if (err) throw err;
        var joined = []
        var i = 0;
        if (data.length === 0) {socket.emit("data", joined)}
        else {
          if (type === "getNew"){
            io.emit("data", data)
          } else if (type === "getOld"){
            socket.emit("data", data)
          }
        }
      })
    });
    socket.on('delete', function(data){
      collection.remove({code: data}, function(err, data){
        if (err)
          console.log(err)
      })
      collection.find({}).toArray(function(err, data){
        if (err)
          console.log(err)
        io.emit("data", data)
      })
    });
  })
})