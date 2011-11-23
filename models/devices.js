var cradle = require('cradle'),
constants = require('../constants'),
conn = new(cradle.Connection)(constants.COUCH_SERVER, constants.COUCH_PORT ,
			      {cache: true}),
db_device = conn.database('devices'),
couch_views = require('../couch_views'),
dbhelper = require('./db_helper');

/*Intialize the devices model by creating database and views if they don't exists*/
exports.init = function(){
    dbhelper.findOrCreateDB(db_devices, couch_views.devices_design_doc);
}

exports.findOrAddDevice = function(user_id, device_name, done){
  device_row = {user_id: user_id, device_name: device_name};
  db_devices.save(device_row, function(err, res){
    if(resp.ok){
      console.log("New device " + device_name + " added to device table. id = "\
		  + uuid: res.id);
      done(null, {uuid: res.id});
    }
    else{
      console.log("Some error while saving the device " + device_name \
		  + " in the device table. User id: " +  user_id, err);
      done(err, null);
    }
  });
});
