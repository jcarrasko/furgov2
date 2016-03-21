/**
 * Club Camper Furgovw's Mobile App
 * Copyright (C) 2012, Club Camper Furgovw (furgovw.org)
 * Created by Javier Montes (@mooontes - http://mooontes.com)
 */
var furgovw = {};
var map;



(function($) {

    furgovw.markers = [];

    /*
     * Icons
     */
    furgovw.icons = [
        'http://www.furgovw.org/mapa_imagenes/furgonetikaiconozo2.png',
        'http://www.furgovw.org/mapa_imagenes/balonrojodu6.png',
        'http://www.furgovw.org/mapa_imagenes/balonverdese8.png',
        '',
        'http://www.furgovw.org/mapa_imagenes/campingnh4.png',
        'http://www.furgovw.org/mapa_imagenes/centrocomercialdo4.jpg',
        'http://www.furgovw.org/mapa_imagenes/campingtp.jpg'
    ];

  /*
     * Options
     */
     furgovw.options = {
        apiUrl:    'http://www.furgovw.org/api.php',
        zoom:      5,
        centerLat: 38.50,
        centerLng: 0.35,
        markerClustererMaxZoom: 10
     };


    furgovw.deviceready = function() {
        
        
        console.log('Initializing Device...');     
        
		
		console.log('Initializaing DB');

     
    
        

        $('#fvw_logo')
            .on('click', function() {
            furgovw.main();
        });
        $('#map_page').on('pageshow', function() {
           furgovw.loadMap();
        });


        $('#map_page').on('pagebeforehide', function() {
            furgovw.userLatitude  = furgovw.marker.position.lat();
            furgovw.userLongitude = furgovw.marker.position.lng();

            furgovw.loadSpots();

       //     $('a#fvw_user_location_button')<a id="fvw_select_location_button" href="#map_page" data-role="button" data-icon="search" data-iconpos="notext">.attr('href', '#spots-list');

            furgovw.geocoder.geocode({
                'latLng': furgovw.marker.position
            }, function(results, status) {

                furgovw.setAdress(results,status);

            });
        });
		
		

        furgovw.geocoder = new google.maps.Geocoder();
        furgovw.main();
		
		
    };
	
	/*
	Setadress
	*/

    furgovw.setAdress = function(results,status){

       console.log("Status: "+status);
       console.log("results",results);

        if (status == google.maps.GeocoderStatus.OK) {
            console.log('Ok geocoder');
            if (results[1]) {
                var reverse_geo = results[1];
                console.log('Extracting data');
                var my_place=reverse_geo.address_components[0].long_name + ', ' + reverse_geo.address_components[1].long_name;
                console.log("Place is "+my_place);
                $('#fvw_user_location_input').text(my_place);
                $('#fvw_location_name').html(my_place);

            }
        }else{
            console.log('Status');
        }

    };




    furgovw.main = function() {
        
         var networkState = navigator.connection.type;

    var states = {};
    states[Connection.UNKNOWN]  = 'Unknown connection';
    states[Connection.ETHERNET] = 'Ethernet connection';
    states[Connection.WIFI]     = 'WiFi connection';
    states[Connection.CELL_2G]  = 'Cell 2G connection';
    states[Connection.CELL_3G]  = 'Cell 3G connection';
    states[Connection.CELL_4G]  = 'Cell 4G connection';
    states[Connection.CELL]     = 'Cell generic connection';
    states[Connection.NONE]     = 'No network connection';

    alert('Connection type: ' + states[networkState]);
        
        console.log("Connection: " + navigator.connection.type);
    /*
        

        //If there's no internet connection
        if (navigator.network.connection.type == 'none') {
            popErrorMessage('Lo siento, esta aplicación necesita que tengas conexión a internet');
            return;
        }*/

        //Get user location
        console.log('Starting to get location...');

        // Try W3C Geolocation (Preferred)
  if(navigator.geolocation) {

      browserSupportFlag = true;
      navigator.geolocation.getCurrentPosition(function(position) {
      initialLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);

      furgovw.userLatitude  =position.coords.latitude;
      furgovw.userLongitude = position.coords.longitude;



      console.log('LAT'+furgovw.userLatitude);
      console.log('Long'+furgovw.userLongitude);

      furgovw.latLng = {lat: parseFloat(furgovw.userLatitude ), lng: parseFloat(furgovw.userLongitude)};


          if (furgovw.geocoder) {

            furgovw.geocoder.geocode({
                'location': furgovw.latLng
            }, function(results, status) {
                furgovw.setAdress(results,status);

            });
      }


            furgovw.loadSpots();
                $('a#fvw_user_location_button')
                    .attr('href', '#spots-list');

        map.setCenter(initialLocation);
        }, function() {
          handleNoGeolocation(browserSupportFlag);
        });

    // Browser doesn't support Geolocation
    }else {
            console.log('ko location');
            browserSupportFlag = false;
            popErrorMessage('Lo siento, no consigo encontrar tu localización');
            initialLocation = barcelona;
            map.setCenter(initialLocation);

     }
    };


    function handleNoGeolocation(errorFlag) {
        if (errorFlag == true) {
          alert("Geolocation service failed.");
          initialLocation = newyork;
        } else {
          alert("Your browser doesn't support geolocation. We've placed you in Siberia.");
          initialLocation = siberia;
        }
        map.setCenter(initialLocation);
  }



    furgovw.loadSpots = function() {


        $('#spots_list_list')
            .empty();

        $.ajaxSetup({
            scriptCharset: "utf-8",
            contentType: "application/json; charset=utf-8"
        });

        mapApiUrl =
              this.options.apiUrl  +
            '?latitude=' + encodeURIComponent(furgovw.userLatitude) +
            '&longitude=' + encodeURIComponent(furgovw.userLongitude);

        $.jsonp({
            url: mapApiUrl,
            callbackParameter: 'callback',
            success: function(spots) {
                console.log('furgovw: Loaded data from api');
                furgovw.spots = spots;
                console.log("Spots list A");
                console.log(furgovw.spots);


                $.each(spots, function(index, spot) {
                    $('#spots_list_list')
                        .append('<li><a onclick="furgovw.fillDetailPage(' + spot.id + ');" href="#spot-detail' + '">' + '<h2>' + spot.nombre + '</h2>' + '<p>' + parseFloat(spot.distance)
                        .toFixed(1) + ' kms</p>' + '<img class="spots_list_picture" src="http://www.furgovw.org/tt.php?src=' + encodeURIComponent(spot.imagen) + '&w=80&h=80"></a></li>');
                });

                $('#spots_list_list')
                    .listview('refresh', true);
                $('#fvw_user_location_button')
                    .attr('href', '#spots-list');
                },
            error: function() {
                popErrorMessage('Lo siento, parece que hay un problema con la conexión a furgovw.org');
                return;
                }
            });
    };

    furgovw.fillDetailPage = function(id) {

        furgovw.id = id;

        $.each(furgovw.spots, function(index, spot) {

       
            console.log(spot);
            if (spot.id == furgovw.id) {
                $('img#fvw_spot_picture')
                    .attr('src', spot.imagen);
                $('#fvw_spot_name')
                    .html(spot.nombre);
                $('#fvw_spot_distance')
                    .html(parseFloat(spot.distance)
                    .toFixed(1) + ' kms');
                
                var geoUrl="geo:"+ spot.lng+","+ spot.lat;
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
            }
        });
    };

    furgovw.loadMap = function() {

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
                    new google.maps.LatLng("40.41153868","-3.70362707");
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

            furgovw.marker = new google.maps.Marker({ position: latlng, title:"Centrar aquí" });
            furgovw.marker.setMap(map);



            google.maps.event.addListener(map, 'click', function(event) {
                furgovw.marker.setPosition(event.latLng);
                console.log("clicked map");

            });
        }


         google.maps.event.addListener(map, 'bounds_changed',function() {
            if (!map.firstTime) {
                furgovw.loadSpotsMap();
                map.firstTime = true;
            }
        });

    };


    /*
     * Load spots from furgovw API
     */
    furgovw.loadSpotsMap = function() {
        var queryString = this.queryString();

              mapApiUrl =
             this.options.apiUrl +
            '?latitude=' + encodeURIComponent(furgovw.userLatitude) +
            '&longitude=' + encodeURIComponent(furgovw.userLongitude);

        console.log(mapApiUrl);
        $.getJSON(mapApiUrl,
            {
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
                title:  furgovw.spots[x].nombre,
                id:     furgovw.spots[x].id,
                link:   furgovw.spots[x].link,
                imagen: furgovw.spots[x].imagen,
                autor:  furgovw.spots[x].autor,
                icon:   furgovw.icons[furgovw.spots[x].icono]
                });
            this.markers.push(marker);

            google.maps.event.addListener(marker, 'click', function() {

                var markerHTML =
                    '<div class="furgovwSpot">' +
                        '<h3>' +'<a onclick="furgovw.fillDetailPage(' + this.id + ');" href="#spot-detail' + '">' + this.title + '</a>' +
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

        var mcOptions = {gridSize: 50, maxZoom: this.options.markerClustererMaxZoom};
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
      for (var i=0;i<vars.length;i++) {
        var pair = vars[i].split("=");
            // If first entry with this name
        if (typeof query_string[pair[0]] === "undefined") {
          query_string[pair[0]] = pair[1];
            // If second entry with this name
        } else if (typeof query_string[pair[0]] === "string") {
          var arr = [ query_string[pair[0]], pair[1] ];
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

        data=data.replace(/\[/g,'<');
        data=data.replace(/\]/g,'>');

        return (data);

    }

    /*
     * Load spots from furgovw API
     */


    function popErrorMessage(errorMessage) {

        $("<div class='ui-loader ui-overlay-shadow ui-body-e ui-corner-all error-message'><h1>" + errorMessage + "</h1></div>")
            .css({
            "display": "block",
            "opacity": 0.96,
            "left":"5%",
            "width":"90%",
            "top": $(window)
                .scrollTop() + 100
        })
            .appendTo($.mobile.pageContainer)
            .delay(4000)
            .fadeOut(400, function() {
            $(this)
                .remove();
        });

    }

})(jQuery);