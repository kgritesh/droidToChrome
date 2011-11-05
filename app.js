var express = require('express'),
    cradle = require('cradle');

var app = express.createServer(express.bodyParser());
var conn = new(cradle.Connection)();
var db = conn.database('users');

app.use(express.logger());

app.get('/', function(req, res){
    res.send("Hello World");
});

app.post('/register', function(req, res){
    var data = req.body;
    console.log(data);
    db.get(data.username, function(err, doc) {
    res.contentType('json');
    if(doc) {
	res.send({success: false, error: 'User already exists' });
    } else {
      delete data.confirm_password;
      db.save(data.username, data, function(db_err, db_res) {
	    res.send({success:True});
      });
    }
  });
});

app.listen(3000);