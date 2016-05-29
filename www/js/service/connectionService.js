
var connectionService = {};

/*var connectionService.networkState = navigator.connection.type;
connectionService.states = {};
	connectionService.states[Connection.UNKNOWN] = 'Unknown connection';
	connectionService.states[Connection.ETHERNET] = 'Ethernet connection';
	connectionService.states[Connection.WIFI] = 'WiFi connection';
	connectionService.states[Connection.CELL_2G] = 'Cell 2G connection';
	connectionService.states[Connection.CELL_3G] = 'Cell 3G connection';
	connectionService.states[Connection.CELL_4G] = 'Cell 4G connection';
	connectionService.states[Connection.CELL] = 'Cell generic connection';
	connectionService.states[Connection.NONE] = 'No network connection';*/




/*
 * Init that service
 */

connectionService.initService = function () {

    console.log("connectionService::initializing connectionService");
	 
};

/*
 * Checks the connection
 */

connectionService.isOnline = function () {
	
	 console.log("connectionService::asking connectionService");
	 
		
		_isOnline=false;
		//If there's no internet connection
        if (navigator.connection.type == Connection.NONE) {
            console.log("connectionService.No connection is available. Type of connection is " + Connection.NONE);
			 console.log("connectionService::no connection");
            _isOnline=false;
        } else {
			 console.log("connectionService::yes connection");
            _isOnline=true;
        }
	
	 console.log("connectionService:: connection:"+_isOnline);
	return _isOnline;
	
};