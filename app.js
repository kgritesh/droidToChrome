//Variables Declaration

var express = require('express'),
app = express.createServer(),
cradle = require('cradle'),
constants = require('./constants'),
conn = new(cradle.Connection)(constants.COUCH_SERVER, constants.COUCH_PORT ,
			      {cache: true}),
db_users = conn.database('users'),
db_devices = conn.database('devices'),
crypto = require('crypto')
io = require('socket.io').listen(app),
dbhelper = require('./db_helper'),
couch_views = require('./couch_views');

//Common configuration for all environments
app.configure(function(){
    app.use(express.logger());
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.session({ secret: constants.SECRET }));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

//Create DB, design docs and views if not exists
dbhelper.create_db(db_users, couch_views.users_design_doc);
dbhelper.create_db(db_devices, couch_views.devices_design_doc);


// Routes
app.get('/', function(req, res){
    res.send("Currently This Api is Not Supported");
});

//Register A New User
app.post('/register', function(req, res){
    var data = req.body;
    console.log("Registration Json Data");
    console.log("data");
    res.contentType('application/json');
    db_users.view('users/usermap', {key: data.username}, function(err, docs) {
      if(docs.length > 0) {
	console.log("User Already Exists. Registration Failed");
	res.send({success: false, error: 'User already exists' });
    } else {
	delete data.confirm_password;
	data.password = converthash(data.password, randomString(10));
	data.device_array = []
	console.log(data.password)
	db_users.save(data , function(db_users_err, db_users_res) {
	    if(db_users_res.ok){
		req.session.is_authenticated = true;
		req.session.user = data.usern;
		console.log("User Registered " + db_users_res.id);
		res.send({"success":true, "user_id": db_users_res.id});
	    }
	    else{
		console.log("User Registeration Failed " + err);
		res.send({"success":false, "error": err});
	    }
      });
    }
  });
});

app.post("/pc/login", function(req, res){
    var data = req.body;
    console.log("PC Login");
    console.log(data);
    res.contentType('application/json');
    db_users.view('users/usermap', {key: data.username}, function(err, docs) {
	console.log(docs);
	if (docs.length > 0){
	    doc = docs[0].value;
	    password = doc.password;
	    console.log(doc);
	    verify_password(data.password, password, function(match){
		if(match){
		    device_name = data.device_name;
		    if(doc.device_array){
			device_array = doc.device_array;
		    }
		    else{
			device_array = [];
		    }
		    if(device_array.indexOf(device_name) == -1){
			device_array.push(device_name);
                        db_users.merge(doc._id, {"device_array": device_array},
				function(err, res){
				     console.log(err);
                                     console.log(res);
		        });
			device_row = {"user_id": doc._id, "device": device_name}
			db_devices.save(device_row, function(err, resp){
			    console.log(resp);
			    if(resp.ok){
				req.session.is_authenticated = true;
				req.session.username = data.username;
				res.send({"success":true, "uuid": resp.id});
				console.log("Created New Device");
			    }
			    else{
				req.session.is_authenticated = false;
				res.send({"success":false, "error": err});
				console.log("Unable to Save New Device");
			    }
			});
                    }
		    else{
			var dev_key = doc._id + "$" + device_name;
			console.log(dev_key);
			db_devices.view('devices/devicemap', {key: dev_key},
                        function(err, docs) {
			    if(docs.length > 0){
				doc = docs[0].value;
				req.session.is_authenticated = true;
				req.session.username = data.username;
				res.send({"success":true, "uuid": doc._id});
				console.log("Returned Existing device");
			    }
			    else{
				req.session.is_authenticated = false;
				res.send({"success":false, "error": err});
				console.log("Success False");
				console.log(err);
			    }
			});
		    }
		}
		else{
		    req.session.is_authenticated = false;
		    res.send({success: false, error: 'Password Didnt Match' });
		}
	    });
	}
	else{
	    res.send({success: false, error: "Username Doesn't Exist"});
	}
    });

});


app.post('/login', function(req, res){
    var data = req.body;
    console.log(data);
    res.contentType('json');
    db_users.view('users/usermap', {key: data.username}, function(err, docs) {
	if (docs.length > 0){
	    doc = docs[0].value;
	    password = doc.password;
	    verify_password(data.password, password, function(match){
		if(match){
		    req.session.is_authenticated = true;
		    req.session.username = data.username;
		    res.send({"success":true, "user_id": doc._id});
		}
		else{
		    req.session.is_authenticated = false;
		    res.send({success: false, error: 'Password Didnt Match' });
		}
	    });
	}
	else{
	    data.password = converthash(data.password, randomString(10));
	    data.device_array = []
	    console.log(data.password)
	    db_users.save(data , function(db_users_err, db_users_res) {
		if(db_users_res.ok){
		    req.session.is_authenticated = true;
		    req.session.user = data.usern;
		    res.send({"success":true, "user_id": db_users_res.id});
		}
		else{
		    res.send({"success":false, "error": err});
		}
	    });
	}
    });
});


app.post("/get_devices", function(req, res){
    user_id  = req.body.user_id;
    db_users.get(user_id, function(err, doc){
	if(doc){
	    res.send({"success": true, "devices": doc.device_array});
	}
	else{
	    res.send({success: false, error: "User ID Doesn't exist. Please Login "});
	}
    })
});


app.post('/share', function(req, res){
    device_name = req.body.device_name
    key = req.body.user_id + "$" + device_name;
    console.log(key);
    link = req.body.url;
    console.log(link)
    socket = sockets_hash[key];
    if(socket){
	socket.emit("urls", {"url" : link});
	console.log("Emitted Link");
	res.send({"success":true});
    }
    else{
	res.send({"success":false});
    }
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

sockets_hash = {}

io.sockets.on('connection', function (socket) {
  socket.on('auth', function (data) {
      console.log("Inside Sockets");
      console.log(data);
      uuid = data.uuid;
      device_name = data.device_name;
      db_devices.get(uuid, function(err, doc){
	  if(doc){
	      var key = doc.user_id + "$" + doc.device;
	      console.log("Socket Key is " + key);
	      if(sockets_hash[key]){
		  console.log("Closing old socket");
		  sockets_hash[key].emit("disconnect");
	      }
	      sockets_hash[key] = socket;
	  }
	  else{
	      socket.emit("error", {"error": "The device is not authorized"});
	  }

      });
  });
});

app.listen(8080);