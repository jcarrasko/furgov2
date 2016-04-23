/* var console=console;
var google=google;
var connection=connection;
var Connection=connection;
var navigator=navigator; */


var furgovw = {};
var map;

// Main furgovw object

(function ($) {



    // Variables
    furgovw.markers = [];
    furgovw.isOnline = false;
    furgovw.isGeoPositionated = false;
    furgovw.spots = [];

    /*
     * Icons
     */
    furgovw.icons = [
        'img/icons/fp-pin.png',
        'img/icons/woods-marker.png',
        'img/icons/bicycle-pin.png',
        'img/icons/unknown-pin.png',
        'img/icons/camping-location.png',
        'img/icons/building-location.png',
        'img/icons/unknown-pin.png'
    ];

    /*
     * Big Icons
     */
    furgovw.bigIcons = [
        'img/icons/fp-pin-b.png',
        'img/icons/woods-marker-b.png',
        'img/icons/bicycle-pin-b.png',
        'img/icons/unknown-pin-b.png',
        'img/icons/camping-location-b.png',
        'img/icons/building-location-b.png',
        'img/icons/unknown-pin-b.png'
    ];

    /*
     * Options
     */
    furgovw.options = {
        offlineUrl: 'data/furgoperfectos.json',
        apiUrl: 'http://www.furgovw.org/api.php',
        zoom: 5,
        centerLat: 38.50,
        centerLng: 0.35,
        markerClustererMaxZoom: 10
    };



    furgovw.deviceready = function () {

        console.log('Initializing Device...');


        // Canviar per un update reload...
        $('#fvw_logo')
            .on('click', function () {
                furgovw.main();
            });

        // Loads the map

        $('#map_page').on('pageshow', function () {
            furgovw.loadMap();
        });


        $('#map_page').on('pagebeforehide', function () {
            furgovw.userLatitude = furgovw.marker.position.lat();
            furgovw.userLongitude = furgovw.marker.position.lng();


            //Get user location
            console.log('Starting to get location...');
            geoService.getAddress(furgovw.marker.position.lat(), furgovw.marker.position.lng(), furgovw.setLocation);


        });



        //  furgovw.geocoder = new google.maps.Geocoder(); // borrar moved 2 rsulset.
        furgovw.main();


    };


    /*
     * Callback function used to set current address
     */

    furgovw.setLocation = function (currentLocation) {

        console.log(currentLocation);

        furgovw.currentLocation = currentLocation;
        furgovw.userLatitude = currentLocation.latitude;
        furgovw.userLongitude = currentLocation.longitude;

        furgovw.latLng = {
            lat: parseFloat(furgovw.userLatitude),
            lng: parseFloat(furgovw.userLongitude)
        };


        var my_place = currentLocation.locality + ', ' + currentLocation.area;

        $('#fvw_user_location_input').text(my_place);
        $('#fvw_location_name').html(my_place);

        furgovw.loadSpots();
        furgovw.loadAllSpots();
        $('a#fvw_all_spots_button')
            .attr('href', '#search-page');

        // map.setCenter(initialLocation);

    };


    furgovw.main = function () {

        /*   var networkState = navigator.connection.type;

           var states = {};
           states[Connection.UNKNOWN] = 'Unknown connection';
           states[Connection.ETHERNET] = 'Ethernet connection';
           states[Connection.WIFI] = 'WiFi connection';
           states[Connection.CELL_2G] = 'Cell 2G connection';
           states[Connection.CELL_3G] = 'Cell 3G connection';
           states[Connection.CELL_4G] = 'Cell 4G connection';
           states[Connection.CELL] = 'Cell generic connection';
           states[Connection.NONE] = 'No network connection';

           // alert('Connection type: ' + states[networkState]);*/

        console.log("Connection: " + navigator.connection.type);
        console.log("connection none is " + Connection.NONE);


        //If there's no internet connection
        if (navigator.connection.type == Connection.NONE) {
            // popErrorMessage('Lo siento, esta aplicación necesita que tengas conexión a internet');
            furgovw.isOnline = false;
        }

        //Get user location
        console.log('Starting to get location...');
        geoService.getCurrentLocation(furgovw.setLocation);



    };


    /*  
    / Gets the datasource depending if is online / offline
    */
    furgovw.getDataSource = function () {

        dataSource = furgovw.options.offlineUrl;
        if (furgovw.isOnline === true) {
            dataSource = furgovw.options.apiUrl +
                '?latitude=' + encodeURIComponent(furgovw.userLatitude) +
                '&longitude=' + encodeURIComponent(furgovw.userLongitude);
        }

        return dataSource;
    };



    furgovw.updateDatabase = function () {

        console.log("UPDATING DB !!!!!");

        mapApiUrl = furgovw.getDataSource();
        console.log("Loading all spots from Datasource:" + mapApiUrl);

        // Open Database
        var db = openDatabase('furgodb', '1.0', 'my db', 5 * 1024 * 1024);


        // Creates the Database if no Exist

        db.transaction(function (tx) {

            tx.executeSql("CREATE TABLE IF NOT EXISTS SPOTS ( id integer primary key,type integer,name text,latitude real,longitude real,html text,htmlp text,link text,image text,author text,width integer,lenght integer,destomtom text,id_member text, date text,topic_id integer)");

        }, function (err) {

            //errors Creating DB
            console.log("FPv2. Error creating the DB.");
            console.log("FPv2. Error Description: " + err.message);

        });

        // Querying the source

        $.ajaxSetup({
            scriptCharset: "utf-8",
            contentType: "application/json; charset=utf-8"
        });


        $.getJSON(mapApiUrl, function (spots) {


            // Fills the DB
            db.transaction(function (tx) {

                // Update the spots array
                furgovw.spots = spots; // <- not needed ?

                $.each(spots, function (index, spot) {

                    // calculate the distance
                    spot.distance = geoService.getRelativeDistance(furgovw.userLatitude, furgovw.userLongitude, spot.lng, spot.lat);
                    var sentenceQuery = "no sentence";


                    /* $('#all_spots_list')
                         .append('<li><a onclick="furgovw.fillDetailPage(' + spot.id + ');" href="#spot-detail' + '">' + '<h2>' + spot.nombre + '</h2>' + '<p>' + parseFloat(spot.distance) + ' kms</p>' + '<img class="spots_list_picture" src="http://www.furgovw.org/tt.php?src=' + encodeURIComponent(spot.imagen) + '&w=80&h=80"></a></li>'); 
                         
                         
                         $('#all_spots_list')
                         .append('<li><a onclick="furgovw.fillDetailPage(' + spot.id + ');" href="#spot-detail' + '"><img class="spots_list_picture" src="' +  furgovw.bigIcons[spot.icono] + '">' + '<h2>' + spot.nombre + '</h2>' + '<p>' + parseFloat(spot.distance) + ' kms</p>' + '</p>'+spot.destomtom+'</p></a></li>'); 
                         
                     */

                    console.log("Inserting data..");
                    /*console.log( "INSERT INTO SPOTS (id,type, name, latitude, longitude,destomtom) VALUES (" + spot.id + "," + spot.icono + ",'" + spot.nombre    + "'," + spot.lat + "," + spot.lng + ",'" + spot.destomtom + "')");*/
                    tx.executeSql("INSERT OR REPLACE INTO SPOTS (id,type, name, latitude, longitude,destomtom) VALUES (?,?,?,?,?,?)", [spot.id, spot.icono, spot.nombre, spot.lat, spot.lng, spot.destomtom]);


                });


            }, function (myErr) {

                //errors for all transactions are reported here
                console.log("Error populating DB");
                console.log("Error: " + myErr.message);

            });

        });

    };



    /* 
    / Load all spots from datasource
    */

    furgovw.loadAllSpots = function () {

        mapApiUrl = furgovw.getDataSource();
        console.log("Loading all spots from Datasource:" + mapApiUrl);

        $('#all_spots_list')
            .empty();

        $.ajaxSetup({
            scriptCharset: "utf-8",
            contentType: "application/json; charset=utf-8"
        });


        $.getJSON(mapApiUrl, function (spots) {


                /*   spotService.initService();
                   spotService.updateDatabase(spots);
                   spotService.loadSpotsFromDatabase();*/

                furgovw.spots = spots;

                $.each(spots, function (index, spot) {

                    // calculate the distance
                    spot.distance = geoService.getRelativeDistance(furgovw.userLatitude, furgovw.userLongitude, spot.lng, spot.lat);


                    /* $('#all_spots_list')
                         .append('<li><a onclick="furgovw.fillDetailPage(' + spot.id + ');" href="#spot-detail' + '">' + '<h2>' + spot.nombre + '</h2>' + '<p>' + parseFloat(spot.distance) + ' kms</p>' + '<img class="spots_list_picture" src="http://www.furgovw.org/tt.php?src=' + encodeURIComponent(spot.imagen) + '&w=80&h=80"></a></li>'); */

                    $('#all_spots_list')
                        .append('<li><a onclick="furgovw.fillDetailPage(' + spot.id + ');" href="#spot-detail' + '"><img class="spots_list_picture" src="data/thumbs/' + spot.id + '.jpg">' + '<h2>' + spot.nombre + '</h2>' + '<p>' + parseFloat(spot.distance) + ' kms</p>' + '</p>' + spot.destomtom + '</p></a></li>');


                });

                //$('#all_spots_list')
                //     .listview('refresh', true);
                $('#fvw_all_spots_button')
                    .attr('href', '#search-page');
            }
            /* ,
                        error: function() {
                            popErrorMessage('Lo siento, parece que hay un problema con la conexión a furgovw.org');
                            return;
                              
                    }*/
        );
    };






    furgovw.loadSpots = function () {


        $('#spots_list_list')
            .empty();

        $.ajaxSetup({
            scriptCharset: "utf-8",
            contentType: "application/json; charset=utf-8"
        });

        mapApiUrl =
            this.options.apiUrl +
            '?latitude=' + encodeURIComponent(furgovw.userLatitude) +
            '&longitude=' + encodeURIComponent(furgovw.userLongitude);
        console.log(mapApiUrl);

        $.jsonp({
            url: mapApiUrl,
            callbackParameter: 'callback',
            success: function (spots) {
                console.log('furgovw: Loaded data from api');
                //furgovw.spots = spots;



                $.each(spots, function (index, spot) {
                    $('#spots_list_list')
                        .append('<li><a onclick="furgovw.fillDetailPage(' + spot.id + ');" href="#spot-detail' + '">' + '<h2>' + spot.nombre + '</h2>' + '<p>' + parseFloat(spot.distance)
                            .toFixed(1) + ' kms</p>' + '<img class="spots_list_picture" src="http://www.furgovw.org/tt.php?src=' + encodeURIComponent(spot.imagen) + '&w=80&h=80"></a></li>');
                });

                $('#spots_list_list')
                    .listview('refresh', true);
                //   $('#fvw_user_location_button')
                //      .attr('href', '#spots-list');
            },
            error: function () {
                popErrorMessage('Lo siento, parece que hay un problema con la conexión a furgovw.org');
                return;
            }
        });
    };

    furgovw.fillDetailPage = function (id) {

        furgovw.id = id;

        $.each(furgovw.spots, function (index, spot) {


            console.log(spot);
            if (spot.id == furgovw.id) {
                $('img#fvw_spot_picture')
                    .attr('src', spot.imagen);
                $('#fvw_spot_name')
                    .html(spot.nombre);
                $('#fvw_spot_distance')
                    .html(parseFloat(spot.distance)
                        .toFixed(1) + ' kms');

                var geoUrl = "geo:" + spot.lng + "," + spot.lat;
                console.log(geoUrl);
                $('a#fvw_navigator_forum_link')
                    .attr('href', geoUrl);
                if (spot.link) {
                    $('a#fvw_spot_forum_link')
                        .attr('href', spot.link);
                    $('a#fvw_spot_forum_link')
                        .show();
                } else $('a#fvw_spot_forum_link')
                    .hide();
                $('a#fvw_spot_forum_link span span')
                    .html('Enlace al foro');
                $('p#fvw_spot_author')
                    .html('Autor: <strong>' + spot.autor + '</strong>');

                $('p#fvw_spot_msg_body')
                    .html(furgovw.removeBadTags(spot.body));
                   // .html(furgovw.removeBadTags(spot.destomtom));
            }
        });
    };

    furgovw.loadMap = function () {

        console.log("initmap");
        infowindow = new google.maps.InfoWindow({
            content: "holding..."
        });

        if (typeof furgovw.marker == 'undefined') {
            if (furgovw.userLatitude && furgovw.userLongitude) {
                latlng =
                    new google.maps.LatLng(furgovw.userLatitude, furgovw.userLongitude);
            } else {
                latlng =
                    new google.maps.LatLng("40.41153868", "-3.70362707");
            }

            var myOptions = {
                zoom: 10,
                center: latlng,
                overviewMapControl: true,
                zoomControl: true,
                zoomControlOptions: {
                    style: google.maps.ZoomControlStyle.SMALL,
                    position: google.maps.ControlPosition.LEFT_TOP
                },
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };


            console.log("Setting map");
            map = new google.maps.Map(document.getElementById("map"), myOptions);
            var mapdiv = document.getElementById("map");
            mapdiv.style.width = '100%';
            mapdiv.style.height = '100%';
            mapdiv.style.padding = '0';

            furgovw.marker = new google.maps.Marker({
                position: latlng,
                title: "Centrar aquí"
            });
            furgovw.marker.setMap(map);



            google.maps.event.addListener(map, 'click', function (event) {
                furgovw.marker.setPosition(event.latLng);
                console.log("clicked map");

            });
        }


        google.maps.event.addListener(map, 'bounds_changed', function () {
            if (!map.firstTime) {
                furgovw.loadSpotsMap();
                map.firstTime = true;
            }
        });

    };


    /*
     * Load spots from furgovw API
     */
    furgovw.loadSpotsMap = function () {
        var queryString = this.queryString();

        /*
        mapApiUrl =
            this.options.apiUrl +
            '?latitude=' + encodeURIComponent(furgovw.userLatitude) +
            '&longitude=' + encodeURIComponent(furgovw.userLongitude);

        mapApiUrl = "data/furgoperfectos.json";
        console.log(mapApiUrl);
        $.getJSON(mapApiUrl, {
                getEverything: "",
                withoutBody: "",
                user: queryString.user
            },
            function (data) {
                console.log(data);
                furgovw.spots = data;
                furgovw.addSpotsToMap();
            }
        );
   
    */
        furgovw.addSpotsToMap();
    };

    /*
     * Load spots from furgovw API
     */
    furgovw.addSpotsToMap = function () {

        console.log("Spots list");
        console.log(furgovw.spots);

        for (var x = 0; x < furgovw.spots.length; x++) {
            var latlng = new google.maps.LatLng(furgovw.spots[x].lng, furgovw.spots[x].lat);

            var marker = new google.maps.Marker({
                position: latlng,
                title: furgovw.spots[x].nombre,
                id: furgovw.spots[x].id,
                link: furgovw.spots[x].link,
                imagen: furgovw.spots[x].imagen,
                autor: furgovw.spots[x].autor,
                icon: furgovw.icons[furgovw.spots[x].icono]
            });
            this.markers.push(marker);

            google.maps.event.addListener(marker, 'click', function () {

                var markerHTML =
                    '<div class="furgovwSpot">' +
                    '<h3>' + '<a onclick="furgovw.fillDetailPage(' + this.id + ');" href="#spot-detail' + '">' + this.title + '</a>' +
                    '</h3>' +
                    '<a target="_blank" href="' + this.link + '">' +
                    '<img src="' + this.imagen + '">' +
                    '</a>' +
                    '<br>' +
                    'A&ntilde;adido por ' + this.autor;

                infowindow.setContent(markerHTML);
                infowindow.open(map, this);
            });
        }

        var mcOptions = {
            gridSize: 50,
            maxZoom: this.options.markerClustererMaxZoom
        };
        this.markerClusterer = new MarkerClusterer(map, this.markers, mcOptions);

        $('.loading').hide();
    };

    /*
     * Load spots from furgovw API
     */
    //http://stackoverflow.com/questions/979975/how-to-get-the-value-from-url-parameter
    furgovw.queryString = function () {
        var query_string = {};
        var query = window.location.search.substring(1);
        var vars = query.split("&");
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split("=");
            // If first entry with this name
            if (typeof query_string[pair[0]] === "undefined") {
                query_string[pair[0]] = pair[1];
                // If second entry with this name
            } else if (typeof query_string[pair[0]] === "string") {
                var arr = [query_string[pair[0]], pair[1]];
                query_string[pair[0]] = arr;
                // If third or later entry with this name
            } else {
                query_string[pair[0]].push(pair[1]);
            }
        }
        return query_string;
    };


    /*
     * Load spots from furgovw API
     */
    furgovw.removeBadTags = function (data) {
        console.log(data.split(''));

        data = data.replace(/\[/g, '<');
        data = data.replace(/\]/g, '>');

        return (data);

    };

    /*
     * open popup
     */


    function popErrorMessage(errorMessage) {

        $("<div class='ui-loader ui-overlay-shadow ui-body-e ui-corner-all error-message'><h1>" + errorMessage + "</h1></div>")
            .css({
                "display": "block",
                "opacity": 0.96,
                "left": "5%",
                "width": "90%",
                "top": $(window)
                    .scrollTop() + 100
            })
            .appendTo($.mobile.pageContainer)
            .delay(4000)
            .fadeOut(400, function () {
                $(this)
                    .remove();
            });

    };



})(jQuery);