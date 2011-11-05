var express = require('express'),
    cradle = require('cradle');

var app = express.createServer(express.bodyParser());
var conn = new(cradle.Connection)();
var db = conn.database('users');
var crypto = require('crypto');

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
	console.log(data);
	res.send({success: false, error: 'User already exists' });
    } else {
	delete data.confirm_password;
	data.password = converthash(data.password, randomString(10));
	console.log(data.password)
	db.save(data.username, data , function(db_err, db_res) {
	    res.send({success:true});
      });
    }
  });
});

app.post('/login', function(req, res){
    var data = req.body;
    console.log(data);
    res.contentType('json');
    db.get(data.username, function(err, doc) {
	if (doc){
	    password = doc.password;
	    verify_password(data.password, password, function(match){
		if(match){
		    res.send({success:true});
		}
		else{
		    res.send({success: false, error: 'Password Didnt Match' });
		}
	    });
	}
	else{
	    res.send({success: false, error: "Username Doesn't Exist"});
	}
    });
});


function verify_password(password, hash, callable){
    var salt = hash.split("$")[1];
    var hash_pass = converthash(password, salt);
    if(hash_pass == hash)
	callable(true)
    else
	callable(false)
}

function converthash(text, salt){
    var hash = crypto.createHmac('sha1', salt).update(text).digest('hex');
    return hash + "$" + salt;
}

function randomString(len){
    var randomStr = ""
    var charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < len; i++) {
        var randomPoz = Math.floor(Math.random() * charSet.length);
        randomStr += charSet.substring(randomPoz, randomPoz+1);
    }
     return randomStr;
}



app.listen(3000);