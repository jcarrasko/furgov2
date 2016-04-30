/**
 * FurgoPerfectos Offline v2
 * Created by Jose Carrasco (@jcarrasko)
 */

var spotService = {};

spotService.db = {};
spotService.spots = {};


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


        tx.executeSql("CREATE TABLE IF NOT EXISTS SPOTS ( id integer primary key,type integer,name text,latitude real,longitude real,html text,htmlp text,link text,image text,author text,width integer,lenght integer,description text,id_member text, date text,topic_id integer, favourite integer)");

    }, function (err) {
        console.log("spotService.Error Creating the database" + err.message);
    });

};


/*
 * Updates the database with the list of spots if is needed
 */

spotService.updateDatabase = function (spotList, callback) {

    spotService.db.transaction(function (tx) {

        var i;
        for (i in spotList) {
            var spot = spotList[i];
            //console.log("Inserting data..");
            //console.log( "INSERT INTO SPOTS (id,type, name, latitude, longitude,destomtom) VALUES (" + spot.id + "," + spot.icono + ",'" + spot.nombre    + "'," + spot.lat + "," + spot.lng + ",'" + spot.destomtom + "')");
            tx.executeSql("INSERT OR REPLACE INTO SPOTS (id,type, name, latitude, longitude, description) VALUES (?,?,?,?,?,?)", [spot.id, spot.icono, spot.nombre, spot.lat, spot.lng, spot.destomtom]);

        }

        spotService.loadSpotsFromDatabase(callback);

    }, function (err) {
        console.log("spotService.Error updating the database: " + err.message);
    });

};

/*
 * Retrieve the spots from database
 */

spotService.loadSpotsFromDatabase = function (callback) {

    var spots = [];
    spotService.db.transaction(function (tx) {
        tx.executeSql('SELECT * FROM SPOTS ', [], function (tx, results) {
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