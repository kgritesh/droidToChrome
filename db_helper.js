exports.create_db = function(db, design_doc){
    //Create a new db if it not exists
    db.exists(function (err, exists) {
	if (err) {
	    console.log('error', err);
	} else if (exists) {
	    console.log("Database Already Exists");
	} else {
	    db.create(function(error, res){
		console.log(res);
		console.log(error);
		console.log("New Database Created");
		/* populate design documents */
		db.save(design_doc, function(error, res){
		    console.log(res);
		    console.log(error);
		});

	    });
	}
  });

};
