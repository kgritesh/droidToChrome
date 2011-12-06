//Variables Declaration
var express = require('express'),
app = express.createServer(),
cradle = require('cradle'),
constants = require('./constants'),
users = require('./models/users'),
devices = require('./models/devices')
sockethelper = require('./socket_helper');
dbhelper = require('./db_helper'),
utils = require('./utils');

//Initialize the models
users.init();
devices.init();

//Initialize the sockets
sockethelper.init(app);

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
  users.registerUser(data.username, data.password,
		     utils.sendUserAuthResponse(res));
});

/*
A post request to login user from the chrome extension
*/
app.post("/login/extension/", function(req, res){
  var data = req.body;
  console.log("Extensions Login ", data);

  //verify user credentials
  users.login(data.username, data.password , function(error, doc){
    if (error) {
      res.contentType('application/json');
      res.send({"success":false, "error": error});
    }
    else{
      //Find or add a new device with the provided device name. Respond with the
      //device id of the device from the device table
      users.findOrAddDevice(doc, data.device_name,
			   utils.sendUserAuthResponse(res));
    }
  });
});

/*
A post request to login user from the mobile app
*/
app.post('/login/mobile', function(req, res){
  var data = req.body;
  console.log("Extensions Login ", data);
  //verify user credentials
  users.login(data.username, data.password , function(error, doc){
    res.contentType('application/json');
    if (error) {
      res.send({"success":false, "error": error});
    }
    else{
      res.send({"success":true, "response": {user_id: doc._id} });
    }
  });
});

/*
A request to get the entire device list
*/
app.post("/get/devices-list", function(req, res){
  var data = req.body;
  users.getDevicesList(data.user_id, utils.sendUserAuthResponse(res));
});

/*
A post request to share a link
*/
app.post('/share/link', function(req, res){
  device_name = req.body.device_name
  key = req.body.user_id + "$" + device_name;
  link = req.body.url;
  console.log("Share the link " + link + " for the socket key " +  key);
  socket_helper.share_link(key, link, utils.sendUserAuthResponse(res));

});

app.listen(3000);