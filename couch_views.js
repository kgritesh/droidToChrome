exports.devicemap = {
    map : function(doc) {
	if(doc.device && doc.user_id) {
	    key = doc.user_id + "$" + doc.device;
	    emit(key, doc);
	}
    }
};

exports.usermap = {
    map : function(doc) {
	if(doc.username && doc.password) {
	    emit(doc.username, doc);
	}
    }
};

exports.users_design_doc = {
    _id : "_design/users",
    language: "javascript",
    views: {
	usermap: exports.usermap
    }
}


exports.devices_design_doc = {
    _id : "_design/devices",
    language: "javascript",
    views: {
	devicemap: exports.devicemap
    }
}

