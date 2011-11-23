var cradle = require('cradle'),
constants = require('../constants'),
conn = new(cradle.Connection)(constants.COUCH_SERVER, constants.COUCH_PORT ,
			      {cache: true}),
db_users = conn.database('users'),
devices = require('./devices'),
couch_views = require('../couch_views'),
dbhelper = require('./db_helper');

/*Intialize the user model by creating database and views if they don't exists*/
exports.init = function(){
    dbhelper.findOrCreateDB(db_users, couch_views.users_design_doc);
}

/* A function that initialized user */
exports.register = function(username, password, done){
  db_users.view('users/usermap', {key: username}, function(err, docs) {
    //Check if user already exists
    if(docs.length > 0) {
      var errmsg = "User " + username  + " already exists";
      console.log(errmsg);
      done(errmsg, null);
    }
    else {
      //Create new password
      var salt = utils.randomString(constants.SALT_LENGTH);
      password = utils.converthash(password, salt);
      db_users.save({username: username,
		     password: password,
		     device_array:[]
		    },
	function(db_users_err, db_users_res) {
	  if(db_users_res.ok){
	    //If user is registered successfully than send the user id
	    console.log("New user " + username + " registered");
	    done(null, {user_id: db_users_res.id});
	  }
	  else{
	    console.log("Error while registering a new user " + username, err);
	    done(err);
	  }
      });
    }
  });
};

/*
A method that tries to authenticate user given his username and password
*/
exports.login = function(username, password, done){
  db_users.view('users/usermap', {key: username}, function(err, docs) {
    //Check if username exists
    if(docs.length > 0){
      doc = docs[0].value;
      //Verify password
      utils.verify_password(password, doc.password, function(flag){
	if (flag){
	  console.log("Password Matched. User " + username + " is logged in");
	  done(null, doc);
	}
	else {
	  var errmsg = "Invalid Username/Password";
	  console.log(errmsg);
	  done(errmsg, null);
	}

      });
    }
    else{
      var errmsg = "No user exists with given username " + username;
      console.log(errmsg);
      done(errmsg, null);
    }
  });
};

/*
Add the device to the user's device array if it doesn't exists and also add it
to the device table. Returns the device id in the device table
*/
exports.findOrAddDevice  = function(doc, devicename, done){
  device_array = doc.device_array.length > 0 ? doc.device_array : [];
  //Check if device already exists
  if(device_array.indexOf(device_name) == -1){
    //Add a new device to the user as well as the devices table
    device_array.push(device_name);
    db_users.merge(doc._id, {"device_array": device_array}, function(err, resp){
      if(resp.ok){
	devices.findOrAddDevice(doc._id, device_name, done);
      }
      else {
	console.log("Error while saving device " + device_name, err);
	done(err, null);
      }

    });
  }
}

/*
Returns a list of devices for the given user, in addition to broadcast
*/
exports.getDevicesList = function(user_id, done){
  db_users.get(user_id, function(err, doc){
    if(doc){
      var device_array = doc.device_array;
      device_array.push("Broadcast");
      console.log("Returning Device Array for the user " + doc.username,
		  device_array);

      done(null, {device_array: device_array});
    }
    else{
      console.log("Invalid Authentication " + user_id );
      done(err, null);
    }
  });
};