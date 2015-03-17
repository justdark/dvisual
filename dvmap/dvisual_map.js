
function addCSSRule(sheet, selector, rules, index) {  
    if("insertRule" in sheet) {  
        sheet.insertRule(selector + "{" + rules + "}", index);  
    }  
    else if("addRule" in sheet) {  
        sheet.addRule(selector, rules, index);  
    }  
} 


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

	L.tileLayer(
		'http://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
		//'https://{s}.tiles.mapbox.com/v3/foursquare.map-0y1jh28j/11/1707/843.png">', {
		maxZoom: 18,
		attribution: 'Map data &copy;<a href="http://openstreetmap.org">OpenStreetMap</a> ,'  +
				'Imagery &copy;<a href="http://mapbox.com">Mapbox</a>' + ',data visualization tool @<a href="https://github.com/justdark/dvisual">DVisual</a>',
		minZoom:2,
		//id: 'examples.map-20v6611k'
		id: 'foursquare.map-0y1jh28j'
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

DVisualMap.prototype.addLegend = function(color_legend_arr,flag)
{
	addCSSRule(document.styleSheets[0], ".legend", "line-height: 18px;color: #555;");
	if (color_legend_arr!=null)
	{
		maxx = 0;
		for (var i=0;i<color_legend_arr.length;i++)
			maxx = Math.max(maxx,String(color_legend_arr[i][1]).length)
		addCSSRule(document.styleSheets[0], ".legend i", "width:"+maxx*9+"px;height: 18px;float: left;margin-right: 8px;opacity: 0.7;");
	}
	if (color_legend_arr==null)
		color_legend_arr = []
	var legend = L.control({position: 'bottomright'});
	var op=0.9;
	if (flag==1)
	    op = 0.6
	legend.onAdd = function (map) {

	    var div = L.DomUtil.create('div', 'info legend')
	    // loop through our density intervals and generate a label with a colored square for each interval
	    for (var i = 0; i < color_legend_arr.length; i++) {

	        div.innerHTML += '<i style="opacity :'+ op +';width:20px;background:' + color_legend_arr[i][0]+ '"></i> ' + color_legend_arr[i][1] +"</br>";
	    }

	    return div;
	};
	if (color_legend_arr.length!=0)
		legend.addTo(this.map);
}
DVisualMap.prototype.setChinaJson = function(color_function,info_function,color_legend_arr)
{
	if (color_function==null)
		color_function = function(prov){return 'rgb(32,140,248)'};
	var geo_json = null;
	addCSSRule(document.styleSheets[0], ".info", "padding: 6px 8px;font: 14px/16px Arial, Helvetica, sans-serif;background: white;background: rgba(255,255,255,0.8);box-shadow: 0 0 15px rgba(0,0,0,0.2);border-radius: 5px;"); 
	addCSSRule(document.styleSheets[0], ".info h4", "margin: 0 0 5px;color: #777;");
	this.addLegend(color_legend_arr,1);
	function geo_json_style(feature) {
	   return {
	       fillColor: color_function(feature.properties.name), //etColor(feature.properties.density),
	       weight: 2,
	       opacity: 1,
	       color: 'white',
	       dashArray: '2',
	       fillOpacity: 0.6
	   };
	}
	function highlightFeature(e) {
	    var layer = e.target;

	    layer.setStyle({
	        weight: 5,
	        color: '#666',
	        dashArray: '',
	        fillOpacity: 0.7
	    });

	    if (!L.Browser.ie && !L.Browser.opera) {
	        layer.bringToFront();
	    }
	    if (info_function!=null)
	    	 info.update(layer.feature.properties.name);
	}

	function resetHighlight(e) {
    	geo_json.resetStyle(e.target);
    	if (info_function!=null)
    		info.update();
	}

	function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight
        });
	}

	var info = L.control();

	info.onAdd = function (map) {
	    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
	    this.update();
	    return this._div;
	};

	// method that we will use to update the control based on feature properties passed
	info.update = function(provience) { this._div.innerHTML =info_function(provience); }

	if (info_function!=null)
	{
		info.addTo(this.map);

	}



	geo_json = L.geoJson(china_geojson_data, {style: geo_json_style,onEachFeature: onEachFeature}).addTo(this.map);
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
		text ="";
		if (arguments.length>=3)
			text = arguments[2]
		this.addDot({'position':new DVisualGeoPosition(arguments[0],arguments[1]),'text':text});
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
								,'radius':4}).bindPopup(newargs.text).addTo(this.map)
		else
			L.circleMarker([newargs['position'].longitude, newargs['position'].latitude],{'fillOpacity':0.8,'opacity':1,'weight':1
								,'fillColor':newargs.color
								,'color':'#eee'
								,'radius':4}).addTo(this.map)
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
