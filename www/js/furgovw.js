/**
 * Club Camper Furgovw's Mobile App
 * Copyright (C) 2012, Club Camper Furgovw (furgovw.org)
 * Original by Javier Montes (@mooontes - http://mooontes.com)
 * Version 2 by José Carrasco (@jcarrasko )
 */
var furgovw = {};
var map;

// Main furgovw object

(function ($) {

    // Defalts
    
    var defaultLocation="Barcelona";
    
    
    // Variables
    furgovw.markers = [];
    furgovw.isOnline = false;
    furgovw.isGeoPositionated = false;
    furgovw.spots =[];

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

           // furgovw.loadSpots(); <-- Not needed

            //     $('a#fvw_user_location_button')<a id="fvw_select_location_button" href="#map_page" data-role="button" data-icon="search" data-iconpos="notext">.attr('href', '#spots-list');

            furgovw.geocoder.geocode({
                'latLng': furgovw.marker.position
            }, function (results, status) {

                furgovw.setAdress(results, status);

            });
        });



        furgovw.geocoder = new google.maps.Geocoder();
        //furgovw.main();


    };

    /*
    Setadress
    */

    furgovw.setAdress = function (results, status) {

        console.log("Status: " + status);
        console.log("results", results);

        if (status == google.maps.GeocoderStatus.OK) {
            console.log('Ok geocoder');
            if (results[1]) {
                var reverse_geo = results[1];
                console.log('Extracting data');
                var my_place = reverse_geo.address_components[0].long_name + ', ' + reverse_geo.address_components[1].long_name;
                console.log("Place is " + my_place);
                $('#fvw_user_location_input').text(my_place);
                $('#fvw_location_name').html(my_place);

            }
        } else {
            console.log('Status');
        }

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
        console.log("connection none is "+ Connection.NONE);
        
           
 
        //If there's no internet connection
        if (navigator.connection.type == Connection.NONE) {
          // popErrorMessage('Lo siento, esta aplicación necesita que tengas conexión a internet');
            furgovw.isOnline = false;
        } 

        //Get user location
        console.log('Starting to get location...');

        // Try W3C Geolocation (Preferred)
        if (navigator.geolocation) {

            browserSupportFlag = true;
            navigator.geolocation.getCurrentPosition(function (position) {
                initialLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

                furgovw.userLatitude = position.coords.latitude;
                furgovw.userLongitude = position.coords.longitude;



                console.log('LAT' + furgovw.userLatitude);
                console.log('Long' + furgovw.userLongitude);

                furgovw.latLng = {
                    lat: parseFloat(furgovw.userLatitude),
                    lng: parseFloat(furgovw.userLongitude)
                };


              
                if (furgovw.geocoder) {

                    furgovw.geocoder.geocode({
                        'location': furgovw.latLng
                    }, function (results, status) {
                        furgovw.setAdress(results, status);

                    });
                }

                 
                furgovw.loadSpots();
                $('a#fvw_user_location_button')
                    .attr('href', '#spots-list');
                
                furgovw.loadAllSpots();
                $('a#fvw_all_spots_button')
                    .attr('href', '#search-page');
                  
               // map.setCenter(initialLocation);
                    
            }, function () {
                handleNoGeolocation(browserSupportFlag);
            });

            // Browser doesn't support Geolocation
        } else {
            console.log('ko location');
            browserSupportFlag = false;
            popErrorMessage('Lo siento, no consigo encontrar tu localización');
            initialLocation = barcelona;
            map.setCenter(initialLocation);

        }
        
         
    };


    function handleNoGeolocation(errorFlag) {
        if (errorFlag === true) {
            alert("Geolocation service failed.");
            initialLocation = newyork;
        } else {
            alert("Your browser doesn't support geolocation. We've placed you in Siberia.");
            initialLocation = siberia;
        }
        map.setCenter(initialLocation);
    }


    
    /* function
    / Gets the datasource depending if is online / offline
    */
    furgovw.getDataSource = function(){
        
        dataSource=furgovw.options.offlineUrl;
        if (furgovw.isOnline === true){
            dataSource = furgovw.options.apiUrl +
            '?latitude=' + encodeURIComponent(furgovw.userLatitude) +
            '&longitude=' + encodeURIComponent(furgovw.userLongitude);
        }
        
        return dataSource;
    };
    
    
    /* function
    / Load all spots from datasource
    */
    
    furgovw.loadAllSpots = function () {

        mapApiUrl =furgovw.getDataSource();
        console.log("Loading all spots from Datasource:"+mapApiUrl);

        $('#all_spots_list')
            .empty();

        $.ajaxSetup({
            scriptCharset: "utf-8",
            contentType: "application/json; charset=utf-8"
        });

    
        $.getJSON(mapApiUrl, function (spots) {

                furgovw.spots = spots;
             
                $.each(spots, function (index, spot) {

                    // calculate the distance
                    spot.distance = furgovw.getRelativeDistance(furgovw.userLatitude, furgovw.userLongitude, spot.lng, spot.lat);
                    
                    
                   /* $('#all_spots_list')
                        .append('<li><a onclick="furgovw.fillDetailPage(' + spot.id + ');" href="#spot-detail' + '">' + '<h2>' + spot.nombre + '</h2>' + '<p>' + parseFloat(spot.distance) + ' kms</p>' + '<img class="spots_list_picture" src="http://www.furgovw.org/tt.php?src=' + encodeURIComponent(spot.imagen) + '&w=80&h=80"></a></li>'); */
                    
                    $('#all_spots_list')
                        .append('<li><a onclick="furgovw.fillDetailPage(' + spot.id + ');" href="#spot-detail' + '"><img class="spots_list_picture" src="' +  furgovw.bigIcons[spot.icono] + '">' + '<h2>' + spot.nombre + '</h2>' + '<p>' + parseFloat(spot.distance) + ' kms</p>' + '</p>'+spot.destomtom+'</p></a></li>');
                    
                    
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

               // $('#spots_list_list')
                 //   .listview('refresh', true);
                $('#fvw_user_location_button')
                    .attr('href', '#spots-list');
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
                    //.html(furgovw.removeBadTags(spot.body));
                .html(furgovw.removeBadTags(spot.destomtom));
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
                var latlng =
                    new google.maps.LatLng(furgovw.userLatitude, furgovw.userLongitude);
            } else {
                var latlng =
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
     * Load spots from furgovw API
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

    }


    /**
     * Función para calcular la distancia entre dos puntos.
     *
     * @param lat1 = Latitud del punto de origen
     * @param lat2 = Latitud del punto de destino
     * @param lon1 = Longitud del punto de origen
     * @param lon2 = Longitud del punto de destino
     */
    furgovw.getRelativeDistance = function (lat1, lon1, lat2, lon2) {
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





})(jQuery);