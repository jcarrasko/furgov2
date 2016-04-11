/**
 * Club Camper Furgovw's Mobile App
 * Copyright (C) 2012, Club Camper Furgovw (furgovw.org)
 * Created by Javier Montes (@mooontes - http://mooontes.com)
 */
var app = {
    initialize: function() {
        console.log('initialize');
        this.bindEvents();
        
    }, bindEvents: function() {
        console.log('bindEvents');
        document.addEventListener("deviceready", this.onDeviceReady, true);
    },

    onDeviceReady: function () {

    console.log('Starting onDeviceReady!');
     
        
/*    var db = openDatabase('mydatabase', '1.0', 'my db', 2*1024*1024);
        //db.openDatabase({name: "demo.db",
        //iosDatabaseLocation: "default"});

    db.transaction(function(tx) {

      
       console.log("Creating DB if no exists");

            // Create the database if doesn't exist
            tx.executeSql("CREATE TABLE IF NOT EXISTS SPOTS ( id integer primary key,type integer,name text,latitude real,longitude real,html text,htmlp text,link text,image text,author text,width integer,lenght integer,destomtom text,id_member text, date text,topic_id integer)");

            console.log("inserting1");
            tx.executeSql('INSERT OR REPLACE INTO SPOTS (id, name) VALUES (1, "spot name 1")');
            console.log("inserting2");
            tx.executeSql('INSERT OR REPLACE INTO SPOTS (id, name) VALUES (2, "spot name 2")'); 
            console.log("inserting3");
            tx.executeSql('INSERT OR REPLACE INTO SPOTS (id, name) VALUES (3, "spot name 3")'); 
            console.log("querying ");
      
        
        
          }, function(err){

        //errors for all transactions are reported here
        console.log("Error: " + err.message);

    });
         db.transaction(function(tx) {
            tx.executeSql('SELECT * FROM SPOTS ',[], function (tx, results) {
             if(results.rows.length > 0) {
                for(var i = 0; i < results.rows.length; i++) {
                    console.log("Result -> " + results.rows.item(i).name + " " + results.rows.item(i).id);
                }
            }
            });
        
        
     
        

        
        
           console.log("create table");
        tx.executeSql("CREATE TABLE IF NOT EXISTS demo (id integer primary key, data text, data_num integer)", [], function(tx, res){

            console.log("insert data");
            tx.executeSql("INSERT INTO demo (id, data, data_num) VALUES (?,?,?)", [1, "test", 100], function(tx,res){

                console.log("retrieve data");
                tx.executeSql("SELECT * FROM demo WHERE id = ?", [1], function(tx, res){
                    for(var iii = 0; iii < res.rows.length; iii++)
                    {
                        console.log("retrieve data in");
                        console.log(res.rows.item(iii).id);
                        console.log(res.rows.item(iii).data);
                        console.log(res.rows.item(iii).data_num);
                    }
                });

            });

        }); 

    }, function(err){

        //errors for all transactions are reported here
        console.log("Error: " + err.message);

    });
        */
        
        
    furgovw.deviceready();

         
   
             

    /*

    sqlitePlugin.openDatabase({
        name: 'furgo.db',
        iosDatabaseLocation: 'default'
    }, function (db) {
        db.transaction(function (tx) {
            console.log("Creating DB if no exists");

            // Create the database if doesn't exist
            tx.executeSql("CREATE TABLE IF NOT EXISTS SPOTS ( id integer primary key,type integer,name text,latitude real,longitude real,html text,htmlp text,link text,image text,author text,width integer,lenght integer,destomtom text,id_member text, date text,topic_id integer)");

            console.log("inserting1");
            tx.executeSql('INSERT INTO SPOTS (id, name) VALUES (1, "spot name 1")');
            console.log("inserting2");
            tx.executeSql('INSERT INTO SPOTS (id, name) VALUES (2, "spot name 2")');


        });
        console.log("querying 1");
        db.transaction(function (txi) {
            console.log("querying 2");

            txi.executeSql('SELECT * FROM SPOTS WHERE id=1', [], function (txi, results) {
                var len = results.rows.length;
                console.log("len" + len);

            });
        });

    });
    console.log("end DB"); */

}

};