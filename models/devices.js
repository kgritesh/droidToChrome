var cradle = require('cradle'),
constants = require('../constants'),
conn = new(cradle.Connection)(constants.COUCH_SERVER, constants.COUCH_PORT ,
			      {cache: true}),
db_devices = conn.database('devices'),
couch_views = require('../couch_views'),
dbhelper = require('../db_helper');

/*Intialize the devices model by creating database and views if they don't exists*/
exports.init = function(){
    dbhelper.findOrCreateDB(db_devices, couch_views.devices_design_doc);
}

exports.findOrAddDevice = function(user_id, device_name, done){
  var device_id = utils.get_device_id(user_id, device_name);
  db_devices.get(device_id, function(err, doc){
    if(!doc){
      db_devices.save(device_id, {user_id: user_id, device_name: device_name},
      function(err, res){
      	if(res.ok){
      	  console.log("New device " + device_name + " added to device table. \
                       uuid = " + res.id);
      	  done(null, {uuid: res.id});
      	}
      	else{
      	  console.log("Some error while saving the device " + device_name + " in \
                       the device table. User id: " +  user_id, err);
      	  done(err, null);
      	}
      });
    }
    else{
      console.log("Device already exists");
      done(null, {uuid: doc.id});
    }
  });
};
