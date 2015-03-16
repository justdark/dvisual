function geo_json_style(feature) {
   return {
       fillColor: '#800026', //etColor(feature.properties.density),
       weight: 2,
       opacity: 1,
       color: 'white',
       dashArray: '3',
       fillOpacity: 0.7
   };
}

function DVisualMap(divID)
{
    //AjaxPage('leafletjs','./leaflet/leaflet.js');

	this.map = L.map(divID).setView([51.505, -0.09], 13);

	L.tileLayer('http://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
		maxZoom: 18,
		attribution: '',
		id: 'examples.map-20v6611k'
	}).addTo(this.map);
	this.setview = false;
	this.greenIcon = L.icon({
    iconUrl: './dvmap_image/green.png',
    iconSize:     [20, 20], // size of the icon
    iconAnchor:   [10, 10], // point of the icon which will correspond to marker's location
    popupAnchor:  [0, 0] // point from which the popup should open relative to the iconAnchor
	});
	this.redIcon = L.icon({
    iconUrl: './dvmap_image/red.png',
    iconSize:     [20, 20], // size of the icon
    iconAnchor:   [10, 10], // point of the icon which will correspond to marker's location
    popupAnchor:  [0, 0] // point from which the popup should open relative to the iconAnchor
	});
	this.darkblueIcon = L.icon({
    iconUrl: './dvmap_image/dark_blue.png',
    iconSize:     [20, 20], // size of the icon
    iconAnchor:   [10, 10], // point of the icon which will correspond to marker's location
    popupAnchor:  [0, 0] // point from which the popup should open relative to the iconAnchor
	});

	//L.geoJson(china_geojson_data, {style: geo_json_style}).addTo(this.map);
}

DVisualMap.prototype.setChinaJson = function(color_function)
{
	if (color_function==null)
		color_function = function(prov){return '#800026'};
	function geo_json_style(feature) {
	   return {
	       fillColor: color_function(feature.properties.name), //etColor(feature.properties.density),
	       weight: 2,
	       opacity: 1,
	       color: 'white',
	       dashArray: '2',
	       fillOpacity: 0.7
	   };
	}
	L.geoJson(china_geojson_data, {style: geo_json_style}).addTo(this.map);
}
function DVisualGeoPosition(longitude,latitude)
{
	this.longitude = 0;
	this.latitude = 0;
	if (arguments.length>=1)
		this.longitude = longitude;
	if (arguments.length>=2)
		this.latitude = latitude;
}

DVisualMap.prototype.addDot = function(args)
{
	if (arguments.length >= 2)
	{
		this.addDot({'position':new DVisualGeoPosition(arguments[0],arguments[1])});
		return 0;
	}
	var newargs = args;

	if (args['position']==null)
		newargs['position'] = new DVisualGeoPosition();

	if (args['color']==null)
		newargs['color'] = "green";

	if (args['radius']==null )
		newargs['radius'] = 100;

	if (args['style']==null || (args.style!="dot" && args.style!="bubble"))
		newargs['style'] = "dot";

	if (args['text']==null)
		newargs['text'] = "";

	var asicon = this.greenIcon;

	if (newargs.color=='red')
		asicon = this.redIcon;
	else if (newargs.color=='green')
		asicon = this.greenIcon;
	else if (newargs.color=='dark_blue')
		asicon = this.darkblueIcon;
	var tmp = null;
	if (newargs.style=='bubble')
	{

		//tmp = L.marker([newargs['position'].longitude, newargs['position'].latitude], {icon: asicon}).addTo(this.map);
		tmp = L.circle([newargs['position'].longitude, newargs['position'].latitude], newargs['radius'], {
							    color: newargs.color,
							    fillColor: newargs.color,
							    fillOpacity: 0.5
							}).addTo(this.map);
	}
	else if (newargs.style=='dot')
	{
		if (newargs.text!="")
			L.circleMarker([newargs['position'].longitude, newargs['position'].latitude],{'fillOpacity':0.8,'opacity':1,'weight':1
								,'fillColor':newargs.color
								,'color':'#eee'
								,'radius':3.5}).bindPopup(newargs.text).addTo(this.map)
		else
			L.circleMarker([newargs['position'].longitude, newargs['position'].latitude],{'fillOpacity':0.8,'opacity':1,'weight':1
								,'fillColor':newargs.color
								,'color':'#eee'
								,'radius':3.5}).addTo(this.map)
		//tmp = L.marker([newargs['position'].longitude, newargs['position'].latitude], {icon: asicon}).addTo(this.map);
	}


	if (this.setview==false)
	{
		this.setview = true;
		this.map.setView([newargs['position'].longitude,newargs['position'].latitude],6)
	}
	//this.map.setView([newargs['position'].longitude,newargs['position'].latitude],7)
}

DVisualMap.prototype.addDots = function(arr)
{
	if (arr[0].length!=2)
		return;
	var sumlong = 0;
	var sumlati = 0;
	for (var i = 0;i<arr.length;i++)
	{
		sumlong += arr[i][0];
		sumlati += arr[i][1];
		this.addDot({'position':new DVisualGeoPosition(arr[i][0],arr[i][1])});
	}
	this.map.setView([sumlong/arr.length,sumlati/arr.length],6);
}

DVisualMap.prototype.addLines = function(array,color,smooth)
{
	if (arguments.length<3)
	{
		smooth = 0.0;
	}
	if (arguments.length<2)
	{
		color = 'red';
	}
	lats = [];
	for (var i=0;i<array.length;i++)
		lats.push(L.latLng(array[i][0], array[i][1]))


	L.polyline(lats, {'color': color,smoothFactor: 1,fillColor:'#eee',weight:2.2,fill:true}).addTo(this.map)
}
