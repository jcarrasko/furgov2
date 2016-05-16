/**
 * FurgoPerfectos Offline v2
 * Created by Jose Carrasco (@jcarrasko)
 */

var spotService = {};

spotService.db = {};
spotService.spots = {};

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

	//remove from here, must go update
	spotService.db.transaction(function (tx) {
		tx.executeSql('DROP TABLE SPOTS');
	});

	// Creates the Database if no Exist
	spotService.db.transaction(function (tx) {


		tx.executeSql("CREATE TABLE IF NOT EXISTS SPOTS ( id integer primary key,type integer,name text,latitude real,longitude real,country string, area string, html text,htmlp text,link text,image text,author text,width integer,lenght integer,description text,id_member text, date text,topic_id integer, favourite integer)");

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
		contentType: "application/json; charset=utf-8"
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
			//console.log("Inserting data..");
			//console.log( "INSERT INTO SPOTS (id,type, name, latitude, longitude,destomtom) VALUES (" + spot.id + "," + spot.icono + ",'" + spot.nombre    + "'," + spot.lat + "," + spot.lng + ",'" + spot.destomtom + "')");

			// NOTICE that in the json the LAT/Long is mixed !

			tx.executeSql("INSERT OR REPLACE INTO SPOTS (id,type, name, latitude, longitude, description) VALUES (?,?,?,?,?,?)", [jsonSpot.id, jsonSpot.icono, jsonSpot.nombre, jsonSpot.lng, jsonSpot.lat, jsonSpot.destomtom]);

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

	// only offline in this design. Needs

	/*if (furgovw.isOnline === true) {
            dataSource = spotService.options.apiUrl +
                '?latitude=' + encodeURIComponent(furgovw.userLatitude) +
                '&longitude=' + encodeURIComponent(furgovw.userLongitude);
        }*/

	return dataSource;
};



/*
 * Updates the distance field given a determinate latitude and longitude (must be changed by object location)
 */

spotService.updateSpotDistance = function (spots, latitude, longitude, callback) {

	//console.log("Updating distance..");

	spotService.db.transaction(function (tx) {

		var i;
		for (i in spotList) {

			var spot = spotList[i];

			// Calculates the distance using geoService
			spot.distance = geoService.getRelativeDistance(latitude, longitude, spot.longitude, spot.latitude);


			//console.log( "INSERT INTO SPOTS (id,type, name, latitude, longitude,destomtom) VALUES (" + spot.id + "," + spot.icono + ",'" + spot.nombre    + "'," + spot.lat + "," + spot.lng + ",'" + spot.destomtom + "')");
			tx.executeSql("UPDATE TABLE SPOTS (distance) VALUES (?) WHERE id=?", [spot.distance, spot.id]);

		}

		spotService.loadSpotsFromDatabase(callback);

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
 * Retrieve the spots from database
 */

spotService.loadSpotsFromDatabase = function (callback) {

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

spotService.loadNearestSpotsFromDatabase = function (callback, currentLocation) {

	console.log("spotservice.loadNearestSpotsFromDatabase. Starting.");

	var maxKmDistance = 25.0; // This must be given by parameter. Equivalente a 25km
	
	// calculate current cos / sin
	
	currentCosLatitude = cos(currentLocation.latitude * PI /180);
	currentSinLatitude = sin(currentLocation.latitude * PI /180);
	currentCosLongitude = cos(currentLocation.longitude * PI /180);
	currentSinLongitude = sin(currentLocation.longitude * PI /180);
	
	// distancia maxima
	
	cosMaxDistance= cos(maxKmDistance / 6371);
	
	

	/*Nueva estrategia :
	
	- Precalcular al grabar en DB y guardar
	
	cos_lat = cos(lat * PI / 180)
sin_lat = sin(lat * PI / 180)
cos_lng = cos(lng * PI / 180)
sin_lng = sin(lng * PI / 180)

	- Precalcular de la current location

	CUR_cos_lat = cos(cur_lat * PI / 180)
CUR_sin_lat = sin(cur_lat * PI / 180)
CUR_cos_lng = cos(cur_lng * PI / 180)
CUR_sin_lng = sin(cur_lng * PI / 180)
cos_allowed_distance = cos(25.0 / 6371) # equivalente a  25km
	
- Lanzar query de este estilo:
	
	SELECT * FROM position WHERE CUR_sin_lat * sin_lat + CUR_cos_lat * cos_lat * (cos_lng* CUR_cos_lng + sin_lng * CUR_sin_lng) > cos_allowed_distance;
	
	
	http://stackoverflow.com/questions/3126830/query-to-get-records-based-on-radius-in-sqlite
	
	*/

	maxLatitude = currentLocation.latitude + 0.25;
	minLatitude = currentLocation.latitude - 0.25;
	maxLongitude = currentLocation.longitude + 0.25;
	minLongitude = currentLocation.longitude - 0.25;

	console.log(maxLatitude);
	console.log(minLatitude);
	console.log(maxLongitude);
	console.log(minLongitude);

	var spots = [];
	spotService.db.transaction(function (tx) {
		tx.executeSql('SELECT * FROM SPOTS WHERE latitude < ? AND latitude > ? AND longitude < ? AND longitude >?', [maxLatitude, minLatitude, maxLongitude, minLongitude], function (tx, results) {
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
	return (data);
};