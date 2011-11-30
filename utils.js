var crypto = require('crypto');

exports.convert_hash = function(text, salt){
    var hash = crypto.createHmac('sha1', salt).update(text).digest('hex');
    return hash + "$" + salt;
}

exports.randomString = function(len){
    var randomStr = ""
    var charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'                   ;
    for (var i = 0; i < len; i++) {
        var randomPoz = Math.floor(Math.random() * charSet.length);
        randomStr += charSet.substring(randomPoz, randomPoz+1);
    }
    return randomStr;
}


exports.verify_password = function (password, hash, callable){
    var salt = hash.split("$")[1];
    var hash_pass = converthash(password, salt);
    if(hash_pass == hash)
	callable(true)
    else
	callable(false)
};

exports.get_uuid= function(user_id, device_name) {
    return "{0}${1}".format(user_id, device_name);
};

/*
A utility function to send response for all the requests. In case of
error send the error message, else send the appropriate response as
the attribute of the response object
*/
exports.sendUserAuthResponse = function(errordic, response)
  res.contentType('application/json');
  if(err)
    res.send({"success":false, "error": err});
  else {
    res.send({"success":false, "response": response});
  }
});

