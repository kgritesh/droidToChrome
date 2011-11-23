//Variables Declaration

var express = require('express'),
app = express.createServer(),
cradle = require('cradle'),
constants = require('./constants'),
users = require('./models/users'),
devices = require('./models/devices')
db_devices = conn.database('devices'),
io = require('socket.io').listen(app),
dbhelper = require('./db_helper'),
utils = require('./utils');

//Initialize the models
users.init();
devices.init();

//Adding prototype functions

/* Providing sprintf like string formatting */
String.prototype.format = function() {
  var args = arguments;
  return this.replace(/{(\d+)}/g, function(match, number) {
    return typeof args[number] != 'undefined'
      ? args[number]
      : match
    ;
  });
};



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


// Routes
app.get('/', function(req, res){
  res.send("Currently This Api is Not Supported");
});

//Register A New User
app.post('/register', function(req, res){
  var data = req.body;
  console.log("Registeration Request", data);
  users.registerUser(data.username, data.password, utils.sendUserAuthResponse);
});

/*
A post request to login user from the chrome extension
*/
app.post("/login/extension/", function(req, res){
  var data = req.body;
  console.log("Extensions Login ", data);

  //verify user credentials
  user.login(data.username, data.password , function(error, doc){
    if (error) {
      res.contentType('application/json');
      res.send({"success":false, "error": err});
    }
    else{
      //Find or add a new device with the provided device name. Respond with the
      //device id of the device from the device table
      user.findOrAddDevice(doc, data.device_name, utils.sendUserAuthResponse);
    }
  });
});

/*
A post request to login user from the mobile app
*/
app.post('/login', function(req, res){
  var data = req.body;
  console.log("Extensions Login ", data);
  //verify user credentials
  user.login(data.username, data.password , utils.sendUserAuthResponse);
});

/*
A request to get the entire device list
*/
app.post("/get/devices-list", function(req, res){
  var data = req.body();
  users.getDevicesList(data.user_id, utils.sendUserAuthResponse);
});


/*app.post("/get_devices", function(req, res){
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
*/
app.listen(8080);