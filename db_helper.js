exports.findOrCreateDB = function(db, design_doc){
    //Create a new db if it not exists
    db.exists(function (err, exists) {
	if (err) {
	    console.log('Some Error While db.exists', err);
	} else if (exists) {
	    console.log("Database Already Exists", db.info());
	} else {
	    db.create(function(error, res){
		if res.ok {
		    console.log("New Database Created", db.info());
		    /* populate design documents */
		    db.save(design_doc);
		} else {
		    console.log("Error Occured While creating db", err)
		}


	    });
	}
    });

};
