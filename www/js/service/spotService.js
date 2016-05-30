/**
 * FurgoPerfectos Offline v2
 * Created by Jose Carrasco (@jcarrasko)
 */

var spotService = {};

spotService.db = {};
spotService.allSpots={};

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
        'otros',
        'camping',
        'centro comercial',
        'otros'
    ];



/*
 *Create the database
 */
spotService.initService = function () {

	// Database Stuff
	spotService.db = spotService.openDatabase();

	spotService.createDatabase();

	spotService.updateDatabaseFromSource(); // TODO , check if is created already
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
 *Create the database
 */
spotService.createDatabase = function () {

	//TODO remove from here, must go update
	spotService.db.transaction(function (tx) {
		tx.executeSql('DROP TABLE SPOTS');
	});

	// Creates the Database if no Exist
	spotService.db.transaction(function (tx) {




		//tx.executeSql("CREATE TABLE IF NOT EXISTS SPOTS ( id integer primary key,type integer,name text,latitude real,longitude real, cos_latitude real, sin_latitude real, cos_longitude real, sin_longitude real, country string, area string, html text,htmlp text,link text,image text,author text,width integer,lenght integer,description text,id_member text, date text,topic_id integer, favourite integer)");



		tx.executeSql("CREATE TABLE IF NOT EXISTS SPOTS ( id integer primary key,type integer,name text,latitude real,longitude real, distance integer, country string, area string, html text,htmlp text,link text,image text,author text,width integer,lenght integer,description text,id_member text, date text,topic_id integer, favourite integer)");



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

		spotService.updateDatabase(spots, furgovw.loadAllSpots);

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

			tx.executeSql("INSERT OR REPLACE INTO SPOTS (id,type, name, latitude, longitude, description,link,author) VALUES (?,?,?,?,?,?,?,?)", [jsonSpot.id, jsonSpot.icono, jsonSpot.nombre, jsonSpot.lng, jsonSpot.lat, jsonSpot.destomtom,jsonSpot.link,jsonSpot.author]);

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
		console.log("a:" + spotService.allSpots); // ¿? por que no va ¿?
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
				console.log("spotService.The spots returned from loadSpotsFromDatabase:");

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

spotService.updateFavourite = function (spot) {

	spotService.db.transaction(function (tx) {

		tx.executeSql("UPDATE TABLE SPOTS (favourite) VALUES (?) WHERE id=(?)", [spot.favourite, spot.id]);


	}, function (err) {
		console.log("spotService.Error updating the database , favourite: " + err.message);
	});

};

/*
 * Gets all the spots
 */

spotService.getAllSpots = function () {
	
	return spotService.allSpots;
	
}


/*
 * Retrieve the spots from database
 */

spotService.loadSpotsFromDatabase = function () {
	
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
			console.log("spotService.The spots returned from loadSpotsFromDatabase:");
			// callback to the main function
			spotService.allSpots = spots;
			//callback(spots);

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
	
	var spots = [];
	spotService.db.transaction(function (tx) {
		
		tx.executeSql('SELECT * FROM SPOTS WHERE distance < 50 ORDER BY distance', [], function (tx, results) {
			console.log("spotservice.loadNearestSpotsFromDatabase. Results numr." + results.rows.length);
			if (results.rows.length > 0) {
				for (var i = 0; i < results.rows.length; i++) {
					//console.log(results.rows.item(i));
					id = results.rows.item(i)['id'];
					//console.log(id);
					spots[i] = results.rows.item(i);
				}
			}
			console.log("spotservice.loadNearestSpotsFromDatabase. Results.");
			console.log(spots);
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

spotService.getCountryList = function (callback) {

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
			console.log("spotService.The spots returned from loadSpotsFromDatabase:");
			// callback to the main function
			callback(spots);

		});

	}, function (err) {
		console.log("spotService.Error loading the database: " + err.message);
	});
};

/*
 * Remove bad tats
 */
spotService.removeBadTags = function (data) {
	console.log(data.split(''));
	data = data.replace(/\[/g, '<');
	data = data.replace(/\]/g, '>');
	data = data.replace(/\]/g, '>');
	data = data.replace(/\]/g, '>');
	return (data);
};