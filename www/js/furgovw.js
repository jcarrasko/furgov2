var furgovw = {};
var map;

// Main furgovw object

(function ($) {


	// Variables
	furgovw.markers = [];
	furgovw.isOnline = false; // Has internet connection ?
	furgovw.isGeoPositionated = false;
	furgovw.spots = [];


	furgovw.MODE_INIT = "Inicializando";
	furgovw.MODE_FAV = "Favoritos";
	furgovw.MODE_MAP = "Mapa";
	furgovw.MODE_NEAR = "Proximas";
	furgovw.MODE_FILTER = "Filter";

	furgovw.mode = furgovw.MODE_INIT;

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

	/*
	 * Function called for init the device
	 */

	furgovw.deviceready = function () {

		console.log('FurgoVW.Initializing Device...');
		// initialize services
		geoService.initService();
		spotService.initService();
		// add anchors
		furgovw.addAnchors();
		// sets the current location
		furgovw.setCurrentLocation();


		//furgovw.loadMap();

		//spotService.updateSpotDistance(currentLocation, furgovw.addSpotsToMap);

	};

	/*
	 * Function called for init the device
	 */

	furgovw.setMode = function () {

		/*	$('#set_current_location').removeClass("clr-btn-accent-indigo");
			$('#get_favourites').removeClass("clr-btn-accent-indigo");
		 
			if(furgovw.mode===furgovw.MODE_FAV){
				$('#get_favourites').addClass("clr-btn-accent-indigo");
			}else{
				$('#set_current_location').addClass("clr-btn-accent-indigo");
			}*/


	};


	/*
	 * Adds the anchors 
	 */

	furgovw.addAnchors = function () {


		$('#set_current_location') // needed to check
			.on('click', function () {
				furgovw.setCurrentLocation();
			});

		$('#get_favourites') // needed to check
			.on('click', function () {
				furgovw.getFavourites();
			});

		$('#set_filter') // needed to check
			.on('click', function () {
				furgovw.setFilter();
			});

		$('#set_location_by_map') // needed to check
			.on('click', function () {
				furgovw.setLocationByMap();
			});

		$('#show_prefs') // needed to check
			.on('click', function () {
				furgovw.updateDatabase();
			});

		// Loads the map
		$('#map_page').on('pageshow', function () {
			furgovw.loadMap();
		});


		/*$('#map_page').on('pagebeforehide', function () {


			// Not used method 
			//furgovw.userLatitude = furgovw.marker.position.lat();
			//furgovw.userLongitude = furgovw.marker.position.lng();


			//Get user location
			//console.log('Starting to get location...');
			//geoService.getAddress(furgovw.marker.position.lat(), furgovw.marker.position.lng(), furgovw.setLocation);


		});*/

	};


	/*
	 * Set location by map
	 */

	furgovw.setLocationByMap = function () {

		furgovw.userLatitude = furgovw.marker.position.lat();
		furgovw.userLongitude = furgovw.marker.position.lng();

		geoService.setLocationByMap(connectionService.isOnline(), furgovw.setLocation, furgovw.userLatitude, furgovw.userLongitude);


	};

	/*
	 * Filter
	 */

	furgovw.setFilter = function () {


		var typeFilter = $('#search_typeb').val();
		var distanceFilter = $('#search_distanceb').val();
		furgovw.mode = furgovw.MODE_FILTER;
		furgovw.setMode();
		spotService.loadFilteredSpots(distanceFilter, typeFilter, furgovw.loadAllSpots);

	};
	/*
	 * Callback function used to set current address via google APIS
	 */

	furgovw.setCurrentLocation = function () {

		// sets the current location
		// depending of the connection
		console.log("Setting current Location");
		furgovw.mode = furgovw.MODE_NEAR;
		furgovw.setMode();
		geoService.getCurrentLocation(connectionService.isOnline(), furgovw.setLocation);


	};

	/*
	 * Show favourites
	 */

	furgovw.getFavourites = function () {

		// sets the current location
		// depending of the connection
		furgovw.mode = furgovw.MODE_FAV;
		furgovw.setMode();
		spotService.loadFavouriteSpotsFromDatabase(furgovw.loadAllSpots);


	};

	/*
	 * Callback function used to set current address via google APIS
	 */

	furgovw.setLocation = function (currentLocation) {

		console.log(currentLocation);

		if (currentLocation === null) {

			var my_place = "No se ha podido determinar la localización."
			$('#fvw_user_location_input').text(my_place);
			$('#fvw_location_name').html(my_place);



			spotService.loadSpotsFromDatabase(furgovw.loadAllSpots);
			return;

		}


		furgovw.currentLocation = currentLocation;
		furgovw.userLatitude = currentLocation.latitude;
		furgovw.userLongitude = currentLocation.longitude;

		furgovw.latLng = {
			lat: parseFloat(furgovw.userLatitude),
			lng: parseFloat(furgovw.userLongitude)
		};

		if (currentLocation.locality === null || currentLocation.area === null) {
			var my_place = 'LAT:' + currentLocation.latitude + ', LON:' + currentLocation.longitude;
		} else {
			var my_place = currentLocation.locality + ', ' + currentLocation.area;
		}

		$('#fvw_user_location_input').text(my_place);
		$('#fvw_location_name').html(my_place);



		spotService.updateSpotDistance(currentLocation, furgovw.loadAllSpots);


		$('a#fvw_all_spots_button')
			.attr('href', '#search-page');


		map.setCenter(furgovw.latLng);
		furgovw.marker.setMap(null);
		furgovw.marker = new google.maps.Marker({
			position: furgovw.latLng,
			title: "Tu posicion"
		});
		furgovw.marker.setMap(map);
	};



	/*  
    / Gets the datasource depending if is online / offline
	* This method must be moved to download the json under demand
    */
	furgovw.getJsonSource = function () {

		dataSource = furgovw.options.offlineUrl;
		if (furgovw.isOnline === true) {
			dataSource = furgovw.options.apiUrl +
				'?latitude=' + encodeURIComponent(furgovw.userLatitude) +
				'&longitude=' + encodeURIComponent(furgovw.userLongitude);
		}

		return dataSource;
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
	/ Load all spots from datasource
	*/

	furgovw.loadAllSpots = function (spots) {

		console.log("furgovw.Loading all the spots gived from db callback");
		$('#spots_listview').empty();

		furgovw.spots = spots;

		if (spots.length === 0) {

			if (furgovw.mode == furgovw.MODE_FAV) {
				$('#spots_listview').append("No tienes favoritos.");
			} else {
				$('#spots_listview').append("No se han encontrado resultados próximos con el criterio actual. Prueba cambiando los filtros.");
			}

			console.log("No Spots in the spots list"); // TODO  what to do ?
			return;
		}


		$.each(spots, function (index, spot) {

			// Componize the card

			$('#spots_listview').append(furgovw.getSimpleSpotCard(spot));
			$('#spots_list_list')
				.listview('refresh', true);

		});

	};


	/*
	 * Navigates from to position using the plugin
	 */

	furgovw.navigateTo = function (toLatitude, toLongitude) {
		launchnavigator.navigate([toLatitude, toLongitude]);

	};

	/*
	 * Load map and update poistion
	 */

	furgovw.getSimpleSpotCard = function (spot) {

		var card = "";

		// remove nulls

		if (spot.description == null) {
			spot.description = "Sin descripción";
		}


		var geoUrl = "javascript:furgovw.navigateTo(" + spot.latitude + "," + spot.longitude + ")";


		var accent = "";
		if (spot.favourite == 1) {
			accent = "clr-btn-accent-red";
		}


		card = '<div class="nd2-card card-media-right card-media-small">' +
			'<div class="card-media"><img src="data/thumbs/' + spot.id + '.jpg"></div>' +
			'<div class="card-title has-supporting-text">' +
			'<h6 class="card-primary-title">' + spot.name + '</h6>' +
			'<h5 class="card-subtitle">' + '<p>' + parseFloat(spot.distance).toFixed(1) + ' kms</p>' + spot.description + '</h5>' +
			'</div>' +
			'<div class="card-action"><div class="row between-xs"><div class="col-xs-12 align-right"><div class="box">' +
			'<a id="anchor' + spot.id + '"onclick="furgovw.toggleFavourite(' + spot.id + ');" href="#" class="ui-btn ui-btn-inline ui-btn-fab ' + accent + ' waves-effect waves-button waves-effect waves-button"><i class="zmdi zmdi-favorite"></i></a>' +
			'<a href="' + spot.link + '&action=printpage" class="ui-btn ui-btn-inline ui-btn-fab waves-effect waves-button waves-effect waves-button"><i class="zmdi zmdi-mail-reply zmd-flip-horizontal"></i></a>' +
			'<a href="' + geoUrl + '" class="ui-btn ui-btn-inline ui-btn-fab waves-effect waves-button waves-effect waves-button"><i class="zmdi zmdi-navigation"></i></a>' +
			'</div></div></div></div>' +
			'</div>';

		return card;


	};

	/*
	 * Load map and update poistion
	 */

	furgovw.loadMap = function () {

		console.log("furgovw.loadmap. Initializing map");
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
				//furgovw.loadSpotsMap();
				map.firstTime = true;
			}
		});

 
		furgovw.addSpotsToMap(spotService.getAllSpots());

	};




	/*
	 * Load spots from furgovw API
	 */
	furgovw.addSpotsToMap = function (spots) {

		console.log("spots in addSpotsToMap");
		console.log(spots);

		for (var x = 0; x < spots.length; x++) {

			var spot = spots[x];

			var latlng = new google.maps.LatLng(spots[x].latitude, spots[x].longitude);

			var marker = new google.maps.Marker({
				position: latlng,
				latitude: spots[x].latitude,
				longitude: spots[x].longitude,
				distance: spots[x].distance,
				description: spots[x].description,
				favourite: spots[x].favourite,
				name: spots[x].name,
				id: spots[x].id,
				link: spots[x].link,
				image: spots[x].image,
				autor: spots[x].autor,
				icon: furgovw.icons[spots[x].type]

			});
			this.markers.push(marker);

			google.maps.event.addListener(marker, 'click', function () {

				if (this.description === null) {
					this.description = "Sin descripción";
				}

				var accent = "";
				if (this.favourite == 1) {
					accent = "clr-btn-accent-red";
				}

				var geoUrl = "javascript:furgovw.navigateTo(" + this.latitude + "," + this.longitude + ")";

				var card = '<div class="furgovwSpot">' +
					'<div class="card-media"><img src="data/thumbs/' + this.id + '.jpg"></div>' +
					'<div class="card-title has-supporting-text">' +
					'<h6 class="card-primary-title"><strong>' + this.name + '</strong></h6>' +
					'<h5 class="card-subtitle">' + '<p>' + parseFloat(this.distance).toFixed(1) + ' kms</p>' + this.description + '</h5>' +
					'</div>' +
					'<div class="card-action"><div class="row between-xs"><div class="col-xs-12 align-right"><div class="box">' +
					'<a id="anchor_map' + this.id + '" onclick="furgovw.toggleFavouriteMap(' + this.id + ');" href="#" class="ui-btn ui-btn-inline ui-btn-fab ' + accent + ' waves-effect waves-button waves-effect waves-button"><i class="zmdi zmdi-favorite"></i></a>' +
					'<a href="' + this.link + '&action=printpage" class="ui-btn ui-btn-inline ui-btn-fab waves-effect waves-button waves-effect waves-button"><i class="zmdi zmdi-mail-reply zmd-flip-horizontal"></i></a>' +
					'<a href="' + geoUrl + '" class="ui-btn ui-btn-inline ui-btn-fab waves-effect waves-button waves-effect waves-button"><i class="zmdi zmdi-navigation"></i></a>' +
					'</div></div></div></div>' +
					'</div>';


				infowindow.setContent(card);
				infowindow.open(map, this);
			});
		}

		var mcOptions = {
			gridSize: 50,
			imagePath: 'images/m',
			maxZoom: furgovw.options.markerClustererMaxZoom
		};
		this.markerClusterer = new MarkerClusterer(map, this.markers, mcOptions);

		$('.loading').hide();
	};


	/* 
    / Switch Favorite
    */

	furgovw.toggleFavourite = function (id, object) {

		var anchorid = "#anchor" + id;
		$(anchorid).toggleClass("clr-btn-accent-red");

		if (furgovw.mode == furgovw.MODE_FAV) {
			spotService.updateFavourite(id, furgovw.getFavourites);
		} else {
			spotService.updateFavourite(id, function () {});
		}


	};


	furgovw.toggleFavouriteMap = function (id, object) {

		var anchorid = "#anchor_map" + id;
		$(anchorid).toggleClass("clr-btn-accent-red");

		if (furgovw.mode == furgovw.MODE_FAV) {
			spotService.updateFavourite(id, furgovw.getFavourites);
		} else {
			spotService.updateFavourite(id, function () {});
		}


	};

	/* 
	    / Shows the detail. Must be deprecated ? is outdated
	    */
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

			}
		});
	};



})(jQuery);