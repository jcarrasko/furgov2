//furgovw must be included here or in separate
var app = {
    initialize: function() {
        console.log('initialize');
        this.bindEvents();
        
    }, bindEvents: function() {
        console.log('bindEvents');
        document.addEventListener("deviceready", this.onDeviceReady, true);
    },

    onDeviceReady: function () {

    console.log('Calling onDeviceReady!');
     
        
    furgovw.deviceready();


}

};