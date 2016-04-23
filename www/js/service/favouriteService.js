/**
 * FurgoPerfectos Offline v2
 * Created by Jose Carrasco (@jcarrasko)
 */

var favouriteService = {};

favouriteService.db={};
favouriteService.favourites={};

/*
 *Create the database
 */
favouriteService.initService = function () {

    // Database Stuff
    favouriteService.db = favouriteService.openDatabase();
    favouriteService.createDatabase();
};
/*
 *Open the database
 */
favouriteService.openDatabase = function () {

    // Open Database
    var db = openDatabase('furgofavoritos', '1.0', 'furgo favoritos', 5 * 1024 * 1024);
    return db;

};

/*
 *Create the database of favourite
 */
favouriteService.createDatabase = function () {

    // Creates the Database if no Exist
    favouriteService.db.transaction(function (tx) {

        tx.executeSql("CREATE TABLE IF NOT EXISTS FAVOURITES ( id integer primary key,spot_id integer)");

    }, function (err) {
        console.log("favouriteService::Error Creating the database for favourites" + err.message);
    });

};



/*
 * Retrieve the favourites from database
 */

favouriteService.loadFavouritesFromDatabase = function () {

    favouriteService.db.transaction(function (tx) {
        tx.executeSql('SELECT * FROM FAVOURITES ', [], function (tx, results) {
            if (results.rows.length > 0) {
                for (var i = 0; i < results.rows.length; i++) {
                    console.log("favouriteService::Loading DB: Result -> " + results.rows.item(i).id + " " + results.rows.item(i).spot_id);
                    console.log(results.rows.item(i));
                }
            }
        });


    }, function (err) {
        console.log("favouriteService::Error loading the favourites database: " + err.message);
    });
};
