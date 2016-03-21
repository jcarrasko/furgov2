/**
 * FurgoPerfectos v2
 * Created by Jose Carrasco (@jcarrasko) derivated from Javier Montes (@mooontes) 
 */

var spotService.furgodb;

var apiUrl= "http://www.furgovw.org/api.php";

/*
 *Create the database
 */
spotService = function(){

    // Database Stuff
    //     spotService.furgodb = window.sqlitePlugin.openDatabase({name: "furgoApp.db"});
    //    spotService.furgodb.transaction(spotService.createDB,spotService.errorDB);

};

/*
 *Create the database
 */
spotService.loadSpots(latitude,longitude){
	
	var mySpots;
	
	mapApiUrl =
              this.options.apiUrl  +
            '?latitude=' + encodeURIComponent(furgovw.userLatitude) +
            '&longitude=' + encodeURIComponent(furgovw.userLongitude);

	
	
	$.ajax({
		url: 'data.json',
		crossDomain: true,
		jsonpCallback: 'cb',
		dataType: 'jsonp',
	})
	.fail(function (jqXHR, textStatus, errorThrown) { console.log(textStatus, errorThrown); alert('Failed to load data.'); })
	.done(function (data) {
		app.data = data;
	});
	
	
	
}



/*
 *Create the database
 */
spotService.createDB = function(tx){

	// Create the database if doesn't exist
	tx.executeSql("CREATE TABLE IF NOT EXISTS SPOTS ( id integer primary key,type integer,name text,latitude real,longitude real,html text,htmlp text,link text,image text,author text,width integer,lenght integer,destomtom text,id_member text, date text,topic_id integer)");  
	 

};

    /*
     * Load spots from furgovw API
     */
    spotService.removeBadTags = function (data) {
        console.log(data.split(''));

        data=data.replace(/\[/g,'<');
        data=data.replace(/\]/g,'>');

        return (data);

    }


/*
 * Handle Database Errors
 */ 
spotService.errorDB = function(tx,err) {
	alert("Error processing SQL: "+err);
};