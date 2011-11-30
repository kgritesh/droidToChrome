var io = require('socket.io'),
devices = require('./models/devices'),
//A dictonary of open sockets to browsers
socket_hash = {};

/* Creates a socket listener. For each incoming auth request via socket, stores
the {user_id+$+device_name: socket} in a hash map, so that when a share request
comes for that particular user and the device, it is sent across that socket to
the appropriate device */
exports.init = function(app){
  io.listen(app);
  io.sockets.on('connection', function (socket) {
    socket.on('auth', function (data) {
      console.log("Received an authorization request", data);
      uuid = data.uuid;
      db_devices.get(uuid, function(err, doc){
	  if(doc){
	      var key = doc.user_id + "$" + doc.device;
	      if(!sockets_hash[key]){
		socket_hash[key] = [];
	      }
	    sockets_hash[key].push(socket);
	    //TODO: Send Stored Links
	  }
	  else{
	      socket.emit("error", {"error": "The device is not authorized"});
	  }

      });
    });
  });
};

/* Get the correct socket using the key and emit the link to the appropriate
device */
exports.share_link = function(key, url, done){
  var socket = socket_hash[key];
  if(socket){
    socket.emit("share_link", {"url": url});
    done(null, {msg: "Link shared successfully"});
  }
  else{
    //TODO: Save in the couchdb to be sent later
    done(null, {msg: "Link saved. Device not online currently"});
  }
}