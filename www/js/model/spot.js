/**
 * FurgoPerfectos 
 * Created by Jose Carrasco (@jcarrasko) derivated from Javier Montes (@mooontes) 
 */

/*
 * Spot Object
 */

function spot(id, type, name, latitude, longitude, html , htmlp, link , image, author, width, lenght, destomtom, id_member, date, topic_id) {
    // Furgo ID
	this.id = id;
    // Spot Data
	this.type = type;
    this.latitude = latitude;
    this.longitude = longitude;
	
	// Html data
	this.html = html;
    this.htmlp = htmlp;
	this.link = link;
    this.image = image;
	this.author = author;
    
	this.width = width;
    this.lenght = lenght;
	
	// Extras
	this.destomtom = destomtom;
	this.isFree=isFree;
	this.hasWater=hasWater;
	this.hasWc=hasWc;
	this.hasEmptying=hasEmptying;
	
	// Furgovw Data 
    this.id_member = id_member;
	this.date = date;
    this.topic_id = topic_id;
	
}

