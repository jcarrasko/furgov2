/**
 * FurgoPerfectos Offline v2
 * Created by Jose Carrasco (@jcarrasko)
 */

var spotService = {};

spotService.db = {};
spotService.allSpots = {};
spotService.lastPosition = null;

/*
 * Options
 */
spotService.options = {
	offlineUrl: 'data/furgoperfectos.json',
	apiUrl: 'http://www.furgovw.org/api.php'
};


// type of spots

spotService.spotType = [
        'furgoperfecto',
        'area AC',
        'via verde',
        'otros', // not important
        'camping',
        'centro comercial',
        'otros' // few spots, no criteria
    ];



/*
 *Create the database
 */
spotService.initService = function () {

	// Database Stuff
	spotService.db = spotService.openDatabase();



	var spots = [];
	spotService.db.transaction(function (tx) {
		tx.executeSql('SELECT * FROM SPOTS ORDER BY name', [], function (tx, results) {
			if (results.rows.length > 0) {
				for (var i = 0; i < results.rows.length; i++) {
					id = results.rows.item(i)['id'];
					spots[i] = results.rows.item(i);
				}
			}

			// callback to the main function
			spotService.allSpots = spots;

		});
	}, function (err) {


		spotService.createDatabase();
		spotService.updateDatabaseFromSource();
	});



};
/*
 *Open the database
 */
spotService.openDatabase = function () {

	// Open Database
	var db = openDatabase('furgodb', '1.0', 'furgodb', 5 * 1024 * 1024);
	return db;

};


/*
 * Drop database ( if there's any schema change)
 */
spotService.dropDatabase = function () {


	spotService.db.transaction(function (tx) {
		tx.executeSql('DROP TABLE SPOTS');
	});

};

/*
 *Create the database
 */
spotService.createDatabase = function () {

	/*TODO remove from here, must go update
	spotService.db.transaction(function (tx) {
		tx.executeSql('DROP TABLE SPOTS');
	});*/

	// Creates the Database if no Exist
	spotService.db.transaction(function (tx) {


		//tx.executeSql("CREATE TABLE IF NOT EXISTS SPOTS ( id integer primary key,type integer,name text,latitude real,longitude real, distance integer, country string, area string, html text,htmlp text,link text,image text,author text,width integer,lenght integer,description text,id_member text, date text,topic_id integer, favourite integer)");

		tx.executeSql("CREATE TABLE IF NOT EXISTS SPOTS ( id integer primary key,type integer,name text,latitude real,longitude real, distance integer, link text,image text,author text,description text, favourite integer)");



	}, function (err) {
		console.log("spotService.Error Creating the database" + err.message);
	});

};



/*  
  / Updates the database
  */

spotService.updateDatabaseFromSource = function () {

	console.log("spotService. Its needed to update the Database from source");
	mapApiUrl = spotService.getJsonSource();


	// Querying the source

	$.ajaxSetup({
		scriptCharset: "utf-8",
		contentType: "application/json; charset=utf-8",
		async: false
	});


	$.getJSON(mapApiUrl, function (spots) {

		spotService.updateDatabase(spots, null);

	}, function (error) {

		//errors for all transactions are reported here
		console.log("Error updating DB");
		console.log("Error: " + error.message);

	});
};

/*
 * Updates the database with the list gived by the json call
 
 */

spotService.updateDatabase = function (jsonSpotList, callback) {

	spotService.db.transaction(function (tx) {

		var i;
		for (i in jsonSpotList) {
			var jsonSpot = jsonSpotList[i];

			var description = jsonSpot.destomtom;
			if (description === null) {
				description = "Sin descripción";
			}

			tx.executeSql("INSERT OR REPLACE INTO SPOTS (id,type, name, latitude, longitude, description,link,author,favourite) VALUES (?,?,?,?,?,?,?,?,?)", [jsonSpot.id, jsonSpot.icono, jsonSpot.nombre, jsonSpot.lng, jsonSpot.lat, description, jsonSpot.link, jsonSpot.author, 0]);

		}

		spotService.loadSpotsFromDatabase(callback);

	}, function (err) {
		console.log("spotService.Error updating the database: " + err.message);
	});

};


/*  
  / Gets the datasource depending if is online / offline
  */
spotService.getJsonSource = function () {

	dataSource = spotService.options.offlineUrl;

	return dataSource;
};



/*
 * Updates the distance field given a determinate latitude and longitude (must be changed by object location)
 */

spotService.updateSpotDistance = function (currentLocation, callback) {

	if (spotService.allSpots.length > 0) {
		spotService.updateSpotDistanceCallback(currentLocation, spotService.allSpots, callback);

	} else {

		console.log("Updating distance..");
		var mySpots = [];
		spotService.db.transaction(function (tx) {

			tx.executeSql('SELECT * FROM SPOTS', [], function (tx, results) {
				if (results.rows.length > 0) {
					for (var i = 0; i < results.rows.length; i++) {
						mySpots[i] = results.rows.item(i);
					}
					spotService.updateSpotDistanceCallback(currentLocation, mySpots, callback);
				}
			});

		}, function (err) {
			console.log("spotService.Error updating the database: " + err.message);
		});
	}
};

/*
 * Updates the distance field given a determinate latitude and longitude (must be changed by object location)
 */

spotService.updateSpotDistanceCallback = function (currentLocation, spots, callback) {

	//console.log("Updating distance..");

	spotService.db.transaction(function (tx) {

		$.each(spots, function (index, spot) {

			var distance = geoService.getRelativeDistance(currentLocation.latitude, currentLocation.longitude, spot.latitude, spot.longitude);

			tx.executeSql("UPDATE SPOTS set distance=? WHERE id=?", [distance, spot.id]);

		});
		// callback to the main function
		spotService.loadNearestSpotsFromDatabase(callback);

	}, function (err) {
		console.log("spotService.Error updating the database: " + err.message);
	});

};

/*
 * Updates the distance field given a determinate latitude and longitude (must be changed by object location)
 */

spotService.updateFavourite = function (id, callback) {


	var favourite = 0;
	$.each(spotService.allSpots, function (index, spot) {

		if (spot.id == id) {

			if (spot.favourite == 0 ) {
				favourite = 1;
			}  
			
		}
	});


	spotService.db.transaction(function (tx) {

		tx.executeSql("UPDATE SPOTS set favourite=? WHERE id=?", [favourite, id],function (tx, results) {spotService.loadSpotsFromDatabase(callback()); });
	 	


	}, function (err) {
		console.log("spotService.Error updating the database , favourite: " + err.message);
	});
	


};

/*
 * Gets all the spots
 */

spotService.getAllSpots = function () {

	return spotService.allSpots;

};


/*
 * Retrieve the spots from database
 */

spotService.loadSpotsFromDatabase = function (callback) {

	console.log("spotService.loadSpotsFromDatabase.loading spots from database");
	var spots = [];
	spotService.db.transaction(function (tx) {
		tx.executeSql('SELECT * FROM SPOTS ORDER BY name', [], function (tx, results) {
			if (results.rows.length > 0) {
				for (var i = 0; i < results.rows.length; i++) {
					//console.log(results.rows.item(i));
					id = results.rows.item(i)['id'];
					//console.log(id);
					spots[i] = results.rows.item(i);
				}
			}

			// callback to the main function
			spotService.allSpots = spots;
			callback(spots);

		});
	}, function (err) {
		console.log("spotService.Error loading the database: " + err.message);
	});
};


/*
 * Load only favorite from DB
 */

spotService.loadFavouriteSpotsFromDatabase = function (callback) {

	var spots = [];
	spotService.db.transaction(function (tx) {
		tx.executeSql('SELECT * FROM SPOTS WHERE favourite=1', [], function (tx, results) {
			if (results.rows.length > 0) {
				for (var i = 0; i < results.rows.length; i++) {
					//console.log(results.rows.item(i));
					id = results.rows.item(i)['id'];
					//console.log(id);
					spots[i] = results.rows.item(i);
				}
			}
			console.log("spotService.The spots returned from loadSpotsFromDatabase:");
			// callback to the main function
			callback(spots);

		});

	}, function (err) {
		console.log("spotService.Error loading the database: " + err.message);
	});

};

/*
 * Retrieve the spots from database
 */

spotService.loadNearestSpotsFromDatabase = function (callback) {

	console.log("spotservice.loadNearestSpotsFromDatabase. Starting.");
	spotService.loadFilteredSpotsByMaxDistance(50, callback);

};



/*
 * Load by filter * All Filters *
 */

spotService.loadFilteredSpots = function (maxDistance, spotType, callback) {

	console.log("spotservice.loadingFilteredSpots. Starting.");


	// If there's no filter
	if (maxDistance == 0 && spotType == 100) {

		spotService.getAllSpots(callback);
		return false;
	}

	if (maxDistance > 0 && spotType == 100) {

		spotService.loadFilteredSpotsByMaxDistance(maxDistance, callback);
		return false;

	}


	if (maxDistance == 0 && spotType != 100) {

		maxDistance = 100000; //unlimited
	}


	var spots = [];

	spotService.db.transaction(function (tx) {

		tx.executeSql('SELECT * FROM SPOTS WHERE distance < ? and type = ? ORDER BY distance', [maxDistance, spotType], function (tx, results) {

			if (results.rows.length > 0) {
				for (var i = 0; i < results.rows.length; i++) {
					id = results.rows.item(i)['id'];
					spots[i] = results.rows.item(i);
				}
			}
			callback(spots);
		});

	}, function (err) {
		console.log("spotService.Error loading the database: " + err.message);
	});

};


/*
 * Load by filter by Max Distance
 */

spotService.loadFilteredSpotsByMaxDistance = function (maxDistance, callback) {

	console.log("spotservice.loadingFilteredSpots By distance. Starting.");

	var spots = [];
	spotService.db.transaction(function (tx) {
		tx.executeSql('SELECT * FROM SPOTS WHERE distance < ?  ORDER BY distance', [maxDistance], function (tx, results) {
			// fill the spots array
			if (results.rows.length > 0) {
				for (var i = 0; i < results.rows.length; i++) {
					spots[i] = results.rows.item(i);
				}
			}
			// callback to the main function
			callback(spots);
		});
	}, function (err) {
		console.log("spotService.Error loading the database: " + err.message);
	});
};



/*
 * Remove bad tags
 */
spotService.removeBadTags = function (data) {

	data = data.replace(/\[/g, '<');
	data = data.replace(/\]/g, '>');
	data = data.replace(/\]/g, '>');
	data = data.replace(/\]/g, '>');
	return (data);
};