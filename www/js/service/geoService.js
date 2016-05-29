/**
 * FurgoPerfectos Offline v2
 * Created by Jose Carrasco (@jcarrasko)
 */

function Location(latitude, longitude, address, locality, area, country) {
    this.latitude = latitude;
    this.longitude = longitude;
    this.address = address;
    this.locality = locality;
    this.area = area;
    this.country = country;
}


var geoService = {};

geoService.defaultLocation = "Barcelona";
geoService.defaultLatitude = "41,2349";
geoService.defaultLongitude = "2.117";


geoService.currentLocation = "";
geoService.geocoder="";
/*
 *Create the database
 */

geoService.initService = function () {

    console.log("geoService::initializing geoService");
	geoService.geocoder = new google.maps.Geocoder(); // TODO the google script must be downloaded for offline use

};

/*
 * Get's the adress via Google Apps API
 */

geoService.getAddress = function (latitude, longitude, isOnline, callback) {
	
	if(isOnline===false){
		
		myLocation = new Location(latitude, longitude, null, null, null, null);
		geoService.currentLocation = myLocation;
		
		// callback with the location
        callback(myLocation);
		return;
	}


    var myLocation;
    currentLatitudeAndLongitude = {
        lat: parseFloat(latitude),
        lng: parseFloat(longitude)
    };

    if (geoService.geocoder) {

        geoService.geocoder.geocode({
            'location': currentLatitudeAndLongitude
        }, function (results, status) {

            console.log("geoService::geoCoding Results");
            console.log(results);
            
            if (status == google.maps.GeocoderStatus.OK) {

                if (results[0] && isOnline===true) {
                    var reverse_geo = results[0];

                    address = reverse_geo.formatted_address;
                    locality = reverse_geo.address_components[1].long_name;
                    area = reverse_geo.address_components[2].long_name;
                    country = reverse_geo.address_components[4].long_name;

                    myLocation = new Location(latitude, longitude, address, locality, area, country);

                    geoService.currentLocation = myLocation;

                    // callback with the location
                    callback(myLocation);

                }
            } else {
                console.log('geoService::geocode status ko' + status);
				myLocation = new Location(latitude, longitude, null, null, null, null);
				
				 geoService.currentLocation = myLocation;

            }  

        });
    }

};

 

/*
 * Get's the adress via Google Apps API
 */

geoService.getCurrentLocation = function (isOnline,callback) {

    //Get user location
    console.log('geoService::Starting to get device location.');

    // Try W3C Geolocation (Preferred)
    if (navigator.geolocation) {
        console.log('geoService::supported geolocation');
        browserSupportFlag = true;
        navigator.geolocation.getCurrentPosition(function (position) {

            //initialLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

            var currentLatitude = position.coords.latitude;
            var currentLongitude = position.coords.longitude;


            console.log('geoService::current latitude:' + currentLatitude);
            console.log('geoService::current longitude' + currentLongitude);

            // get the full location
            geoService.getAddress(currentLatitude, currentLongitude,isOnline, callback);


        }, function () {


            if (errorFlag === true) {
                console.log("Geolocation service failed.");
               
            } else {
                console.log("Your browser doesn't support geolocation. We've placed you in Barcelona.");
            
            }
            map.setCenter(geoService.defaultLocation);


        });

        // Browser doesn't support Geolocation
    } else {
        console.log('ko location');
        browserSupportFlag = false;
        popErrorMessage('Lo siento, no consigo encontrar tu localización');
  
        map.setCenter(geoService.defaultLocation);

    }

};


/**
 * Checks the distance between two locations
 *
 * @param lat1 = Latitud del punto de origen
 * @param lat2 = Latitud del punto de destino
 * @param lon1 = Longitud del punto de origen
 * @param lon2 = Longitud del punto de destino
 */
geoService.getRelativeDistance = function (lat1, lon1, lat2, lon2) {
    rad = function (x) {
        return x * Math.PI / 180;
    };

    var R = 6378.137; //Radio de la tierra en km
    var dLat = rad(lat2 - lat1);
    var dLong = rad(lon2 - lon1);

    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLong / 2) * Math.sin(dLong / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;

    return d.toFixed(1); //Retorna tres decimales
};