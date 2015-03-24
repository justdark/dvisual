CanvasRenderingContext2D.prototype.sector = function (x, y, radius, sDeg, eDeg) {
	this.save();
	this.translate(x, y);
	this.beginPath();
	this.arc(0,0,radius,sDeg, eDeg);
	this.save();
	this.rotate(eDeg);
	this.moveTo(radius,0);
	if ((eDeg - sDeg)%(Math.PI*2)!=0)
		this.lineTo(0,0);
	//this.lineTo(0,0);
	this.restore();
	this.rotate(sDeg);
	this.lineTo(radius,0);
	this.closePath();
	this.restore();
	return this;
}
CanvasRenderingContext2D.prototype.clear_canvas = function () {
	this.clearRect(0,0,10000,10000);
	return this;
}

CanvasRenderingContext2D.prototype.clear_arc = function() {
    this.save();
    this.globalCompositeOperation = 'destination-out';
    this.fillStyle = 'black';
    this.fill();
    this.restore();
};

CanvasRenderingContext2D.prototype.clearArc = function(x, y, radius, startAngle, endAngle, anticlockwise) {
    this.beginPath();
    this.arc(x, y, radius, startAngle, endAngle, anticlockwise);
    this.clear_arc();
};

DVChartList = [DVBarChart,DVPieChart,DVLineChart,DVHistChart,DVRadarChart,DVMulLineChart,DVMulBarChart];
DVCanvasList = [];

Object.prototype.cloneAll=function(){
	function clonePrototype(){};
	clonePrototype.prototype = this;
	var obj = new clonePrototype();
	for(var ele in obj){
		if(typeof(obj[ele])=='object')
			obj[ele] = obj[ele].cloneAll();
	}
	return obj;
}


Array.prototype.max = function()
{ 
	return Math.max.apply({},this) 
} 
Array.prototype.min = function()
{ 
	return Math.min.apply({},this) 
} 

/**
 * The Main Class of DVisual
 * @constructor
 * @param {string} canvasName - the canvas's id you want to paint
 * @example new DVisual(canvas_id);
 */
function DVisual(canvasName)
{
	reshape_flag = true;
	for (var i=0;i<DVCanvasList.length;i++)
		if (DVCanvasList[i]==canvasName)
		{
			reshape_flag = false;
		}
	if (reshape_flag)
		DVCanvasList.push(canvasName);
 	this.canvas = document.getElementById(canvasName);
	this.ctx = this.canvas.getContext('2d');
	this.ctx.clear_canvas();
	this.eles = new Array();

	this.devicePixelRatio = window.devicePixelRatio || 1;
    this.backingStorePixelRatio = this.ctx.webkitBackingStorePixelRatio ||
                                             this.ctx.mozBackingStorePixelRatio ||
                                             this.ctx.msBackingStorePixelRatio ||
                                             this.ctx.oBackingStorePixelRatio ||
                                             this.ctx.backingStorePixelRatio || 1;
    this.ratio =  this.devicePixelRatio / this.backingStorePixelRatio;
    if (reshape_flag)
    {
    	this.oldWidth = this.canvas.width;
    	this.oldHeight = this.canvas.height;
		if (this.devicePixelRatio !== this.backingStorePixelRatio) 
		{
			this.canvas.width = this.oldWidth * this.ratio;
			this.canvas.height = this.oldHeight * this.ratio;

			this.canvas.style.width = this.oldWidth + 'px';
			this.canvas.style.height = this.oldHeight + 'px';
			this.ctx.scale(this.ratio, this.ratio);
	    }
	} else
	{
		this.oldWidth = this.canvas.width/this.ratio;
    	this.oldHeight = this.canvas.height/this.ratio;
	}

    this.Xinc = 0;
	this.Yinc = 0;
	this.Xmargin = this.oldWidth - 40;
	this.Ymargin = this.oldHeight - 55; 
	this.XZoom = 1;
	this.YZoom = 1;
	this.originX = 25;
	this.originY = this.oldHeight - 40;
	this.drawed = false;
	this.mouseMove = false;
	this.clickDot = {'X':new Array(),'Y':new Array()};
    // canvasName = this;
    // this.canvas.addEventListener('mousemove', function(e){
    //   p = getEventPosition(e);
    //   canvasName.ctx.clear();
    //   canvasName.draw()

    //   canvasName.ctx.moveTo(0,p.y);
    //   canvasName.ctx.lineTo(canvasName.oldWidth,p.y);
    //   canvasName.ctx.moveTo(p.x,0);
    //   canvasName.ctx.lineTo(p.x,canvasName.oldHeight);
    //   canvasName.ctx.strokeText(canvasName.transXY(p.x,p.y)[0].toFixed(2)+" "+canvasName.transXY(p.x,p.y)[1].toFixed(2),p.x,p.y)
    //   canvasName.ctx.stroke();
      
    // }, false);
  
}
/**
 * set the mouseMove to true,you can get the coordinate when you move the mouse on the canvas
 * @function
 */
DVisual.prototype.setMouseMove = function()
{
	this.mouseMove = true;
    var canvasName = this;
    this.canvas.addEventListener('mousemove', function(e){
      p = getEventPosition(e);
      canvasName.ctx.clear_canvas();
      canvasName.draw()

      canvasName.ctx.moveTo(0,p.y);
      canvasName.ctx.lineTo(canvasName.oldWidth,p.y);
      canvasName.ctx.moveTo(p.x,0);
      canvasName.ctx.lineTo(p.x,canvasName.oldHeight);
      canvasName.ctx.strokeText(canvasName.transXY(p.x,p.y)[0].toFixed(2)+" "+canvasName.transXY(p.x,p.y)[1].toFixed(2),p.x,p.y)
      canvasName.ctx.stroke();
      
    }, false);
}

/**
 * set the clickDot to true,you can click the canvas to add a dot on the canvas
 * @function
 * @param {DVColor} - the color of the dot you want
 */
DVisual.prototype.setClickDot = function(color)
{
    var canvasName = this;
    if (arguments.length==0)
    	color = DVgetRandomColor(1)[0];

    this.canvas.addEventListener('mouseup', function(e){
      p = getEventPosition(e);
      canvasName.ctx.clear_canvas();
      canvasName.addElement(new DVDot({'x':p.x,'y':p.y,'color':color}));
      canvasName.draw();
      real = canvasName.transXY(p.x,p.y);
      canvasName.clickDot.X.push(real[0]);
      canvasName.clickDot.Y.push(real[1]);
    }, false);
}
/**
 * return 
 * @function
 * @return {Objects} clickDot - return the clicked dot data
 */
DVisual.prototype.getClickDot = function()
{
   return this.clickDot;
}


/**
 * The Formated Color Class of DVisual
 * @constructor
 * @param {double} r - the Red component of RGBs,0 in default,[0-256]
 * @param {double} g - the Green component of RGBs,0 in default,[0-256]
 * @param {double} b - the Blue component of RGBs,0 in default,[0-256]
 * @param {double} a - the Alpha component of RGBa,1 in default,[0-1]
 */
function DVColor(r,g,b,a)
{
	if (arguments.length<4)
		a = 1;
	if (arguments.length<3)
		b = 0;
	if (arguments.length<2)
		g = 0;
	if (arguments.length<1)
		r = 0;
	this.a = a;
	this.r = r;
	this.g = g;
	this.b = b;
}
/**
 * translate the color to the html color style
 * @function
 * @return {string} the rgba style string
 */
DVColor.prototype.tostring = function()
{
	return "rgba("+this.r+","+this.g+","+this.b+","+this.a+")";
}

/**
 * get the eventPosition on canvas
 * @function
 * @return {{}} {x:x,y:y}
 */
function getEventPosition(ev){
  	var x, y;
  	if (ev.layerX || ev.layerX == 0) {
    	x = ev.layerX;
    	y = ev.layerY;
 	}else if (ev.offsetX || ev.offsetX == 0) { // Opera
    	x = ev.offsetX;
    	y = ev.offsetY;
  	}
  	return {x: x, y: y};
}



/**
 * translate the x and y coordinate from data space to real canvas space
 * @function
 * @param {double} x - x value in data space
 * @param {double} y - y value in data space
 * @return {Array(double)} [resultX,resultY] - the real coordinate value of (x,y)
 */
DVisual.prototype.xyTrans = function(x,y)
{
	resultX = (x*1.0 - this.Xinc)/this.XZoom + this.originX;
	resultY = this.originY - (y*1.0 - this.Yinc)/this.YZoom;
	return [resultX,resultY]
}

/**
 * translate the x and y coordinate from real canvas space to data space
 * @function
 * @param {double} x - x value in real canvas space
 * @param {double} y - y value in real canvas space
 * @return {Array(double)} [resultX,resultY] - the real coordinate value of (x,y)
 */
DVisual.prototype.transXY = function(x,y)
{
	resultX = (x - this.originX)*this.XZoom+this.Xinc;
	resultY = (this.originY - y)*this.YZoom+this.Yinc;
	return [resultX,resultY]
}

/**
 * translate the x length from data space to real canvas space
 * @function
 * @param {double} len - the length in data space
 * @return {double} length - the length in real canvas space
 */
DVisual.prototype.xLenTrans = function(len) {
	return len*1.0/this.XZoom;
}

/**
 * translate the y length from data space to real canvas space
 * @function
 * @param {double} len - the length in data space
 * @return {double} length - the length in real canvas space
 */
DVisual.prototype.yLenTrans = function(len) {
	return len*1.0/this.YZoom;
}

/**
 * initialize the Z data degree for zoom
 * @function
 * @param {Array(double)} Z - the Z degree data,should contain the maxium and minum.
 */
DVisual.prototype.initialZ = function(Z) {
		zmm = [Z.min(),Z.max()];
		this.zinc = 0;
		if ((zmm[1]-zmm[0])*1.0/zmm[0]<0.2)
			this.zinc = zmm[0];
		this.Zzoom = (Math.min(this.oldWidth,this.oldHeight)/10 - 5)/(zmm[1] - this.zinc);
}

/**
 * translate the z length from data space to real canvas space
 * @function
 * @param {double} len - the length in data space
 * @return {double} length - the length in real canvas space
 */
DVisual.prototype.zLenTrans = function(len)
{
		return (len - this.zinc)*this.Zzoom+5;

}

/**
 * set the base value of X and Y
 * @function
 * @param {double} Xinc - the base increment value of X
 * @param {double} Yinc - the base increment value of Y
 */
DVisual.prototype.setinc = function(Xinc,Yinc)
{
	this.Xinc = Xinc;
	this.Yinc = Yinc;
};

/**
 * set the margin of data space,set the zoom value of x and y;
 * @function
 * @param {double} Xmargin - the margin of X in data space
 * @param {double} Ymargin - the margin of Y in data space
 */
DVisual.prototype.setmargin = function(Xmargin,Ymargin)
{	
	this.XZoom = Xmargin*1.2/this.Xmargin;
	this.YZoom = Ymargin*1.2/this.Ymargin;
	this.Xmargin = Xmargin*1.2;
	this.Ymargin = Ymargin*1.2;
};

/**
 * intialize the zoom and margin of X and Y
 * @function
 * @param {Array(double)} X - the data'X
 * @param {Array(double)} Y - the data'Y 
 */
DVisual.prototype.initial = function(X,Y)
{	
	incX = Math.min(0.0,Math.floor(X.min()));
	incY = Math.min(0.0,Math.floor(Y.min()));
	xmargin = this.oldWidth;
	ymargin = this.oldHeight;
	if (this.Drawed)
	{
		return 0;
	}
	
	if (X.length!=0)
	{
		xm = (X.max()-X.min())*1.0;
		if ((xm/X.max())<0.3)
			incX = Math.floor(X.min())-1;
		xmargin = X.max()-incX;
	}
	if (Y.length!=0)
	{
		ym = (Y.max()-Y.min())*1.0;
		if ((ym/Y.max())<0.3)
			incY = Math.floor(Y.min())-1;
		ymargin = Y.max()-incY;
	}
	this.setinc(incX,incY);

	this.setmargin(xmargin,ymargin);

	this.Drawed = true;
};

/**
 * add the element to the main class
 * @function
 * @param {DVElement} ele - DVElement can be any DVisual Graph Class,contain a draw() fucntion to draw itself on canvas.
 */
DVisual.prototype.addElement = function(ele)
{

	this.eles.push(ele);
}

/**
 * draw all graph on the canvas
 * @function
 */
DVisual.prototype.draw = function()
{
	for (var i=this.eles.length-1;i>=0;i--)
		this.eles[i].draw(this);
}



/**
 * A DVisual graph element indicate a dot.(bubble)
 * @constructor
 * @example new DVDot({'x':100,'y':100});
 * @param {Object[]} args - a array contain arguments below
 * @param {double} args.x - the x value of the dot
 * @param {double} args.y - the y value of the dot,0 in default
 * @param {DVColor=} [args.color = new DVColor()] - the color of the dot,black in default
 * @param {string=} [args.style ='fill']- the style of this dot,should be one of 'fill','stroke' and 'bubble'
 * @param {string=} [args.bubbleText ='']- the text show in the bubble
 * @param {boolean=} [args.shadow ='true'] - whether draw dot's shadow.
 * @param {double=} [args.radius = '2'] - the radius of this dot(a circle)
 * @param {double=} [args.lineWidth = '1'] - the lineWidth of this dot(a circle)
 */

function DVDot(args)
{

	if (arguments.length==0)
		args = {};
	this.args = args.cloneAll();
	if (args['x']==null)
		this.args['x'] = 0;

	if (args['y']==null)
		this.args['y'] = 0;

	if (args['color']==null)
		this.args['color'] = new DVColor();

	if (args['style']==null || (args.style!="fill" && args.style!="stroke" && args.style!="bubble" ))
		this.args['style'] = "fill";

	if (args['bubbleText']==null)
		this.args['bubbleText'] = "";

	if (args['shadow']==null)
		this.args['shadow'] = true;

	if (args['radius']==null)
		this.args['radius'] = 2;
	
	if (args['lineWidth']==null)
		this.args['lineWidth'] = 1;

}

/**
 * draw the dot on dv's canvas
 * @function
 * @param {DVisual} dv - the Dvisual instance you want to draw the dot
 */
DVDot.prototype.draw = function(dv)
{
	dv.ctx.save();
	dv.ctx.fillStyle = this.args.color.tostring();
	dv.ctx.strokeStyle = this.args.color.tostring();
	dv.ctx.lineWidth = this.args['lineWidth'];
	shadow = new DVColor(100,100,100,0.3);
	if (this.args['shadow'])
	{
		if (this.shadowDot == null)
		{
			shadowArgs = this.args.cloneAll();
			shadowArgs['color'] = new DVColor(100,100,100,0.3);
			shadowArgs['shadow'] = false;
			shadowArgs['x']+=1;
			shadowArgs['y']+=1;
			shadowArgs['description'] = "";
			this.shadowDot = new DVDot(shadowArgs);
		}
		this.shadowDot.draw(dv);
	}
	if (this.args['style']=='stroke')
	{
		dv.ctx.sector(this.args.x,this.args.y,this.args.radius,0,2*Math.PI);
		dv.ctx.stroke();
	}
	if (this.args['style']=='fill')
	{
		dv.ctx.sector(this.args.x,this.args.y,this.args.radius,0,2*Math.PI);
		dv.ctx.fill();
	}
	if (this.args['style']=='bubble')
	{
		dv.ctx.sector(this.args.x,this.args.y,this.args.radius,0,2*Math.PI);
		dv.ctx.stroke();
		a = this.args.color.a;
		if (this.args.color.a>0.7)
			a = 0.4;
		dv.ctx.fillStyle = (new DVColor(this.args.color.r,this.args.color.g,this.args.color.b,a)).tostring();
		dv.ctx.sector(this.args.x,this.args.y,this.args.radius,0,2*Math.PI);
		dv.ctx.fill();
		if (this.args.bubbleText.length>0)
		{
			testStr = this.args.bubbleText;
			if (dv.ctx.measureText("D").width>dv.ctx.measureText("testStr").width)
				teststr = 'D';
			rightfont = DVgetRightTextStyleByStrLenght(dv,teststr,this.args.radius*1.5);
			dv.ctx.font = rightfont;
			dv.ctx.textAlign = 'center';
			dv.ctx.fillStyle = '#FFF';
			dv.ctx.fillText(this.args.bubbleText,this.args.x,this.args.y+dv.ctx.measureText("D").width*1.0/2);
			dv.ctx.closePath();
		}
	}
	dv.ctx.restore();
}


/**
 * A DVisual graph element indicate a text
 * @constructor
 * @example new DVDot({'x':100,'y':100,'font'="13px Arial"});
 * @param {Object[]} args - a array contain arguments below
 * @param {double} args.x - the x value of the dot
 * @param {double} args.y - the y value of the dot,0 in default
 * @param {string} args.text - the text content you want to draw
 * @param {string=} [args.font="8px Arial"] - the text's font
 * @param {DVColor=} [args.color = new DVColor()] - the color of the dot,black in default
 * @param {string=} [args.style ='fill']- the style of this dot,should be one of 'fill','stroke'
 * @param {boolean=} [args.shadow =true] - whether draw text's shadow.
 * @param {double=} [args.maxwidth =-1] - the limited width of printed text,-1 means no limit
 * @param {string=} [args.textAlign = 'left'] - the text align of printed text position
 * @param {string=} [args.direction = 'horizontal'] - the direction of text:horizontal or vertical
 * @param {double=} [args.lineWidth = '1'] - the lineWidth of text
 * @param {double=} [args.rotate = 0] - the lineWidth of text
 */
function DVText(args)
{
	if (arguments.length==0)
		args = {};
	this.args = args.cloneAll();
	if (args['x']==null)
		this.args['x'] = 0;

	if (args['y']==null)
		this.args['y'] = 0;

	if (args['text']==null)
		this.args['text'] = "";

	if (args['font']==null)
		this.args['font'] = "8px Arial";

	if (args['color']==null)
		this.args['color'] = new DVColor();

	if (args['style']==null || (args.style!="stroke" && args.style!="fill"))
		this.args['style'] = "fill";

	if (args['shadow']==null)
		this.args['shadow'] = true;

	if (args['maxwidth']==null)
		this.args['maxwidth'] = -1;

	if (args['lineWidth']==null)
		this.args['lineWidth'] = 1;

	if (args['rotate']==null)
		this.args['rotate'] = 0;

	if (args['textAlign']==null)
		this.args['textAlign'] = 'left';

	if (args['direction']==null || (args['direction']!='vertical' && args['direction']!='horizontal'))
		this.args['direction'] = 'horizontal';

}
/**
 * draw the text on dv's canvas
 * @function
 * @param {DVisual} dv - the Dvisual instance you want to draw
 */
DVText.prototype.draw = function(dv)
{
	dv.ctx.save();
	dv.ctx.fillStyle = this.args.color.tostring();
	dv.ctx.strokeStyle = this.args.color.tostring();
	dv.ctx.font = this.args['font'];
	dv.ctx.lineWidth = this.args['lineWidth'];
	dv.ctx.textAlign = this.args['textAlign'];
	dv.ctx.beginPath();
	shadow = new DVColor(100,100,100,0.3);
	if (this.args['shadow'])
	{
		if (this.shadowText == null)
		{
			shadowArgs = this.args.cloneAll();
			shadowArgs['color'] = new DVColor(100,100,100,0.3);
			shadowArgs['shadow'] = false;
			shadowArgs['x']+=1;
			shadowArgs['y']+=1;
			this.shadowText = new DVText(shadowArgs);
		}
		this.shadowText.draw(dv);
	}
	x = this.args.x;
	y = this.args.y;
	if (this.args.direction=='vertical')
	{
		dv.ctx.rotate(-Math.PI/2)
		tmp = x;
		x = -y;
		y = tmp;
	}
	if (this.args.rotate!=0)
	{
		
		dv.ctx.translate(x,y);
		x = 0;
		y = 0;
		dv.ctx.rotate(this.args.rotate);
	}
	if (this.args['style']=='stroke')
	{
		if (this.args['maxwidth']==-1)
			dv.ctx.strokeText(this.args.text,x,y);
		else
			dv.ctx.strokeText(this.args.text,x,y,this.args['maxwidth']);
	}
	if (this.args['style']=='fill')
	{
		if (this.args['maxwidth']==-1)
			dv.ctx.fillText(this.args.text,x,y);
		else
			dv.ctx.fillText(this.args.text,x,y,this.args['maxwidth']);
	}
	if (this.args.direction=='vertical')
	{
		dv.ctx.rotate(Math.PI/2);
	}
	if (this.args.rotate!=0)
	{
		dv.ctx.rotate(-this.args.rotate);
		dv.ctx.translate(-this.args.x,-this.args.y);
	}
	dv.ctx.fill();
	dv.ctx.closePath();
	dv.ctx.restore();
}

/**
 * A DVisual graph element indicate a line
 * @constructor
 * @example new DVLine({'beginX':100,'beginY':100,'endX':20,'endY':20,'style':'dash'});
 * @param {Object[]} args - a array contain arguments below
 * @param {double} args.beginX - the x value of the start node
 * @param {double} args.beginY - the y value of the start node
 * @param {double} args.endX - the x value of the stop node
 * @param {double} args.endY - the y value of the stop node
 * @param {DVColor=} [args.color = new DVColor()] - the color of the dot,black in default
 * @param {string=} [args.style ='real']- the style of this dot,should be one of 'real','dash'
 * @param {boolean=} [args.shadow =true] - whether draw the line's shadow.
 * @param {double=} [args.lineWidth = '1'] - the lineWidth of line
 */
function DVLine(args)
{
	if (arguments.length==0)
		args = {};
	this.args = args.cloneAll();
	if (args['beginX']==null)
		this.args['beginX'] = 0;

	if (args['beginY']==null)
		this.args['beginY'] = 0;

	if (args['endX']==null)
		this.args['endX'] = 0;

	if (args['endY']==null)
		this.args['endY'] = 0;

	if (args['color']==null)
		this.args['color'] = new DVColor();

	if (args['style']==null || (args.style!="real" && args.style!="dash"))
		this.args['style'] = "real";

	if (args['shadow']==null)
		this.args['shadow'] = true;
	
	if (args['lineWidth']==null)
		this.args['lineWidth'] = 1;
}
/**
 * get the shadow according to the line's direction
 * @function
 * @return [0,1]
 */
DVLine.prototype.getShadow = function()
{
	// if ((this.args.beginX<this.args.endX && this.args.beginY<=this.args.endY)
	// 	|| (this.args.beginX>this.args.endX && this.args.beginY>this.args.endY))
	// 	return [0,-1]
	return [0,1]
}
/**
 * whether the node in the lines's region
 * @function
 * @param {double} x -the x value of test node
 * @param {double} y -the y value of test node
 * @return {boolean} result -whether (x,y) is in the line's region
 */
DVLine.prototype.between =function(x,y)
{
	if (x>=Math.min(this.args['beginX'],this.args['endX']) && x<=Math.max(this.args['beginX'],this.args['endX']) &&
		y>=Math.min(this.args['beginY'],this.args['endY']) && y<=Math.max(this.args['beginY'],this.args['endY']))
		return true;
	return false;
}
/**
 * draw the line on dv's canvas
 * @function
 * @param {DVisual} dv - the Dvisual instance you want to draw 
 */
DVLine.prototype.draw = function(dv)
{
	dv.ctx.save();
	dv.ctx.fillStyle = this.args.color.tostring();
	dv.ctx.strokeStyle = this.args.color.tostring();
	dv.ctx.lineWidth = this.args['lineWidth'];
	if (this.args['shadow'])
	{
		if (this.shadowLine==null)
		{
			shadowArgs = this.args.cloneAll();
			shadowArgs['color'] = new DVColor(100,100,100,0.3);
			shadowArgs['shadow'] = false;
			shadow = this.getShadow();
			shadowArgs['beginX']+=shadow[0];
			shadowArgs['beginY']+=shadow[1];
			shadowArgs['endX']+=shadow[0];
			shadowArgs['endY']+=shadow[1];
			this.shadowLine = new DVLine(shadowArgs);
		}
		
		this.shadowLine.draw(dv);
	}
	if (this.args['style']=='real')
	{
		dv.ctx.beginPath();
		dv.ctx.moveTo(this.args.beginX,this.args.beginY);
		dv.ctx.lineTo(this.args.endX,this.args.endY);
		dv.ctx.closePath();
		dv.ctx.fill();
		dv.ctx.stroke();
	}
	if (this.args['style']=='dash')
	{
		dv.ctx.beginPath();
		xinc = this.args['endX'] - this.args['beginX'];
		yinc = this.args['endY'] - this.args['beginY'];
		length = Math.sqrt(xinc*xinc+yinc*yinc);
		doted = Math.max(length*1.0/50,5);

		xinc*=doted/length;
		yinc*=doted/length;
		x = this.args['beginX'];
		y = this.args['beginY'];
		while (this.between(x+xinc,y+yinc))
		{
			dv.ctx.moveTo(x,y)
			dv.ctx.lineTo(x+xinc,y+yinc)
			x+=2*xinc;
			y+=2*yinc;
		}
		dv.ctx.moveTo(x,y)
		dv.ctx.lineTo(this.args['endX'],this.args['endY'])
		dv.ctx.closePath();
		dv.ctx.stroke();
	}
	dv.ctx.restore();
}




/**
 * A DVisual graph element indicate a quadratic Curve
 * @constructor
 * @example new DVLine({'beginX':100,'beginY':100,'endX':20,'endY':20,'style':'dash'});
 * @param {Object[]} args - a array contain arguments below
 * @param {double} args.beginX - the x value of the start node
 * @param {double} args.beginY - the y value of the start node
 * @param {double} args.endX - the x value of the stop node
 * @param {double} args.endY - the y value of the stop node
 * @param {double} args.cpx - the x value of the control node
 * @param {double} args.cpy - the y value of the control node
 * @param {DVColor=} [args.color = new DVColor()] - the color of the dot,black in default
 * @param {double=} [args.lineWidth = '1'] - the lineWidth of line
 */
function DVCurve(args)
{
	if (arguments.length==0)
		args = {};
	this.args = args.cloneAll();
	if (args['beginX']==null)
		this.args['beginX'] = 0;

	if (args['beginY']==null)
		this.args['beginY'] = 0;

	if (args['endX']==null)
		this.args['endX'] = 0;

	if (args['endY']==null)
		this.args['endY'] = 0;

	if (args['color']==null)
		this.args['color'] = new DVColor();

	if (args['lineWidth']==null)
		this.args['lineWidth'] = 1;
}


/**
 * draw the curve on dv's canvas
 * @function
 * @param {DVisual} dv - the Dvisual instance you want to draw 
 */
DVCurve.prototype.draw = function(dv)
{
	dv.ctx.save();
	dv.ctx.fillStyle = this.args.color.tostring();
	dv.ctx.strokeStyle = this.args.color.tostring();
	dv.ctx.lineWidth = this.args['lineWidth'];
	dv.ctx.beginPath();
	dv.ctx.moveTo(this.args.beginX,this.args.beginY);
	dv.ctx.quadraticCurveTo(this.args.cpx,this.args.cpy,this.args.endX,this.args.endY);
	dv.ctx.stroke();
	dv.ctx.restore();
}



/**
 * A DVisual graph element indicate a polygon
 * @constructor
 * @example new DVPolygon({'X':[10,10,20,20],'Y':[10,20,20,10],'style':'stroke'});
 * @param {Object[]} args - a array contain arguments below
 * @param {Array(double)} args.X - the set of a series nodes' x value
 * @param {Array(double)} args.Y - the set of a series nodes' y value
 * @param {DVColor=} [args.color = new DVColor()] - the color of the dot,black in default
 * @param {string=} [args.style ='fill']- the style of this dot,should be one of 'fill','stroke'
 * @param {boolean=} [args.shadow =true] - whether draw text's shadow.
 * @param {double=} [args.lineWidth = '1'] - the lineWidth of text
 */
 function DVPolygon(args)
{
	if (arguments.length==0)
		args = {};
	this.args = args.cloneAll();
	if (args['X']==null)
		this.args['X'] = [];

	if (args['Y']==null)
		this.args['Y'] = [];

	if (this.args.X.length!=this.args.Y.length)
		return null;

	if (args['color']==null)
		this.args['color'] = new DVColor();

	if (args['style']==null || (args.style!="fill" && args.style!="stroke" && args.style!="transFill"))
		this.args['style'] = "transFill";

	if (args['shadow']==null)
		this.args['shadow'] = true;
	
	if (args['lineWidth']==null)
		this.args['lineWidth'] = 1;

}

/**
 * draw the polygon on dv's canvas
 * @function
 * @param {DVisual} dv - the Dvisual instance you want to draw 
 */
DVPolygon.prototype.draw = function(dv)
{
	dv.ctx.save();
	dv.ctx.fillStyle = this.args.color.tostring();
	dv.ctx.strokeStyle = this.args.color.tostring();
	dv.ctx.lineWidth = this.args['lineWidth'];
	if (this.args['shadow'])
	{
		if (this.shadowPoly==null)
		{
			shadowArgs = this.args.cloneAll();
			shadowArgs['color'] = new DVColor(200,200,200,0.3);
			shadowArgs['shadow'] = false;
			for (var i=0;i<shadowArgs.X.length;i++ )
			{
				shadowArgs.X[i]+=1;
				shadowArgs.Y[i]+=1;
			}
			this.shadowPoly = new DVPolygon(shadowArgs);
		}
		this.shadowPoly.draw(dv);
	}
	if (this.args['style']=='stroke' || this.args['style']=='fill')
	{
		dv.ctx.beginPath();
		dv.ctx.moveTo(this.args.X[0],this.args.Y[0]);
		for (var i=0;i<this.args.X.length;i++)
		{
			dv.ctx.lineTo(this.args.X[(i+1)%this.args.X.length],this.args.Y[(i+1)%this.args.X.length]);
		}
		dv.ctx.closePath();
		if (this.args['style']=='stroke')
			dv.ctx.stroke();
		if (this.args['style']=='fill')
			dv.ctx.fill();
	}

	if (this.args['style']=='transFill')
	{
		dv.ctx.beginPath();
		dv.ctx.moveTo(this.args.X[0],this.args.Y[0]);
		for (var i=0;i<this.args.X.length;i++)
		{
			dv.ctx.lineTo(this.args.X[(i+1)%this.args.X.length],this.args.Y[(i+1)%this.args.X.length]);
		}	
		dv.ctx.closePath();
		dv.ctx.stroke();

		dv.ctx.fillStyle = (new DVColor(this.args.color.r,this.args.color.g,this.args.color.b,0.7)).tostring();
		dv.ctx.beginPath();
		dv.ctx.moveTo(this.args.X[0],this.args.Y[0]);
		for (var i=0;i<this.args.X.length;i++)
		{
			dv.ctx.lineTo(this.args.X[(i+1)%this.args.X.length],this.args.Y[(i+1)%this.args.X.length]);
		}		
		dv.ctx.closePath();
		dv.ctx.fill();
	}
	dv.ctx.restore();
}

/**
 * A DVisual graph element indicate a Rect
 * @constructor
 * @example new DVLine({'beginX':100,'beginY':100,'endX':20,'endY':20,'style':'dash'});
 * @param {Object[]} args - a array contain arguments below
 * @param {double} args.x - the x value of the Rect's start node(left top node)
 * @param {double} args.y - the y value of the Rect's start node(left top node)
 * @param {double} args.height - the height of the Rect
 * @param {double} args.y - the width of the Rect
 * @param {others=} [args.others] - !!!the same with DVPolygon's arguments.!!!(others is not an argument,but an annotation)
 */
function DVRect(args)
{
	if (arguments.length==0)
		args = {};
	this.args = args.cloneAll();
	if (args['x']==null)
		this.args['x'] = 0;

	if (args['y']==null)
		this.args['y'] = 0;

	if (args['height']==null)
		this.args['height'] = 0;

	if (args['width']==null)
		this.args['width'] = 0;
}
/**
 * draw the Rect on dv's canvas
 * @function
 * @param {DVisual} dv - the Dvisual instance you want to draw 
 */
DVRect.prototype.draw = function(dv)
{
	if (this.polyRect==null)
	{
		this.args['X'] = [this.args['x'],this.args['x'],this.args['x']+this.args['width'],this.args['x']+this.args['width']];
		this.args['Y'] = [this.args['y'],this.args['y']+this.args['height'],this.args['y']+this.args['height'],this.args['y']];
		this.polyRect = new DVPolygon(this.args);
	}
	this.polyRect.draw(dv);
}

/**
 * A DVisual graph element indicate a Coordinate,the main structure of most chart
 * @constructor
 * @example new DVCoordinate({'xDescript':"time",'yDescript':"value",'xSpan':20,'ySpan'});
 * @param {Object[]} args - a array contain arguments below
 * @param {boolean} args.xGrid - whether draw the grid line started from X axes
 * @param {boolean} args.yGrid - whether draw the grid line started from Y axes
 * @param {string=} [args.xStyle='value'] - the X axes's style,'value' or 'class'
 * @param {string=} [args.yStyle='value'] - the Y axes's style,'value' or 'percentage%'
 * @param {Array(string)} args.classes - when x's Style is 'class',you need this argument to show the texts of each class on the X-axes
 * @param {Array(string)} args.yClass - to make the horizental chart
 * @param {string=} [args.xDescript='x'] - the X axes's description
 * @param {string=} [args.yDescript='y'] - the Y axes's description
 * @param {double} args.xSpan - the increment on x value in each grid,(data space)
 * @param {double} args.ySpan - the increment on y value in each grid,(data space)
 * @param {double=} [args.lineWidth = '1'] - the lineWidth of text
 */
function DVCoordinate(args)
{
	if (arguments.length==0)
		args = {};
	this.args = args.cloneAll();
	if (args['xGrid']==null)
		this.args['xGrid'] = true;

	if (args['yGrid']==null)
		this.args['yGrid'] = true;

	if (args['xStyle']==null || (args['xStyle']!='value' && args['xStyle']!='class'))
		this.args['xStyle'] = 'value';

	if (args['yStyle']==null || (args['yStyle']!='value' && args['yStyle']!='percentage' && args['yStyle']!='class'))
		this.args['yStyle'] = 'value';

	if (args['classes']==null)
		this.args['classes'] = ["A",'B','C'];

	if (args['yClasses']==null)
		this.args['yClasses'] = ["A",'B','C'];

	if (args['xDescript']==null)
		this.args['xDescript'] = "";

	if (args['yDescript']==null)
		this.args['yDescript'] = "";

	if (args['xSpan']==null)
		this.args['xSpan'] = 50.0;

	if (args['ySpan']==null)
		this.args['ySpan'] = 50.0;

	if (args['lineWidth']==null)
		this.args['lineWidth'] = 1;

	this.eles = new Array();

}
/**
 * prepare the needed elements on the first time to draw it
 * @function
 * @param {DVisual} dv - the Dvisual instance you want to draw 
 */
DVCoordinate.prototype.prepare = function(dv)
{
	x_axes_arg = {'beginX':dv.originX,'beginY':dv.originY,'endX':dv.oldWidth-20,'endY':dv.originY};
	y_axes_arg = {'beginX':dv.originX,'beginY':dv.originY,'endX':dv.originX,'endY':20};
	this.eles.push(new DVLine(x_axes_arg));
	this.eles.push(new DVLine(y_axes_arg));

	if (this.args['xDescript']!="")
	{
		x_des_arg = {'x':dv.oldWidth-20-20+2,'y':dv.originY+10,'text':this.args['xDescript'],'textAlign':'center','maxwidth':40}
		x_des_poly_arg = {'X':[dv.oldWidth-20-40,dv.oldWidth-20-40,dv.oldWidth-20,dv.oldWidth-20+10,dv.oldWidth-20],
							'Y':[dv.originY,dv.originY+15,dv.originY+15,dv.originY+7.5,dv.originY],'style':'stroke'}
		this.eles.push(new DVPolygon(x_des_poly_arg));
		this.eles.push(new DVText(x_des_arg));
	}


	x = dv.Xinc;
	if (this.args['xStyle']=='class')
		x+=0.5;
	y = dv.Yinc;
	//dv.XZoom = 0.01;
	while (dv.xyTrans(x,y)[0]<dv.oldWidth - 70)
	{
		if (this.args['xStyle']=='class' && x>=this.args.classes.length)
			break;
		result = dv.xyTrans(x,y);
		str = x + "";
		if (this.args['xStyle']=='class')
			str = this.args.classes[x-0.5];
		metrics = dv.ctx.measureText(str);
		x_kedu_arg = {'x':result[0]-metrics.width/2,'y':result[1]+ dv.ctx.measureText("D").width+8,'text':str,'lineWidth':this.args['lineWidth']};
		x_kedu_line_arg = {'beginX':result[0],'beginY':result[1],'endX':result[0],'endY':result[1]-5};
		if (this.args.xGrid)
		{
			color = new DVColor(100,100,100,0.1);
			if (dv.Xinc<0 && x==0)
				color = new DVColor(256,0,0,0.3);
			xgrid_line = {'beginX':result[0],'beginY':result[1],'endX':result[0],'endY':0,'color':color,'shadow':false};
			this.eles.push(new DVLine(xgrid_line));
		}
		this.eles.push(new DVText(x_kedu_arg));
		this.eles.push(new DVLine(x_kedu_line_arg));

		x += this.args.xSpan;
		if (this.args['xStyle']=='class' && x>=this.args.classes.length)
			break;
	}
	

	if (this.args['yDescript']!="")
	{
		x_des_arg = {'x':21,'y':40-2,'text':this.args['yDescript'],'textAlign':'center','maxwidth':40,'direction':'vertical'}
		x_des_poly_arg = {'X':[dv.originX,dv.originX-15,dv.originX-15,dv.originX-7.5,dv.originX],
							'Y':[20+40,20+40,20,10,20],'style':'stroke'}
		this.eles.push(new DVPolygon(x_des_poly_arg));
		this.eles.push(new DVText(x_des_arg));
	}
	x = dv.Xinc;
	y = dv.Yinc;
	count = 0;
	while (dv.xyTrans(x,y)[1]>70)
	{
		result = dv.xyTrans(x,y);
		if (this.args.yStyle=='value')
			str = y+"";
		else if (this.args.yStyle=='percentage')
			str = y.toFixed(2)*100+"%";
		else if (this.args.yStyle=='class' && count<this.args.yClasses.length)
			str = this.args.yClasses[count];
		count++;

		metrics = dv.ctx.measureText(str);
		y_kedu_arg = {'x':result[0]-metrics.width-2,'y':result[1]+dv.ctx.measureText("D").width/2,'text':str};
		y_kedu_line_arg = {'beginX':result[0],'beginY':result[1],'endX':result[0]+5,'endY':result[1]};
		if (this.args.yGrid)
		{
			color = new DVColor(100,100,100,0.1);
			if (dv.Yinc<0 && y==0)
				color = new DVColor(256,0,0,0.3);
			ygrid_line = {'beginX':result[0],'beginY':result[1],'endX':result[0]+dv.oldWidth,'endY':result[1],'color':color,'shadow':false};
			this.eles.push(new DVLine(ygrid_line));
		}
		this.eles.push(new DVText(y_kedu_arg));
		this.eles.push(new DVLine(y_kedu_line_arg));
		y += this.args.ySpan;
	}
}
/**
 * draw the Coordinate on dv's canvas
 * @function
 * @param {DVisual} dv - the Dvisual instance you want to draw 
 */
DVCoordinate.prototype.draw = function(dv)
{
	if (this.eles.length==0)
	{
		this.prepare(dv);
	}
	for (var i=this.eles.length-1;i>=0;i--)
		this.eles[i].draw(dv);
}



/**
 * A DVisual graph element indicate a Legend,an important structure of most chart
 * @constructor
 * @param {Object[]} args - a array contain arguments below
 * @param {Array(string)} args.classes - the classes's texts for the legend
 * @param {Array(DVColor)=} [args.colors=DVgetRandomColor(this.args.classes.length,0.7);] - the classes's colors for the legend
 * @param {double} args.x - the x value of the Legend's start node(left bottom node)
 * @param {double} args.y - the y value of the Legend's start node(left bottom node)
 * @param {string=} [args.style='rect'] - the legend's note shape for each class,'rect','line' or 'bubble'
 * @param {boolean=} [args.outerbox='true'] - whether draw the outerbox of legend
 * @param {string=} [args.direction='vertical'] - the direction of legend,'vertical' means put all data in a column.'horizontal' means in a row
 * @param {double=} [args.height=!!according to the canvas!!] - the height limit of Legend
 * @param {double=} [args.width=!!according to the canvas!!] - the width limit of Legend
 */
function DVLegend(args)
{
	if (arguments.length==0)
		args = {};
	this.args = args.cloneAll();

	if (args['classes']==null)
		this.args['classes'] = ["A",'B','C'];

	if (args['colors']==null)
		this.args['colors'] = DVgetRandomColor(this.args.classes.length,0.7);

	if (args['x']==null)
		this.args['x'] = 100;

	if (args['y']==null)
		this.args['y'] = 100;

	if (args['style']==null || (args['style']!='rect' && args['style']!='line'  && args['style']!='bubble'))
		this.args['style'] = 'rect';

	if (args['outerbox']==null)
		this.args['outerbox'] = true;

	if (args['direction']==null || (args['direction']!='vertical' && args['direction']!='horizontal') )
		this.args['direction'] = 'vertical';

	if (args['height']==null)
		this.args['height'] = 0;

	if (args['width']==null)
		this.args['width'] = 0;
	this.eles = new Array();

}
/**
 * get the legend's height and width according to the dvisual instance
 * @function
 * @param {DVisual} dv - the Dvisual instance you want to draw 
 * @return {Array} result - [height,width] 
 */
DVLegend.prototype.getHeightWidth =function(dv)
{
	if (this.args['direction']=='vertical')
		return [dv.yLenTrans((dv.Ymargin*1.0/6)),dv.xLenTrans((dv.Xmargin*1.0/5))]
	return [20,dv.xLenTrans((dv.Xmargin*1.0*2/3))]
}
/**
 * prepare the needed elements on the first time to draw it
 * @function
 * @param {DVisual} dv - the Dvisual instance you want to draw 
 */
DVLegend.prototype.prepare = function(dv)
{
	if (this.args['width']==0 && this.args['height']==0)
	{
		this.args['height'] = this.getHeightWidth(dv)[0];
		this.args['width'] = this.getHeightWidth(dv)[1];
	}
	if (this.args.direction=='vertical')
		TextHeight = this.args['height']/(this.args.classes.length*4.0/3);
	else 
		TextHeight = 20.0/4*3;
	drawXinc = 0.0;
	drawYinc = 0.0;
	drawLength = this.args['width']/(6.0/5);
	if (this.args.direction=='vertical')
		drawYinc = TextHeight*4.0/3;
	else
	{
		drawXinc = this.args['width']/(6.0/5*this.args.classes.length)*6/5;
		drawLength = this.args['width']/(6.0/5*this.args.classes.length);
	}

	font = DVgetRightTextStyle(dv,TextHeight*0.5);
	boxtopy = this.args.y-this.args.height;

	dv.ctx.save();
	dv.ctx.font = font;
	maxlength = 0;
	for (var i=0;i<this.args.classes.length;i++)
	{
		maxlength = Math.max(maxlength,dv.ctx.measureText(this.args.classes[i]).width);
	}
	var ratio = 0;
	for (var i=0;i<this.args.classes.length;i++)
	{
		paintX = drawLength/10 + drawXinc*i +this.args.x;
		paintY = TextHeight/6 +drawYinc*i +boxtopy;
		ratio = 2/4;
		// this.eles.push(new DVRect({'x':paintX,'y':paintY,'width':drawLength,'height':TextHeight,'style':'fill',
		// 							'color':new DVColor(0,0,0,0.7)}))
		if (maxlength>drawLength*(1-ratio)*1.0)
		{
			ratio = (1 - maxlength*1.0/drawLength)*0.6+ratio*0.4;
		}
		if (this.args.style=='rect')
			this.eles.push(new DVRect({'x':paintX,'y':paintY,'width':drawLength*ratio,'height':TextHeight,'style':'fill',
									'color':this.args.colors[i]}));
		else if (this.args.style=='line')
			this.eles.push(new DVLine({'beginX':paintX,'beginY':paintY+TextHeight*1.0/2,
									'endX':paintX + drawLength*ratio,"endY":paintY+TextHeight*1.0/2,
									'color':this.args.colors[i],'lineWidth':3}));
		else if (this.args.style=='bubble')
		{ 
			this.eles.push(new DVDot({'x':paintX+drawLength*ratio/3,'y':paintY+TextHeight*1.0/2,'radius':TextHeight*1.0/2,'style':'bubble','color':this.args.colors[i]}));
			//ratio*=3.0/4;
		}
		this.eles.push(new DVText({'text':this.args.classes[i],'x':paintX + drawLength*ratio+drawLength*(1-ratio)*1.0*0+2,'y':paintY+TextHeight*1.0/1.3,'textAlign':'left',
									'maxwidth':drawLength*(1-ratio)*1.0,'font':font}))
	}
	dv.ctx.restore();
	if (this.args.outerbox)
	{
		if (ratio==0.5 && this.args.direction=='vertical')
			width = this.args.width*ratio+maxlength+8
		else
			width = this.args.width;
		this.eles.push(new DVRect({'x':this.args.x,'y':boxtopy,'width':width,'height':this.args.height,'style':'fill',
									'color':new DVColor(30,144,255,0.3)}))
	}
}
/**
 * draw the Coordinate on dv's canvas
 * @function
 * @param {DVisual} dv - the Dvisual instance you want to draw 
 */
DVLegend.prototype.draw = function(dv)
{
	if (this.eles.length==0)
	{
		this.prepare(dv);
	}
	for (var i=this.eles.length-1;i>-1;i--)
		this.eles[i].draw(dv);

}

/**
 * get the fitted font style according to the height of text
 * @function
 * @param {DVisual} dv - the Dvisual instance you want to draw 
 * @param {double} length - the height limit of text
 * @return {string} font - the fitted font string.
 */
DVgetRightTextStyle = function(dv,length)
{
	dv.ctx.save();
	i = 0;
	for (i=1;i<100;i++)
	{
		dv.ctx.font = i+"px Arial";
		if (dv.ctx.measureText("D").width>length)
		{
			i = i - 1;
			dv.ctx.restore();
			return i+"px Arial";
		}
	}
	dv.ctx.restore();
	return i + "px Arial";
	
}

/**
 * get the fitted font style according to text and the length limit of text
 * @function
 * @param {DVisual} dv - the Dvisual instance you want to draw 
 * @param {string} str - the text you want to draw
 * @param {double} length - the height limit of text
 * @return {string} font - the fitted font string.
 */
DVgetRightTextStyleByStrLenght = function(dv,str,length)
{
	dv.ctx.save();
	i = 0;
	for (i=7;i<100;i++)
	{
		dv.ctx.font = i+"px Arial";
		if (dv.ctx.measureText(str).width>length)
		{
			i = i - 1;
			dv.ctx.restore();
			return i+"px Arial";
		}
	}
	dv.ctx.restore();
	return i + "px Arial";
	
}

 

/**
 * A DVisual graph element indicate a LineChart,integrate the dot,line,area or bubble  chart for a single path
 * @constructor
 * @example new DVLineChart({'X':[1,2,3,4,5],'Y':[1,2,3,4,5],'style':'area|dot'});
 * @param {Object[]} args - a array contain arguments below
 * @param {Array(double)} args.X - the set of a series nodes' x value
 * @param {Array(double)} args.Y - the set of a series nodes' y value
 * @param {string=} [args.style='dot|line'] - the legend's note shape for each class,'dot','line','area' can be used simultaneously,'bubble' style is unique
 * @param {DVColor=} [args.color = new DVColor(256,0,0,0.8)] - the color of the line/dot/area/bubble
 * @param {double=} [args.lineWidth = '1'] - the lineWidth of graph
 * @param {string=} [args.xDescript='x'] - the X axes's description
 * @param {string=} [args.yDescript='y'] - the Y axes's description
 * @param {boolean=} [args.xGrid=true] - whether draw the grid line started from X axes
 * @param {boolean=} [args.yGrid=true] - whether draw the grid line started from Y axes
 * @param {Array(double)} args.bubbleRadius - when the style is bubble,you should indicate the radius for each bubble
 */
function DVLineChart(args)
{
	if (arguments.length==0)
		args = {};

	this.args = args.cloneAll();
	if (args['X']==null)
		this.args['X'] = [];

	if (args['Y']==null)
		this.args['Y'] = [];

	if (args['style']==null)
		this.args['style'] = 'dot|line';

	if (args['color']==null)
		this.args['color'] = new DVColor(256,0,0,0.8);

	if (args['lineWidth']==null)
		this.args['lineWidth'] = 1;

	if (args['xDescript']==null)
		this.args['xDescript'] = "x";

	if (args['yDescript']==null)
		this.args['yDescript'] = "y";

	if (args['xGrid']==null)
		this.args['xGrid'] = true;

	if (args['yGrid']==null)
		this.args['yGrid'] = true;

	if (args['bubbleRadius']==null)
		this.args['bubbleRadius'] = [];

	this.eles = new Array();
}
/**
 * prepare the needed elements on the first time to draw it
 * @function
 * @param {DVisual} dv - the Dvisual instance you want to draw 
 */
DVLineChart.prototype.prepare = function(dv)
{
	if (!dv.drawed)
	{
		dv.initial(this.args.X,this.args.Y);
		ySpan = DVGetSpan(dv.Ymargin)
		xSpan = DVGetSpan(dv.Xmargin)
		cord_arg = {'xGrid':this.args.xGrid,'yGrid':this.args.yGrid,'xDescript':this.args.xDescript,'yDescript':this.args.yDescript,
					'xSpan':xSpan,'ySpan':ySpan}

		this.eles.push(new DVCoordinate(cord_arg));
		dv.initialZ(this.args.bubbleRadius);
	}

	Xs = new Array();
	Ys = new Array();
	for (var i=0;i<this.args.X.length;i++)
	{
		result = dv.xyTrans(this.args.X[i],this.args.Y[i]);
		Xs.push(result[0]);
		Ys.push(result[1]);
	}
	if (this.args.style.indexOf('dot')!=-1)
	{
		for (var i=0;i<this.args.X.length;i++)
		{
			this.eles.push(new DVDot({'x':Xs[i],'y':Ys[i],'color':this.args.color}));
		}
	}
	if (this.args.style.indexOf('line')!=-1)
	{
		for (var i=0;i<this.args.X.length-1;i++)
		{
			this.eles.push(new DVLine({'beginX':Xs[i],'beginY':Ys[i],'endX':Xs[i+1],'endY':Ys[i+1],'color':this.args.color}));
		}
	}
	if (this.args.style.indexOf('area')!=-1)
	{
		beginsX = dv.xyTrans(this.args.X[0],0)[0];
		endX = dv.xyTrans(this.args.X[Xs.length-1],0)[0];
		SubY = dv.xyTrans(this.args.X[Xs.length-1],0)[1];
		Xs.push(endX)
		Xs.push(beginsX)
		Ys.push(SubY-1)
		Ys.push(SubY-1)
		poly_arg = {'X':Xs,'Y':Ys,'color':this.args.color}
		this.eles.push(new DVPolygon(poly_arg));
	}
	if (this.args.style.indexOf('bubble')!=-1)
	{
		for (var i=0;i<this.args.X.length;i++)
		{
			this.eles.push(new DVDot({'x':Xs[i],'y':Ys[i],'color':this.args.color,'style':'bubble','radius':dv.zLenTrans(this.args.bubbleRadius[i])}));
		}
	}
}
/**
 * draw the DVLineChart on dv's canvas
 * @function
 * @param {DVisual} dv - the Dvisual instance you want to draw 
 */
DVLineChart.prototype.draw = function(dv)
{
	if (this.eles.length==0)
	{
		this.prepare(dv);
	}
	for (var i=this.eles.length-1;i>=0;i--)
		this.eles[i].draw(dv);
}
/**
 * get a random number in certain margin
 * @function
 * @param {double} N - the margin of random number you want
 * @return {double} randomN - the random number
 */
function getrandom(N)
{
	return Math.floor(Math.random() * ( N + 1));
}

/**
 * get a series of DVColor
 * @function
 * @param {int} lens - how many colors you want.
 * @param {double=} [alpha=0.7] - the alpha component 
 * @return {Array()} randomN - the random color set
 */
function DVgetRandomColor(lens,alpha)
{
	result = new Array();
	if (arguments.length==1)
		alpha = 0.7;
	for (var i=0;i<lens;i++)
	{
		result.push(new DVColor(getrandom(256),getrandom(256),getrandom(256),alpha));
	}
	return result
}
/**
 * get the min and max for a 2d array
 * @function
 * @param {Array(Array(double))} Xs - the 2d Array
 * @return {Array()} [min,max] - the minium and maxium of the 2D array.
 */
function DV2dArrMinMax(Xs)
{
	mins = 100000;
	maxx = -10000;
	for (var i=0;i<Xs.length;i++)
		for (var j=0;j<Xs[i].length;j++)
		{
			mins = Math.min(mins,Xs[i][j]);
			maxx = Math.max(maxx,Xs[i][j]);
		}
	return [mins,maxx]
}

/**
 * A DVisual graph element indicate a Multiple Line Chart,integrate the dot,line,area or bubble  chart for multiple path
 * @constructor
 * @example new DVMulLineChart({'Xs':[[1,2,3,4,5,6],[1,2,3,4,5,6]],'Ys':[[1,2,3,4,3,6],[3,5,2,7,5,2]],'classes':['A','B'],'style':'dot|line'});
 * @param {Object[]} args - a array contain arguments below
 * @param {Array(Array(double))} args.Xs - the set of multiple series nodes' x value,the length indicate how many kinds (dot,line,area,bubble)'s  you want to draw
 * @param {Array(Array(double))} args.Ys - the set of multiple series nodes' y value,the length indicate how many kinds (dot,line,area,bubble)'s  you want to draw
 * @param {boolean=} [args.legendOuterBox=true] - whether draw the outer box of legend
 * @param {Array(Array(double))=} args.Zs - !!!the third degree of data,the bubble chart need it.!!!
 * @param {Array(Array(DVColor))=} [args.colors=!!randomcolor!!] - the color for each kind of elements.
 * @param {Array(string)} args.classes - the description for each set of (dot,line,area,bubble),the length is the kinds number of (dot,line,area,bubble)
 * @param {string=} [args.xDescript='x'] - the X axes's description
 * @param {string=} [args.yDescript='y'] - the Y axes's description
 * @param {boolean=} [args.xGrid=true] - whether draw the grid line started from X axes
 * @param {boolean=} [args.yGrid=true] - whether draw the grid line started from Y axes
 */
function DVMulLineChart(args)
{
	if (arguments.length==0)
		args = {};
	this.args = args.cloneAll();

	if (args['Xs']==null)
		this.args['Xs'] = [];

	if (args['Ys']==null)
		this.args['Ys'] = [];

	if (args['legendOuterBox']==null)
		this.args['legendOuterBox'] = true;

	if (args['Zs']==null)
		this.args['Zs'] = [];

	if (args['classes']==null)
		this.args['classes'] = [];

	if (args['style']==null)
		this.args['style'] = 'dot|line';

	if (args['colors']==null)
		this.args['colors'] = DVgetRandomColor(this.args['classes'].length)

	if (args['lineWidth']==null)
		this.args['lineWidth'] = 1;

	if (args['xDescript']==null)
		this.args['xDescript'] = "x";

	if (args['yDescript']==null)
		this.args['yDescript'] = "y";

	if (args['xGrid']==null)
		this.args['xGrid'] = true;

	if (args['yGrid']==null)
		this.args['yGrid'] = true;

	this.eles = new Array();
}
/**
 * prepare the needed elements on the first time to draw it
 * @function
 * @param {DVisual} dv - the Dvisual instance you want to draw 
 */
DVMulLineChart.prototype.prepare = function(dv)
{
	dv.drawed = true;
	x_minmax = DV2dArrMinMax(this.args.Xs);
	y_minmax = DV2dArrMinMax(this.args.Ys);
	dv.initial(x_minmax,y_minmax)
	ySpan = DVGetSpan(dv.Ymargin)
	xSpan = DVGetSpan(dv.Xmargin)
	cord_arg = {'xGrid':this.args.xGrid,'yGrid':this.args.yGrid,'xDescript':this.args.xDescript,'yDescript':this.args.yDescript,
				'xSpan':xSpan,'ySpan':ySpan}
	this.eles.push(new DVCoordinate(cord_arg));
	if (this.args.style=='bubble')
	{
		dv.initialZ(DV2dArrMinMax(this.args.Zs))
		this.Rs = [];
		for (var i=0;i<this.args.Zs.length;i++)
		{
			this.Rs.push([])
			for (var j=0;j<this.args.Zs[i].length;j++)
			{
				this.Rs[i].push(dv.zLenTrans(this.args.Zs[i][j]));
			}
		}
	}
	for (var i=0;i<this.args.classes.length;i++)
	{
		line_arg = this.args.cloneAll();
		line_arg.Xs = null;
		line_arg.Ys = null;
		line_arg['X'] = this.args.Xs[i];
		line_arg['Y'] = this.args.Ys[i];
		line_arg.color = this.args.colors[i];
		if (this.args.style!='bubble')
		{
			this.eles.push(new DVLineChart({'X':this.args.Xs[i],'Y':this.args.Ys[i],'color':this.args.colors[i],'lineWidth':this.args.lineWidth,
											'style':this.args.style}));
		}
		else
		{
			this.eles.push(new DVLineChart({'X':this.args.Xs[i],'Y':this.args.Ys[i],'color':this.args.colors[i],'lineWidth':this.args.lineWidth,
											'bubbleRadius':this.args.Zs[i],'style':this.args.style}));
		}
	}
	if (this.args.style.indexOf('line')==-1)
	{
		style = 'rect';
		if (this.args.style=='bubble')
			style = 'bubble';
		result = dv.xyTrans(dv.Xmargin*(1-0.16)+dv.Xinc,dv.Ymargin/30+dv.Yinc);
		this.eles.push(new DVLegend({'classes':this.args.classes,'colors':this.args.colors,'x':result[0],'y':result[1],'outerbox':this.args.legendOuterBox,'style':style}))
	}
	else
	{
		result = dv.xyTrans(dv.Xmargin/5+dv.Xinc,dv.Ymargin/30+dv.Yinc);
		this.eles.push(new DVLegend({'classes':this.args.classes,'colors':this.args.colors,'x':result[0],'y':dv.oldHeight,
						'direction':'horizontal','style':'line','outerbox':this.args.legendOuterBox}))

	}
}
/**
 * draw the DVMulLineChart on dv's canvas
 * @function
 * @param {DVisual} dv - the Dvisual instance you want to draw 
 */
DVMulLineChart.prototype.draw = function(dv)
{
	if (this.eles.length==0)
	{
		this.prepare(dv);
	}
	for (var i=this.eles.length-1;i>=0;i--)
		this.eles[i].draw(dv);
}



/**
 * A DVisual graph element indicate a Bar Chart,integrate the normal,stacked bar chart.
 * @constructor
 * @param {Object[]} args - a array contain arguments below
 * @param {Array(string)} args.X - a list of string for each x-label
 * @param {Array(double)} args.Y - the set of a series value
 * @param {string=} [args.style='bar'] - the style of bar chart,'stacked' or 'bar'
 * @param {Array(Array(double))} args.stackedY - use for stacked bar chart,for each element in this array have #stacked_component numbers.
 * @param {Array(string)} args.stackedClass - a series of string indicate each stacked_component class.
 * @param {Array(DVColor)} args.stackedColors - a series of DVColor indicate each stacked_component class.
 * @param {int} args.all - how many bar you want for each X-label
 * @param {int} args.index - current data is the i-th bar for the each X-label
 * @param {DVColor=} [args.color = new DVColor(256,0,0,0.8)] - the color of the bar(normal bar)
 * @param {boolean=} [args.xGrid=false] - whether draw the grid line started from X axes
 * @param {boolean=} [args.yGrid=true] - whether draw the grid line started from Y axes
 * @param {string=} [args.xDescript='x'] - the X axes's description
 * @param {string=} [args.yDescript='y'] - the Y axes's description
 * @param {boolean=} [args.legendOuterBox=true] - whether draw the outer box of legend
 */
function DVBarChart(args)
{
	if (arguments.length==0)
		args = {};

	this.args = args.cloneAll();
	if (args['X']==null)
		this.args['X'] = [];

	if (args['Y']==null)
		this.args['Y'] = [];

	if (args['style']==null || (args['style']!='bar' && args['style']!='stacked'))
		this.args['style'] = 'bar';

	if (args['stackedY']==null)
		this.args['stackedY'] = [[]];

	if (args['stackedClass']==null)
		this.args['stackedClass'] = [];

	if (args['stackedColor']==null)
		this.args['stackedColor'] = DVgetRandomColor(this.args['stackedClass'].length);

	if (args['all']==null)
		this.args['all'] = 1;

	if (args['index']==null)
		this.args['index'] = 1;

	if (args['color']==null)
		this.args['color'] = new DVColor(256,0,0,0.8);

	if (args['lineWidth']==null)
		this.args['lineWidth'] = 1;

	if (args['xDescript']==null)
		this.args['xDescript'] = "x";

	if (args['yDescript']==null)
		this.args['yDescript'] = "y";

	if (args['xGrid']==null)
		this.args['xGrid'] = false;

	if (args['yGrid']==null)
		this.args['yGrid'] = true;

	if (args['legendOuterBox']==null)
		this.args['legendOuterBox'] = false;

	this.eles = new Array();
}
/**
 * prepare the needed elements on the first time to draw it
 * @function
 * @param {DVisual} dv - the Dvisual instance you want to draw 
 */
DVBarChart.prototype.prepare = function(dv)
{
	if (!dv.drawed)
	{
		if (this.args.style=='bar')
			dv.initial([0,this.args.X.length],this.args.Y);
		else
		{
			max_sum = 0;
			for (var i=0;i<this.args.X.length;i++)
			{
				sum = 0;
				for (var j=0;j<this.args.stackedY[i][j];j++)
					sum+=this.args.stackedY[i][j];
				max_sum = Math.max(max_sum,sum)
			}
			dv.initial([0,this.args.X.length],[0,max_sum*1.2]);
		}
		ySpan = DVGetSpan(dv.Ymargin)
		xSpan = 1;	
		cord_arg = {'xGrid':this.args.xGrid,'yGrid':this.args.yGrid,'xDescript':this.args.xDescript,'yDescript':this.args.yDescript,
					'xSpan':xSpan,'ySpan':ySpan,'xStyle':'class','classes':this.args.X}
		this.eles.push(new DVCoordinate(cord_arg));
	}

	if (this.args.style=='bar')
	{
		dv.ctx.save();
		for (var i=0;i<this.args.Y.length;i++)
		{
			left_most_X = i + 0.5 - 0.3;
			right_most_X = i + 0.5 - 0.3;
			K = this.args.all;
			xsec = 0.6/(5*K - 1);
			xwidth = xsec * 4;
			result = dv.xyTrans(left_most_X+xsec*5*(this.args.index-1),dv.Yinc+this.args.Y[i]);
			this.eles.push(new DVRect({'x':result[0],'y':result[1],
						'height':dv.yLenTrans(this.args.Y[i])-1,'width':dv.xLenTrans(xwidth),'color':this.args.color}));
			font = Math.min(dv.oldHeight,dv.oldWidth)/400*10+"px Arial";
			dv.ctx.font = font;
			
			this.eles.push(new DVText({'font':font,'text':this.args.Y[i],'textAlign':'center','x':result[0]+dv.xLenTrans(xwidth)/2,'y':result[1]-dv.ctx.measureText('D').width/2,'maxwidth':dv.xLenTrans(xwidth)}));
			
		}
		dv.ctx.restore();
	}
	if (this.args.style=='stacked')
	{
		for (var i=0;i<this.args.stackedY.length;i++)
		{
			left_most_X = i + 0.5 - 0.3;
			right_most_X = i + 0.5 - 0.3;
			K = this.args.all;
			xsec = 0.6/(5*K - 1);
			xwidth = xsec * 4;
			tmpy = dv.Yinc;
			for (var j=0;j<this.args.stackedY[i].length;j++)
			{
				result = dv.xyTrans(left_most_X+xsec*5*(this.args.index-1),tmpy+this.args.stackedY[i][j]);
				this.eles.push(new DVRect({'x':result[0],'y':result[1],
							'height':dv.yLenTrans(this.args.stackedY[i][j])-1,'width':dv.xLenTrans(xwidth),'color':this.args.stackedColor[j],'style':'fill'}));
				tmpy += this.args.stackedY[i][j];
			}
			//this.eles.push(new DVText({'text':this.args.Y[i],'textAlign':'center','x':result[0]+dv.xLenTrans(xwidth)/2,'y':result[1]-3,'maxwidth':dv.xLenTrans(xwidth)}));
		}
		result = dv.xyTrans(this.args.stackedY.length,dv.Ymargin/20);
		this.eles.push(new DVLegend({'outerbox':this.args.legendOuterBox,'classes':this.args.stackedClass,'colors':this.args.stackedColor,'x':result[0],'y':result[1]}))
	}
	// Xs = new Array();
	// Ys = new Array();
	// for (var i=0;i<this.args.X.length;i++)
	// {
	// 	result = dv.xyTrans(this.args.X[i],this.args.Y[i]);
	// 	Xs.push(result[0]);
	// 	Ys.push(result[1]);
	// }
}
/**
 * draw the DVBarChart on dv's canvas
 * @function
 * @param {DVisual} dv - the Dvisual instance you want to draw 
 */
DVBarChart.prototype.draw = function(dv)
{
	if (this.eles.length==0)
	{
		this.prepare(dv);
	}
	for (var i=this.eles.length-1;i>=0;i--)
		this.eles[i].draw(dv);
}



/**
 * A DVisual graph element indicate a Muliple Bar Chart
 * @constructor
 * @param {Object} args - a array contain arguments below
 * @param {Array(string)} args.X - a list of string for each x-label
 * @param {Array(Array(double))} args.Ys - 2d Array,indicate a series bar value for each x-label.
 * @param {Array(string)} args.Z - a list of string indicate each kind of bar
 * @param {boolean=} [args.legendOuterBox=true] - whether draw the outer box of legend
 * @param {Array(DVColor)=} [args.colors=DVgetRandomColor(this.args['Z'].length)] - a series of DVColor indicate each kind of bar.
 * @param {boolean=} [args.xGrid=false] - whether draw the grid line started from X axes
 * @param {boolean=} [args.yGrid=true] - whether draw the grid line started from Y axes
 * @param {string=} [args.xDescript='x'] - the X axes's description
 * @param {string=} [args.yDescript='y'] - the Y axes's description
 */
function DVMulBarChart(args)
{
	if (arguments.length==0)
		args = {};

	this.args = args.cloneAll();
	if (args['X']==null)
		this.args['X'] = [];

	if (args['Ys']==null)
		this.args['Ys'] = [[]];

	if (args['Z']==null)
		this.args['Z'] = [];

	if (args['legendOuterBox']==null)
		this.args['legendOuterBox'] = false;

	if (args['colors']==null)
		this.args['colors'] = DVgetRandomColor(this.args['Z'].length);

	if (args['lineWidth']==null)
		this.args['lineWidth'] = 1;

	if (args['xDescript']==null)
		this.args['xDescript'] = "x";

	if (args['yDescript']==null)
		this.args['yDescript'] = "y";

	if (args['xGrid']==null)
		this.args['xGrid'] = false;

	if (args['yGrid']==null)
		this.args['yGrid'] = true;

	this.eles = new Array();
}
/**
 * prepare the needed elements on the first time to draw it
 * @function
 * @param {DVisual} dv - the Dvisual instance you want to draw 
 */
DVMulBarChart.prototype.prepare = function(dv)
{
	dv.drawed = true;
	ymm = DV2dArrMinMax(this.args.Ys);
	dv.initial([0,this.args.X.length],ymm);

		ySpan = DVGetSpan(dv.Ymargin)
		xSpan = 1;	
		cord_arg = {'xGrid':this.args.xGrid,'yGrid':this.args.yGrid,'xDescript':this.args.xDescript,'yDescript':this.args.yDescript,
					'xSpan':xSpan,'ySpan':ySpan,'xStyle':'class','classes':this.args.X}
	this.eles.push(new DVCoordinate(cord_arg));
	for (var i=0;i<this.args.Z.length;i++)
	{
		tmpY = new Array();
		for (var j=0;j<this.args.X.length;j++)
			tmpY.push(this.args.Ys[j][i]);

		this.eles.push(new DVBarChart({'X':this.args.X,'Y':tmpY,'color':this.args.colors[i],'all':this.args.Z.length,'index':i+1}));
	}
	result = dv.xyTrans(this.args.X.length+dv.Xinc,dv.Ymargin/20+dv.Yinc);
	this.eles.push(new DVLegend({'classes':this.args.Z,'colors':this.args.colors,'x':result[0],'y':result[1],'outerbox':this.args.legendOuterBox}))
	

}
/**
 * draw the DVMulLineChart on dv's canvas
 * @function
 * @param {DVisual} dv - the Dvisual instance you want to draw 
 */
DVMulBarChart.prototype.draw = function(dv)
{
	if (this.eles.length==0)
	{
		this.prepare(dv);
	}
	for (var i=this.eles.length-1;i>=0;i--)
		this.eles[i].draw(dv);
}


/**
 * A DVisual graph element indicate a Histgram Chart
 * @constructor
 * @param {Object[]} args - a array contain arguments below
 * @param {Array(double)} args.X - a series of value,the hist chart will be created by this data
 * @param {DVColor=} [args.color = new DVColor(256,0,0,0.8)] - the color of the bar(normal bar)
 * @param {sec=} [args.sec = this.getsec(this.args.X)] - the segment for the input data for each hist,will be calculate in default.
 * @param {string=} [args.yStyle='value'] - show the value of each bar or the percentage,'value' or 'percentage'
 * @param {double=} [args.lineWidth = '1'] - the lineWidth of graph
 * @param {string=} [args.xDescript='x'] - the X axes's description
 * @param {string=} [args.yDescript='y'] - the Y axes's description
 * @param {boolean=} [args.xGrid=false] - whether draw the grid line started from X axes
 * @param {boolean=} [args.yGrid=true] - whether draw the grid line started from Y axes
 */
function DVHistChart(args)
{
	if (arguments.length==0)
		args = {};
	this.incX = 0.0;
	this.args = args.cloneAll();
	if (args['X']==null)
		this.args['X'] = [];

	if (args['color']==null)
		this.args['color'] = new DVColor(142,214,249,1);

	if (args['sec']==null)
		this.args['sec'] = this.getsec(this.args.X);

	if (args['yStyle']==null || (this.args['yStyle']!='value' && this.args['yStyle']!='percentage'))
		this.args['yStyle'] = "value";

	if (args['lineWidth']==null)
		this.args['lineWidth'] = 1;

	if (args['xDescript']==null)
		this.args['xDescript'] = "x";

	if (args['yDescript']==null)
		this.args['yDescript'] = "y";

	if (args['xGrid']==null)
		this.args['xGrid'] = false;

	if (args['yGrid']==null)
		this.args['yGrid'] = true;

	this.eles = new Array();
}
/**
 * calculate the segment if the user haven't set.
 * @function
 * @param {Array(double)} X - the set of input data
 * @return {double} sec - the segment ofr the hist chart
 */
DVHistChart.prototype.getsec = function(X)
{
	this.incX = 0.0;
	xmargin = this.oldWidth;
	if (X.length!=0)
	{
		xm = (X.max()-X.min())*1.0;
		if ((xm/X.max())<0.3)
			this.incX = Math.floor(X.min())-1;
		xmargin = X.max()-incX;
		if (xmargin<=5)
			return 0.5;
		if (xmargin<=10)
			return 1;
		if (xmargin<=50);
			return 5;
		if (xmargin<=100);
			return 10;
		if (xmargin<=500);
			return 50;
	}
	return 1;
}
/**
 * get the span for a settled margin
 * @function
 * @param {double} margin - the margin
 * @return {double} Span - the span for the input margin
 */
function DVGetSpan(margin)
{
	Span = 1;
	if (margin<0.5)
		Span = 0.05;
	else if (margin<1)
		Span = 0.1;
	else if (margin<5)
		Span = 0.5;
	else if (margin<15)
		Span = 1;
	else if (margin<50)
		Span = 5;
	else if (margin<100)
		Span = 10;
	else if (margin<500)
		Span = 50;
	else if (margin<1000)
		Span = 100;
	return Span;
}
/**
 * prepare the needed elements on the first time to draw it
 * @function
 * @param {DVisual} dv - the Dvisual instance you want to draw 
 */
DVHistChart.prototype.prepare = function(dv)
{

		xSpan = this.args.sec;
		this.Ysum = new Array();

		//alert((this.args.X.max()-this.incX)/xSpan+1)
		for (var i=0;i<(this.args.X.max()-this.incX)/xSpan+1;i++)
			this.Ysum.push(0)

		for (var i=0;i<this.args.X.length;i++)
		{
			this.Ysum[Math.floor((this.args.X[i]-this.incX)*1.0/xSpan)]++;
		}
		if (this.args.yStyle=='percentage')
		{

			dv.initial(this.args.X,[0,this.Ysum.max()/this.args.X.length]);
		}
		else
		{
			dv.initial(this.args.X,[0,this.Ysum.max()]);

		}
		ySpan = DVGetSpan(dv.Ymargin);
		cord_arg = {'xGrid':this.args.xGrid,'yGrid':this.args.yGrid,'xDescript':this.args.xDescript,'yDescript':this.args.yDescript,
						'xSpan':xSpan,'ySpan':ySpan,'yStyle':this.args.yStyle}
	
	this.eles.push(new DVCoordinate(cord_arg));
	for (var i=0;i<this.Ysum.length;i++)
	{
		left = this.incX + i*xSpan;
		tops = 0;
		str = Math.floor(this.Ysum[i]) + "";
		if (this.args.yStyle=='percentage')
		{
			tops = this.Ysum[i]*1.0 / this.args.X.length;
			str = Math.floor(((this.Ysum[i]*1.0 / this.args.X.length)).toFixed(2)*100)+"%"; 
		}
		else
			tops = this.Ysum[i];
		result = dv.xyTrans(left,tops);
		width = xSpan;
		this.eles.push(new DVRect({'x':result[0]+0.5,'y':result[1],
						'height':dv.yLenTrans(tops),'width':dv.xLenTrans(width)-1,'color':this.args.color,'style':'fill'}))
		this.eles.push(new DVRect({'x':result[0]+0.5,'y':result[1],
						'height':dv.yLenTrans(tops),'width':dv.xLenTrans(width)-1,'color':new DVColor(),'style':'stroke'}))
		this.eles.push(new DVText({'x':result[0]+dv.xLenTrans(width)/2,'y':result[1]-3,
						'text':str,'textAlign':'center'}))
	}
}
/**
 * draw the DVMulLineChart on dv's canvas
 * @function
 * @param {DVisual} dv - the Dvisual instance you want to draw 
 */
DVHistChart.prototype.draw = function(dv)
{
	if (this.eles.length==0)
	{
		this.prepare(dv);
	}
	for (var i=this.eles.length-1;i>=0;i--)
		this.eles[i].draw(dv);
}

/**
 * A DVisual graph element indicate a sector
 * @constructor
 * @param {Object[]} args - a array contain arguments below
 * @param {double} args.x - the center's x value
 * @param {double} args.y - the center's y value
 * @param {double} args.radius - the radius of sector
 * @param {double} args.sDeg - the stared angle Degree
 * @param {double} args.eDeg - the end angle Degree
 * @param {DVColor=} [args.color = DVgetRandomColor(1,0.6)[0]] - the color of the dot,random in default
 * @param {boolean=} [args.pop =false] - whether poo out this sector
 * @param {boolean=} [args.shadow =true] - whether draw text's shadow.
 * @param {string=} [args.style ='fill']- the style of this sector,should be one of 'fill','stroke','transFill' means translucent fill.
 * @param {string=} [args.innerText ='']- the text you want to shao in the center of sector
 * @param {double=} [args.ring_ratio = 0] - the ring ratio,to calculate the text location
 */
function DVSector(args)
{
	if (arguments.length==0)
		args = {};

	this.args = args.cloneAll();
	if (args['x']==null)
		this.args['x'] = 100;

	if (args['y']==null)
		this.args['y'] = 100;

	if (args['radius']==null)
		this.args['radius'] = 50;

	if (args['sDeg']==null)
		this.args['sDeg'] = 0;

	if (args['eDeg']==null)
		this.args['eDeg'] = 0;

	if (args['color']==null)
		this.args['color'] = DVgetRandomColor(1,0.6)[0];

	if (args['shadow']==null)
		this.args['shadow'] = true;

	if (args['ring_ratio']==null)
		this.args['ring_ratio'] = 0;

	if (args['pop']==null)
		this.args['pop'] = false;

	if (args['style']==null || (args.style!="fill" && args.style!="stroke" && args.style!="transFill"))
		this.args['style'] = "fill";

	if (args['innerText']==null)
		this.args['innerText'] = "";

	if (args['outerText']==null)
		this.args['outerText'] = "";
	if (this.args['pop'])
	{
		this.args['x']+=this.args.radius/20*Math.cos((this.args.sDeg + this.args.eDeg)*1.0/2);
		this.args['y']+=this.args.radius/20*Math.sin((this.args.sDeg + this.args.eDeg)*1.0/2);
	}
}

/**
 * draw the sector on dv's canvas
 * @function
 * @param {DVisual} dv - the Dvisual instance you want to draw 
 */
DVSector.prototype.draw = function(dv)
{
	dv.ctx.save();
	dv.ctx.fillStyle = this.args.color.tostring();
	dv.ctx.strokeStyle = this.args.color.tostring();
	if (this.args['shadow'])
	{
		if (this.shadowSector == null)
		{
			shadowArgs = this.args.cloneAll();
			shadowArgs['color'] = new DVColor(100,100,100,0.3);
			shadowArgs['shadow'] = false;
			shadowArgs['pop'] = false;
			shadowArgs['radius']*=1.01;
			shadowArgs['x']+=shadowArgs.radius/50*Math.cos((shadowArgs.sDeg + shadowArgs.eDeg)*1.0/2);
			shadowArgs['y']+=shadowArgs.radius/50*Math.sin((shadowArgs.sDeg + shadowArgs.eDeg)*1.0/2);
			shadowArgs['innerText'] = "";
			shadowArgs['outerText'] = "";
			this.shadowSector = new DVSector(shadowArgs);
		}
		this.shadowSector.draw(dv);
	}
	if (this.args.style=='stroke' || this.args.style=='fill')
	{
		dv.ctx.sector(this.args.x,this.args.y,this.args.radius,this.args.sDeg,this.args.eDeg);
		if (this.args.style=='fill')
			dv.ctx.fill();
		else
			dv.ctx.stroke();

	}
	else
	{
		dv.ctx.sector(this.args.x,this.args.y,this.args.radius,this.args.sDeg,this.args.eDeg);
		dv.ctx.stroke();
		dv.ctx.fillStyle = (new DVColor(this.args.color.r,this.args.color.g,this.args.color.b,0.5)).tostring();
		dv.ctx.sector(this.args.x,this.args.y,this.args.radius,this.args.sDeg,this.args.eDeg);
		dv.ctx.fill();
	}
	if (this.args.innerText!="")
	{
		if (this.innerDV==null)
		{
			r = this.args.radius/(1/Math.sin((this.args.eDeg - this.args.sDeg)/2)+1) //扇形内最大圆半径
			if (r>this.args.radius*(1-this.args.ring_ratio)*1.0/2.2)
			{
				r = this.args.radius*(1-this.args.ring_ratio)*1.0/2.2;
			}
			teststr = this.args.innerText;
			//alert(teststr.length)
			if (teststr[teststr.length-1]=="%" && teststr.length<3)
				teststr = "12%";
			font = DVgetRightTextStyleByStrLenght(dv,teststr,Math.min(1.7*r,Math.min(dv.oldWidth,dv.oldHeight)*1.0/10));
			dv.ctx.font = font;
			yinc = dv.ctx.measureText('D').width/2;
			textX = this.args.x + (this.args.radius-r)*Math.cos((this.args.sDeg + this.args.eDeg)*1.0/2);
			textY = this.args.y + (this.args.radius-r)*Math.sin((this.args.sDeg + this.args.eDeg)*1.0/2)+yinc;
			if (this.args.ring>0)
			{
				textX = this.args.x + (this.args.radius-r)*Math.cos((this.args.sDeg + this.args.eDeg)*1.0/2);
				textY = this.args.y + (this.args.radius-r)*Math.sin((this.args.sDeg + this.args.eDeg)*1.0/2)+yinc;
			}

			this.innerDV = new DVText({'maxwidth':1.7*r,'text':this.args.innerText,'x':textX,'y':textY,'textAlign':'center','color':new DVColor(256,256,256,1),'font':font})	
		}
		this.innerDV.draw(dv);
	}
	dv.ctx.restore();
}


/**
 * A DVisual graph element indicate a Pie Chart
 * @constructor
 * @param {Object[]} args - a array contain arguments below
 * @param {Array(string)} args.X - a series of string,indicate for each component on the pie
 * @param {Array(double)} args.Y - a series of value,the hist chart will be created by this data
 * @param {boolean=} [args.legendOuterBox=true] - whether draw the outer box of legend
 * @param {Array(DVColor)=} [args.colors = DVgetRandomColor(this.args.X.length)] - the colors for each component
 * @param {douboe=} [args.ring_ratio = 0] - the ring ratio of the pie,0 in default,means no ring
 * @param {Array(string)=} [args.text=!!label+':'+value!!] - a series of string you want to show on each sector on the pie.
 * @param {string=} [args.style='showPercentage'] - show the value of each bar or the percentage,'empty' or 'showtext' or 'showPercentage',or 'ring' to show a ring chart
 */
function DVPieChart(args)
{
	if (arguments.length==0)
		args = {};

	this.args = args.cloneAll();
	if (args['X']==null)
		this.args['X'] = [];

	if (args['Y']==null)
		this.args['Y'] = [];

	if (args['legendOuterBox']==null)
		this.args['legendOuterBox'] = false;

	if (args['ring_ratio']==null || args['ring_ratio']>1 || args['ring_ratio']<0)
		this.args['ring_ratio'] = 0;

	if (args['colors']==null)
		this.args['colors'] = DVgetRandomColor(this.args.X.length);

	if (args['text']==null)
	{
		this.args['text'] = new Array();
		for (var i=0;i<this.args.X.length;i++)
			this.args['text'].push(this.args.X[i]+":"+this.args.Y[i]);
	}

	if (args['style']==null || (args.style!="empty" && args.style!="showPercentage" && args.style!="showtext" && args.style!="ring"))
		this.args['style'] = 'showPercentage';
	this.eles = new Array();
}
/**
 * prepare the needed elements on the first time to draw it
 * @function
 * @param {DVisual} dv - the Dvisual instance you want to draw 
 */
DVPieChart.prototype.prepare = function(dv)
{
	acumDeg = 0;
	sum = 0;
	for (var i=0;i<this.args.X.length;i++)
	{
		sum+=this.args.Y[i];
	}

	D = Math.min(dv.oldWidth,dv.oldHeight);

	//this.eles.push(new DVSector({'ring_ratio':this.args.ring_ratio,'x':D/2-D/15,'y':D/2-D/15,'sDeg':0,'radius':D*1.0/6*3*this.args.ring_ratio,'eDeg':Math.PI*2,'color':new DVColor(256,256,256,1)}))
	
	for (var i=0;i<this.args.X.length;i++)
	{
		sDeg = acumDeg;
		eDeg = sDeg + (this.args.Y[i]*1.0/sum)*(Math.PI*2);
		str = Math.floor((this.args.Y[i]*1.0/sum).toFixed(2)*100)+"%";
		r = D*1.0/2/6*5;
		//alert(D+" "+r)
		if (this.args.style=='showtext')
			str = this.args.text[i];
		else if (this.args.style=='empty')
			str = "";

		this.eles.push(new DVSector({'ring_ratio':this.args.ring_ratio,'x':D/2-D/15,'y':D/2-D/15,'sDeg':sDeg,'radius':r,'eDeg':eDeg,'innerText':str,'color':this.args.colors[i]}));
		acumDeg = eDeg;
	}

	xs = (7.0/24/1.41+5.0/12+1.0/9);
	this.eles.push(new DVLegend({'classes':this.args.X,'colors':this.args.colors,'x':xs*D,'y':dv.oldHeight,
						'height':(1-xs)*D,'width':(1-xs)*D,'outerbox':this.args.legendOuterBox}))
}
/**
 * draw the Pie chart on dv's canvas
 * @function
 * @param {DVisual} dv - the Dvisual instance you want to draw 
 */
DVPieChart.prototype.draw = function(dv)
{
	if (this.eles.length==0)
	{
		this.prepare(dv);
	}
	for (var i=this.eles.length-1;i>=0;i--)
		this.eles[i].draw(dv);
	D = Math.min(dv.oldWidth,dv.oldHeight);
	dv.ctx.clearArc(D/2-D/15,D/2-D/15,D*1.0/6*3*this.args.ring_ratio,0,Math.PI*2);
}

/**
 * A DVisual graph element indicate a Radar Chart
 * @constructor
 * @example new DVRadarChart({'X':["型号1","型号2"],'Y':[[6,7,3,5,6,9],[8,6,7,2,8,6]],'arguments':["速度","能力","强度","战斗力","成本","价格"]})
 * @param {Object[]} args - a array contain arguments below
 * @param {Array(string)} args.X - a series of string,indicate for each player you want to draw,() 
 * @param {Array(Array(double))} args.Y - a series of value,it's length should be player's number,each element of this should be an array for arguments' number
 * @param {Array(string)} args.arguments - a series of string,indicate each arguments.
 * @param {double=} [args.argumax=10] - the maxium value for argument.(unified for all argument)
 * @param {double=} [args.argumin=0] - the minium value for argument.(unified for all argument)
 * @param {boolean=} [args.legendOuterBox=true] - whether draw the outer box of legend
 * @param {Array(DVColor)=} [args.colors = !!randomColor!!] - the colors for each player
 */
function DVRadarChart(args)
{
	if (arguments.length==0)
		args = {};

	this.args = args.cloneAll();
	if (args['X']==null)
		this.args['X'] = [];

	if (args['Y']==null)
		this.args['Y'] = [];

	if (args['arguments']==null)
		this.args['arguments'] = [];

	if (args['argumax']==null)
		this.args['argumax'] = 10;

	if (args['argumin']==null)
		this.args['argumin'] = 0;

	if (args['legendOuterBox']==null)
		this.args['legendOuterBox'] = false;

	if (args['colors']==null)
		this.args['colors'] = DVgetRandomColor(this.args.X.length,0.4);

	this.eles = new Array();
}
/**
 * prepare the needed elements on the first time to draw it
 * @function
 * @param {DVisual} dv - the Dvisual instance you want to draw 
 */
DVRadarChart.prototype.prepare = function(dv)
{
	Deg = (Math.PI*2)/this.args.arguments.length;
	D = Math.min(dv.oldWidth,dv.oldHeight);
	oX = D/2;
	oY = D/2;
	r = D*1.0/2/6*5;
	for (var step=0;step<=5;step++)
	{
		tmpX =[]
		tmpY =[]
		if (step==5)
			color = new DVColor();
		else
			color = new DVColor(100,100,100,0.2);
		for (var i=0;i<this.args.arguments.length;i++)
		{
			nX = oX + Math.cos(Deg*i+1.5*Math.PI)*r/5*step;
			nY = oY + Math.sin(Deg*i+1.5*Math.PI)*r/5*step;
			if (step==5)
			{
				this.eles.push(new DVLine({'beginX':oX,'beginY':oY,'endX':nX,'endY':nY,'color':new DVColor(100,100,100,0.8),'shadow':false}));
				
				font = DVgetRightTextStyle(dv,D*1.0/30);
				dv.ctx.font = font;
				yinc = dv.ctx.measureText("D").width*1.0/2;
				textX = oX + r*1.12*Math.cos(Deg*i+1.5*Math.PI);
				textY = oY + r*1.12*Math.sin(Deg*i+1.5*Math.PI)+yinc;
				this.eles.push(new DVText({'text':this.args.arguments[i],'x':textX,'y':textY,'textAlign':'center','shadow':false,'font':font}))

			}
			if (i==0)
			{
				text = (this.args.argumax - this.args.argumin)*1.0/5*step + "";
				this.eles.push(new DVText({'text':text,'x':nX,'y':nY,'shadow':false}));
			}
			tmpX.push(nX);
			tmpY.push(nY);
		}
		lineWidth=1;
		if (step==5)
			lineWidth=2;
		this.eles.push(new DVPolygon({'X':tmpX,'Y':tmpY,'style':'stroke','color':color,'shadow':false,'lineWidth':lineWidth}));
	}
	for (var i=0;i<this.args.X.length;i++)
	{
		tmpX = [];
		tmpY = [];
		for (var j=0;j<this.args.arguments.length;j++)
		{
			nX = oX + Math.cos(Deg*j+1.5*Math.PI)*r*(this.args.Y[i][j]-this.args.argumin)/this.args.argumax;
			nY = oY + Math.sin(Deg*j+1.5*Math.PI)*r*(this.args.Y[i][j]-this.args.argumin)/this.args.argumax;
			tmpX.push(nX);
			tmpY.push(nY);
			//this.eles.push(new DVDot({'x':nX,'y':nY,'color':this.args.colors[i],'style':'stroke'}));
		}
		this.eles.push(new DVPolygon({'X':tmpX,'Y':tmpY,'style':'fill','color':this.args.colors[i],'shadow':true,'lineWidth':2}));
	}
	xs = 0.82;
	this.eles.push(new DVLegend({'classes':this.args.X,'colors':this.args.colors,'x':(xs-0.1)*D,'y':dv.oldHeight,
						'height':(1-xs)*D,'width':(1-xs)*D*1.2,'outerbox':this.args.legendOuterBox}))

}
/**
 * draw the Radar chart on dv's canvas
 * @function
 * @param {DVisual} dv - the Dvisual instance you want to draw 
 */
DVRadarChart.prototype.draw = function(dv)
{
	if (this.eles.length==0)
	{
		this.prepare(dv);
	}
	for (var i=this.eles.length-1;i>=0;i--)
		this.eles[i].draw(dv);
}





/**
 * A DVisual graph element indicate a Area Pie Chart,all arguments are same with Pie Chart,bu different style of image
 * @constructor
 * @param {Object[]} args - a array contain arguments below
 * @param {Array(string)} args.X - a series of string,indicate for each component on the pie
 * @param {Array(double)} args.Y - a series of value,the hist chart will be created by this data
 * @param {boolean=} [args.legendOuterBox=true] - whether draw the outer box of legend
 * @param {Array(DVColor)=} [args.colors = DVgetRandomColor(this.args.X.length)] - the colors for each component
 * @param {Array(string)=} [args.text=!!label+':'+value!!] - a series of string you want to show on each sector on the pie.
 * @param {string=} [args.style='showPercentage'] - show the value of each bar or the percentage,'empty' or 'showtext' or 'showPercentage'
 */
function DVAreaPieChart(args)
{
	if (arguments.length==0)
		args = {};

	this.args = args.cloneAll();
	if (args['X']==null)
		this.args['X'] = [];

	if (args['Y']==null)
		this.args['Y'] = [];

	if (args['legendOuterBox']==null)
		this.args['legendOuterBox'] = false;

	if (args['colors']==null)
		this.args['colors'] = DVgetRandomColor(this.args.X.length);

	if (args['text']==null)
	{
		this.args['text'] = new Array();
		for (var i=0;i<this.args.X.length;i++)
			this.args['text'].push(this.args.X[i]+":"+this.args.Y[i]);
	}

	if (args['style']==null || (args.style!="empty" && args.style!="showPercentage" && args.style!="showtext"))
		this.args['style'] = 'showPercentage';
	this.eles = new Array();
}
/**
 * prepare the needed elements on the first time to draw it
 * @function
 * @param {DVisual} dv - the Dvisual instance you want to draw 
*/
DVAreaPieChart.prototype.prepare = function(dv)
{
	acumDeg = 0;
	sum = 0;
	for (var i=0;i<this.args.X.length;i++)
	{
		sum+=this.args.Y[i];
	}
	D = Math.min(dv.oldWidth,dv.oldHeight);
	maxR = D*1.0/2/6*5;
	maxY = this.args.Y.max();

	for (var i=0;i<this.args.X.length;i++)
	{
		sDeg = acumDeg;
		eDeg = sDeg + (Math.PI*2)/this.args.X.length;
		str = Math.floor((this.args.Y[i]*1.0/sum).toFixed(2)*100)+"%";
		r = Math.sqrt(this.args.Y[i]*1.0/maxY)*maxR;
		//alert(D+" "+r)
		if (this.args.style=='showtext')
			str = this.args.text[i];
		else if (this.args.style=='empty')
			str = "";

		this.eles.push(new DVSector({'x':D/2-D/15,'y':D/2-D/15,'sDeg':sDeg,'radius':r,'eDeg':eDeg,'innerText':str,'color':this.args.colors[i]}));
		acumDeg = eDeg;
	}
	xs = (7.0/24/1.41+5.0/12+1.0/9);
	this.eles.push(new DVLegend({'classes':this.args.X,'colors':this.args.colors,'x':xs*D,'y':dv.oldHeight*0.95,
						'height':(1-xs)*D,'width':(1-xs)*D,'outerbox':this.args.legendOuterBox}))
}
/**
 * draw the Pie chart on dv's canvas
 * @function
 * @param {DVisual} dv - the Dvisual instance you want to draw 
 */
DVAreaPieChart.prototype.draw = function(dv)
{
	if (this.eles.length==0)
	{
		this.prepare(dv);
	}
	for (var i=this.eles.length-1;i>=0;i--)
		this.eles[i].draw(dv);
}




/**
 * A DVisual graph element indicate a Box Chart,integrate the normal,stacked bar chart.
 * @constructor
 * @param {Object[]} args - a array contain arguments below
 * @param {Array(string)} args.X - a list of string for each x-label
 * @param {Array(Array(double))} args.Ys - the value set of each x.
 * @param {Array(DVColor)} args.colors - a series of DVColor indicate each x.
 * @param {boolean=} [args.xGrid=false] - whether draw the grid line started from X axes
 * @param {boolean=} [args.yGrid=false] - whether draw the grid line started from Y axes
 * @param {string=} [args.xDescript='x'] - the X axes's description
 * @param {string=} [args.yDescript='y'] - the Y axes's description
 * @param {boolean=} [args.legendOuterBox=true] - whether draw the outer box of legend
 */
function DVBoxChart(args)
{
	if (arguments.length==0)
		args = {};

	this.args = args.cloneAll();
	if (args['X']==null)
		this.args['X'] = [];

	if (args['Ys']==null)
		this.args['Y'] = [];

	if (args['style']==null || (args['style']!='bar' && args['style']!='stacked'))
		this.args['style'] = 'bar';

	if (args['colors']==null)
		this.args['colors'] = DVgetRandomColor(this.args['X'].length);

	if (args['lineWidth']==null)
		this.args['lineWidth'] = 1;

	if (args['xDescript']==null)
		this.args['xDescript'] = "x";

	if (args['yDescript']==null)
		this.args['yDescript'] = "y";

	if (args['xGrid']==null)
		this.args['xGrid'] = false;

	if (args['yGrid']==null)
		this.args['yGrid'] = false;

	if (args['legendOuterBox']==null)
		this.args['legendOuterBox'] = true;

	this.eles = new Array();
}
/**
 * calculate the median of an array
 * @function
 * @param {Array(double)} Y - the data to be calculate
 */
function DVMedian(X)
{
	Y = X.slice(0);
	Y.sort();
	if (Y.length%2==1)
		return Y[Math.floor(Y.length/2)];
	return (Y[Math.floor(Y.length/2)]+Y[Math.floor(Y.length/2)-1])*1.0/2;
}

/**
 * calculate the needed value for each box
 * @function
 * @param {Array(double)} Y - an array of double.the data needed statistic.
 * @return {Object} staValue - the value returns
 * @return {double} staValue.median - the median of Y
 * @return {double} staValue.upperQuartile - the upper quartile of Y
 * @return {double} staValue.lowerQuartile - the lower quartile of Y
 * @return {double} staValue.upperBound - the upper Bound of Y
 * @return {double} staValue.lowerBound - the lower Bound of Y
 * @return {Array(double)} staValue.outlier - the outlier bound for the Y,[min,max]
 */
DVBoxChart.prototype.statistic = function(Y)
{
	if (Y.length==0)
		return null;
	staValue = {};
	Y.sort(function(a,b)
			{
				return a - b;
			});
	if (Y.length%2==1)
	{
		staValue.median = Y[Math.floor(Y.length/2)];
		staValue.upperQuartile = DVMedian(Y.slice(Math.floor(Y.length/2)+1));
		staValue.lowerQuartile = DVMedian(Y.slice(0,Math.floor(Y.length/2)));
	}
	else
	{
		staValue.median = (Y[Math.floor(Y.length/2)]+Y[Math.floor(Y.length/2)-1])*1.0/2;
		staValue.upperQuartile = DVMedian(Y.slice(Math.floor(Y.length/2)));
		staValue.lowerQuartile = DVMedian(Y.slice(0,Math.floor(Y.length/2)));
	}
	staValue.outlier = [];
	IQR = (staValue.upperQuartile - staValue.lowerQuartile)*1.0/2;
	staValue.outlier.push(staValue.median-3*IQR);
	staValue.outlier.push(staValue.median+3*IQR);
	staValue.upperBound = -1000000;
	staValue.lowerBound = 1000000;
	for (var i=0;i<Y.length;i++)
	{
		if (Y[i]>=staValue.outlier[0])
			staValue.lowerBound = Math.min(staValue.lowerBound,Y[i]);
		if (Y[i]<=staValue.outlier[1])
		{
			staValue.upperBound = Math.max(staValue.upperBound,Y[i]);
		}
	}
	return staValue;
}
/**
 * prepare the needed elements on the first time to draw it
 * @function
 * @param {DVisual} dv - the Dvisual instance you want to draw 
 */
DVBoxChart.prototype.prepare = function(dv)
{

	tmpY = DV2dArrMinMax(this.args.Ys);
	if (this.args.style=='bar')
		dv.initial([0,this.args.X.length],tmpY);

	ySpan = DVGetSpan(dv.Ymargin)
	xSpan = 1;	
	cord_arg = {'xGrid':this.args.xGrid,'yGrid':this.args.yGrid,'xDescript':this.args.xDescript,'yDescript':this.args.yDescript,
				'xSpan':xSpan,'ySpan':ySpan,'xStyle':'class','classes':this.args.X}
	this.eles.push(new DVCoordinate(cord_arg));
	for (var i=0;i<this.args.X.length;i++)
	{
		staValue = this.statistic(this.args.Ys[i]);
		half_len = 0.2;
		half_rect_width = 0.3;
		begin = dv.xyTrans(i-half_len+0.5,staValue.lowerBound);
		end  = dv.xyTrans(i+half_len+0.5,staValue.lowerBound);
		this.eles.push(new DVLine({'beginX':begin[0],'beginY':begin[1],'endX':end[0],'endY':end[1]}));

		begin = dv.xyTrans(i-half_len+0.5,staValue.upperBound);
		end  = dv.xyTrans(i+half_len+0.5,staValue.upperBound);
		this.eles.push(new DVLine({'beginX':begin[0],'beginY':begin[1],'endX':end[0],'endY':end[1]}));

		begin = dv.xyTrans(i-half_rect_width+0.5,staValue.median);
		end  = dv.xyTrans(i+half_rect_width+0.5,staValue.median);
		this.eles.push(new DVLine({'beginX':begin[0],'beginY':begin[1],'endX':end[0],'endY':end[1],'lineWidth':2}));

		rectNode = dv.xyTrans(i-half_rect_width+0.5,staValue.upperQuartile);
		rectWidth = dv.xLenTrans(half_rect_width*2);
		rectHeight = dv.yLenTrans(staValue.upperQuartile-staValue.lowerQuartile);
		this.eles.push(new DVRect({'x':rectNode[0],'y':rectNode[1],'width':rectWidth,'height':rectHeight,'color':this.args.colors[i]}));

		begin = dv.xyTrans(i+0.5,staValue.upperBound);
		end  = dv.xyTrans(i+0.5,staValue.upperQuartile);
		this.eles.push(new DVLine({'beginX':begin[0],'beginY':begin[1],'endX':end[0],'endY':end[1]-3,'style':'dash'}));	

		begin = dv.xyTrans(i+0.5,staValue.lowerBound);
		end  = dv.xyTrans(i+0.5,staValue.lowerQuartile);
		this.eles.push(new DVLine({'beginX':begin[0],'beginY':begin[1],'endX':end[0],'endY':end[1]+4,'style':'dash'}));	
		for (var j=0;j<this.args.Ys[i].length;j++)
		{
			if (this.args.Ys[i][j]<staValue.outlier[0] || this.args.Ys[i][j]>staValue.outlier[1])
			{
				dotxy = dv.xyTrans(i+0.5,this.args.Ys[i][j]);
				this.eles.push(new DVDot({'x':dotxy[0],'y':dotxy[1],'color':this.args.colors[i],'style':'bubble'}))
			}
		}
	}
}
/**
 * draw the DVBarChart on dv's canvas
 * @function
 * @param {DVisual} dv - the Dvisual instance you want to draw 
 */
DVBoxChart.prototype.draw = function(dv)
{
	if (this.eles.length==0)
	{
		this.prepare(dv);
	}
	for (var i=this.eles.length-1;i>=0;i--)
		this.eles[i].draw(dv);
}





/**
 * A DVisual graph element indicate a General Graph
 * @constructor
 * @param {Object[]} args - a array contain arguments below
 * @param {Array(string)} args.nodes - a series of string,indicate for each node's text actualy
 * @param {Array(Array())} args.edges - a series of tuple,which contain two index number for the edge.example[[0,1],[1,2]]
 * @param {Array(DVColor)=} [args.color = random] - the color of the node
 * @param {string=} [args.style='undirected'] - the graph style.'undirected' or 'directed'
 * @param {Object[]} [args.ColorPattern = empty] - the color pattern of lines,the element is [[DVColor1,indexs1,indexs2...],[DVColor2,indexs11,indexs12...]]
 */
function DVGraph(args)
{
	if (arguments.length==0)
		args = {};

	this.args = args.cloneAll();
	if (args['nodes']==null)
		this.args['nodes'] = [];

	if (args['edges']==null)
		this.args['edges'] = [];

	if (args['ColorPattern']==null)
		this.args['ColorPattern'] = {};

	if (args['color']==null)
		this.args['color'] = DVgetRandomColor(1)[0];


	if (args['style']==null || (args.style!="undirected" && args.style!="directed"))
		this.args['style'] = 'undirected';

	this.eles = new Array();
}

DVGraph.prototype.isLinked = function(i,j)
{
	for (var k =0;k<this.args.edges.length;k++)
	{
		if (this.args.edges[k][0]==i && this.args.edges[k][1]==j) 
			return true;
		if (this.args.edges[k][1]==i && this.args.edges[k][0]==j) 
			return true;
	}
	return false;
}

DVGraph.prototype.distance = function(i,j)
{
	return Math.sqrt(Math.pow((this.eles[i].args.x - this.eles[j].args.x),2)+Math.pow((this.eles[i].args.y - this.eles[j].args.y),2))
}
/**
 * using the layout algorithm to appoint the location for each node
 * @function
 * @param {DVisual} dv - the Dvisual instance you want to draw 
 * @param {Array(Object)} V - the vertice array
 * @param {Array(Object)} E - the edges array
 */
DVGraph.prototype.rerange = function(dv,V,E)
{
	var area = (dv.oldWidth-40)*(dv.oldHeight-40)*0.5;
	var k = Math.sqrt(area/(E.length+V.length)*1.2);
	fa = function(x)
	{
		return x*x*1.0/k;
	}
	fr = function(x)
	{
		return k*k*1.0/x;
	}
	var t = 10;
	for (var step=0;step<400;step++)
	{
		for (var i=0;i<V.length;i++)
		{
			V[i].dispx = 0;
			V[i].dispy = 0;
			for (var j=0;j<V.length;j++)
				if (i!=j)
				{
					tmpx = V[i].x - V[j].x;
					tmpy = V[i].y - V[j].y;
					tmp = Math.sqrt(tmpx*tmpx+tmpy*tmpy);
					V[i].dispx+=tmpx*1.0/tmp*fr(tmp)
					V[i].dispy+=tmpy*1.0/tmp*fr(tmp)
				}
		}
		for (var e=0;e<E.length;e++)
		{
			tmpx = V[E[e][0]].x - V[E[e][1]].x;
			tmpy = V[E[e][0]].y - V[E[e][1]].y;
			tmp = Math.sqrt(tmpx*tmpx+tmpy*tmpy);
			V[E[e][0]].dispx-=tmpx*1.0/tmp*fa(tmp);
			V[E[e][0]].dispy-=tmpy*1.0/tmp*fa(tmp);
			V[E[e][1]].dispx+=tmpx*1.0/tmp*fa(tmp);
			V[E[e][1]].dispy+=tmpy*1.0/tmp*fa(tmp);
		}

		for (var i=0;i<V.length;i++)
		{
			vdisp = Math.sqrt(V[i].dispy*V[i].dispy+V[i].dispx*V[i].dispx);

			V[i].x += V[i].dispx*1.0/vdisp*Math.min(vdisp,t);
			V[i].y += V[i].dispy*1.0/vdisp*Math.min(vdisp,t);
			V[i].x = Math.min(dv.oldWidth-20,Math.max(20,V[i].x));
			V[i].y = Math.min(dv.oldHeight-20,Math.max(20,V[i].y));
		}
		t = t*0.995;
	}
	return V;
	//alert(this.eles[0].args['x']+" "+this.eles[0].args['y'])
}
/**
 * prepare the needed elements on the first time to draw it
 * @function
 * @param {DVisual} dv - the Dvisual instance you want to draw 
 */
DVGraph.prototype.prepare = function(dv)
{
	var V = []
	var colors = []
	for (var i=0;i<this.args.nodes.length;i++)
	{
		colors.push(this.args.color);
		V.push({'x':getrandom(dv.oldWidth-40)+20
				,'y':getrandom(dv.oldHeight-40)+20
				,'dispx':0
				,'dispy':0})
		//this.eles.push(new DVDot({'color':this.args.color,'x':getrandom(dv.oldWidth-40)+20,'y':getrandom(dv.oldHeight-40)+20,'style':'bubble','radius':10,'bubbleText':this.args.nodes[i]}))
	}
	for (var j=0;j<this.args.ColorPattern.length;j++)
	{
		s = this.args.ColorPattern[j]
		for (var i=1;i<s.length;i++)
		{
			colors[s[i]] = s[0];
		}
	}

	var E = []
	for (var i=0;i<this.args.edges.length;i++)
		if (this.args.edges[i][0]!=this.args.edges[i][1])
			E.push(this.args.edges[i]);
	V = this.rerange(dv,V,E);
	for (var i=0;i<this.args.nodes.length;i++)
	{
		this.eles.push(new DVDot({'color':colors[i],'x':V[i].x,'y':V[i].y,'style':'bubble','radius':10,'bubbleText':this.args.nodes[i]}))
	} 
	for (var i=0;i<this.args.edges.length;i++)
	{
		bx = this.eles[this.args.edges[i][0]].args.x;
		by = this.eles[this.args.edges[i][0]].args.y;
		ex = this.eles[this.args.edges[i][1]].args.x;
		ey = this.eles[this.args.edges[i][1]].args.y;
		tmp = 10/Math.sqrt((bx-ex)*(bx-ex)+(by-ey)*(by-ey));
		eex = tmp*bx + (1-tmp)*ex;
		eey = tmp*by + (1-tmp)*ey;
		bbx = tmp*ex + (1-tmp)*bx;
		bby = tmp*ey + (1-tmp)*by;
		this.eles.push(new DVLine({'shadow':false,'beginX':bbx,'beginY':bby,
						'endX':eex,'endY':eey}))
		if (this.args.style=='directed')
		{
			theta = 30.0/180*Math.PI;
			r = 5;
			basic = 0;
			if (eex>=bbx)
				basic = Math.PI;
			basic = basic + Math.atan((bby-eey)/(bbx-eex));
			this.eles.push(new DVLine({'shadow':false,'beginX':eex+Math.cos(basic+theta)*r,'beginY':eey+Math.sin(basic+theta)*r,
						'endX':eex,'endY':eey}))
			this.eles.push(new DVLine({'shadow':false,'beginX':eex+Math.cos(basic-theta)*r,'beginY':eey+Math.sin(basic-theta)*r,
						'endX':eex,'endY':eey}))
			
		}

	}
	//this.rerange('y');
}
/**
 * draw the Pie chart on dv's canvas
 * @function
 * @param {DVisual} dv - the Dvisual instance you want to draw 
 */
DVGraph.prototype.draw = function(dv)
{
	if (this.eles.length==0)
	{
		this.prepare(dv);
	}
	for (var i=this.eles.length-1;i>=0;i--)
		this.eles[i].draw(dv);
}


/**
 * A DVisual graph element indicate a Dendrogram,which can show some combination rule for the data
 * @constructor
 * @param {Object[]} args - a array contain arguments below
 * @param {object[]} args.tree - a set indicate the tree you want to draw,the base element is string,for example:["A",["B","C"]]
 * @param {DVColor=} [args.color = DVgetRandomColor(1)[0]] - the color for bubble
 * @param {string=} [args.style='bubble'] - the tree base element style,'bubble' or 'text'
 */
function DVDendrogram(args)
{
	if (arguments.length==0)
		args = {};

	this.args = args.cloneAll();
	if (args['tree']==null)
		this.args['tree'] = [];

	if (args['color']==null)
		this.args['color'] = DVgetRandomColor(1)[0];

	if (args['style']==null || (args.style!="bubble" && args.style!="text"))
		this.args['style'] = 'bubble';

	this.eles = new Array();
	this.baseEleCount = 0;
	this.baseIndex = 0;
}

/**
 * recurrence prepare the needed elements
 * @function
 * @param {DVisual} dv - the Dvisual instance you want to draw 
 * @param {elements} tree - the tree you want to draw,can be string at the node,otherwise object
 * @param {DVisual} level - the level of this procedure
 * @return {object} - return the width and base level from the bottom,[double,int]
 */
DVDendrogram.prototype.recurrencePrepare = function(dv,tree,level)
{

	if (typeof(tree)=="object")
	{
		var children = new Array();
		var levels = new Array();
		for (var i=0;i<tree.length;i++)
		{
			tmp = this.recurrencePrepare(dv,tree[i],level+1);
			children.push(tmp[0]);
			levels.push(tmp[1]);
			//alert(level + "   " +children);
		}
		nowHeight = this.calHeight(dv,levels.min()-1);
		this.eles.push(new DVLine({'beginX':children[0],'beginY':nowHeight,'endX':children[children.length-1],'endY':nowHeight}));

		var radius = Math.min((dv.oldWidth-40)*0.9/(this.baseEleCount)*1.0/2,18);

		for (var i=0;i<levels.length;i++)
		{
			var IsNode = radius;
			if (levels[i]!=this.maxlevel)
				IsNode = 0;
			this.eles.push(new DVLine({'beginX':children[i],'beginY':nowHeight,
										'endX':children[i],'endY':this.calHeight(dv,levels[i])-IsNode}));
		}
		return [(children[children.length-1] + children[0])*1.0/2,levels.min()-1];
	}
	if (typeof(tree)=="string")
	{
		nowHeight = this.calHeight(dv,this.maxlevel);
		nowWidth = this.baseIndex*(dv.oldWidth-40)*1.0/(this.baseEleCount-1)+20;
		radius = Math.min((dv.oldWidth-40)*0.9/(this.baseEleCount)*1.0/2,15);
		if (this.args.style=='bubble')
		{
			this.eles.push(new DVDot({'x':nowWidth,'y':nowHeight,'color':this.args.color,'style':'bubble','radius':radius,'bubbleText':tree}));
		}
		else
		{
			this.eles.push(new DVText({'text':tree,'x':nowWidth,'y':nowHeight,
						'maxwidth':Math.min((dv.oldWidth-40)*0.9/(this.baseEleCount)*1.0/2,40),'textAlign':'center','direction':'horizontal'}));
		}
		//this.eles.push(new DVLine({'beginX':nowWidth,'beginY':nowHeight-radius,'endX':nowWidth,'endY':this.levelHeight*(this.maxlevel-1)+20}));

		this.baseIndex += 1;
		return [nowWidth,this.maxlevel];
	}

	//this.rerange('y');
}

/**
 * recurrently calculate the depth of the tree
 * @function
 * @param {object} tree - tree you want to calculate
 * @return {int} level - the depth of the tree
 */
DVDendrogram.prototype.calMaxLevel = function(tree)
{
	if (typeof(tree)=="object")
	{
		var maxx = 0;
		for (var i=0;i<tree.length;i++)
		{
			maxx = Math.max(this.calMaxLevel(tree[i]),maxx)
		}
		return maxx+1;
	}
	if (typeof(tree)=="string")
	{
		this.baseEleCount += 1;
	}
	return 1;
	//this.rerange('y');
}

/**
 * calculate the height of instance level,use L2 function to make the chart more beautiful
 * @function
 * @param {DVisual} dv - the Dvisual instance you want to draw 
 * @param {int} level - the level
 * @param {double} height - the height of the passed level 
 */
DVDendrogram.prototype.calHeight = function(dv,level)
{

	//return this.levelHeight*level+20;
	var radius = Math.min((dv.oldWidth-40)*0.9/(this.baseEleCount)*1.0/2,18)+5;
	if (level!=this.maxlevel)
		radius = 0;
	return -(level-this.maxlevel)*(level-this.maxlevel)*((dv.oldHeight - 80)*1.0)/(this.maxlevel*this.maxlevel) + (dv.oldHeight - 60) + radius + 20
}


/**
 * prepare the needed elements on the first time to draw it
 * @function
 * @param {DVisual} dv - the Dvisual instance you want to draw 
 */
DVDendrogram.prototype.prepare = function(dv)
{
	this.maxlevel = this.calMaxLevel(this.args.tree)-1;
	this.levelHeight = (dv.oldHeight-60)/this.maxlevel;
	this.baseIndex = 0;
	this.recurrencePrepare(dv,this.args.tree,0);
	//this.rerange('y');
}

/**
 * draw the Dendrogram on dv's canvas
 * @function
 * @param {DVisual} dv - the Dvisual instance you want to draw 
 */
DVDendrogram.prototype.draw = function(dv)
{
	if (this.eles.length==0)
	{
		this.prepare(dv);
	}
	for (var i=this.eles.length-1;i>=0;i--)
		this.eles[i].draw(dv);
}





/**
 * A DVisual graph element indicate a Dendrogram,which can show some combination rule for the data
 * @constructor
 * @param {Object[]} args - a array contain arguments below
 * @param {Object[]} args.nodes - indicate a set of nodes,the elements is a string.
 * @param {Object[]} args.edges - indicate a set of edges,the elements is a tuple with two index,eg: [[0,1]] means an edge connect 0-th node and 1-th node
 * @param {Object=} [args.edgesValue = empty] - can be empty,to change the curve's width to show more infomation
 * @param {DVColor=} [args.CurveColor = DVgetRandomColor(1)[0]] - the Curve's Color 
 * @param {DVColor=} [args.NodeColor = new DVColor()] - the Node's Color 
 * @param {string=} [args.style='bubble'] - the node element style,'bubble' or 'text'
 * @param {boolean=} [args.bubble = true] - whether add a bubble to each node 
 * @param {int=} [args.bubbleRadius = 2] - the radius of the added bubble
 * @param {double=} [args.lineWidth = 2] - the lineWidth of curve,when the edgesValue is not empty,lineWidth indicate the maxium Curve Width.
 */
function DVCircleConnectChart(args)
{
	if (arguments.length==0)
		args = {};

	this.args = args.cloneAll();
	if (args['nodes']==null)
		this.args['nodes'] = [];

	if (args['edges']==null)
		this.args['edges'] = [];

	if (args['edgesValue']==null)
		this.args['edgesValue'] = [];

	if (args['NodeColor']==null)
		this.args['NodeColor'] = new DVColor();

	if (args['CurveColor']==null)
		this.args['CurveColor'] = DVgetRandomColor(1)[0];

	if (args['bubble']==null)
		this.args['bubble'] = true;

	if (args['bubbleRadius']==null)
		this.args['bubbleRadius'] = 2;

	if (args['lineWidth']==null)
		this.args['lineWidth'] = 2;

	this.eles = new Array();
}


/**
 * prepare the needed elements on the first time to draw it
 * @function
 * @param {DVisual} dv - the Dvisual instance you want to draw 
 */
DVCircleConnectChart.prototype.prepare = function(dv)
{

	R = (Math.min(dv.oldHeight,dv.oldWidth) - 70)/2;
	mid = Math.min(dv.oldHeight,dv.oldWidth)/2;
	addang = Math.asin(dv.ctx.measureText('D').width*1.0/2/R);
	nodelocation = []
	angs = []
	for (var i=0;i<this.args.nodes.length;i++)
	{
		ang = Math.PI*2/this.args.nodes.length*i;
		TextR = R;
		if (this.args['bubble'])
			TextR = TextR + this.args['bubbleRadius']*1.2;
		tmpx = mid + Math.cos(ang+addang)*TextR;
		tmpy = mid + Math.sin(ang+addang)*TextR;
		this.eles.push(new DVText({'text':this.args.nodes[i],'x':tmpx,'y':tmpy,'rotate':ang,'maxwidth':18*dv.ratio}));
		nodelocation.push([mid + Math.cos(ang)*R,mid + Math.sin(ang)*R]);
		angs.push(ang);
		if (this.args['bubble'])
			this.eles.push(new DVDot({'color':this.args.NodeColor,'x':mid + Math.cos(ang)*R,'y':mid + Math.sin(ang)*R,'style':'bubble','radius':this.args['bubbleRadius']}))
		//this.eles.push(new DVLine({'beginX':mid,'beginY':mid,'endX':mid + Math.cos(ang)*R,'endY':mid + Math.sin(ang)*R}));
	}
	curveColor = this.args.CurveColor;
	for (var i=0;i<this.args.edges.length;i++)
	{
		node = this.args.edges[i];
		a = node[0];
		b = node[1];
		cp_ratio = Math.sqrt((nodelocation[a][0]-nodelocation[b][0])*(nodelocation[a][0]-nodelocation[b][0])+(nodelocation[a][1]-nodelocation[b][1])*(nodelocation[a][1]-nodelocation[b][1]))/2/R; 
		ang = (angs[a]+angs[b])*1.0/2;
		if (Math.abs(angs[a]-angs[b])>Math.PI)
		{
			ang = ang + Math.PI;
		}
		cpx = mid +  Math.cos(ang)*R*(1-cp_ratio);
		cpy = mid +  Math.sin(ang)*R*(1-cp_ratio);
		lineWidth = this.args.lineWidth;
		if (this.args.edgesValue.length>0)
		{
			if (this.args.edgesValue.length!=this.args.edges.length)
			{
				console.log("ERROR! in DVCircleConnectChart,the edgesValue's length is not the same as edges' length")
				break;
			}
			lineWidth = lineWidth * this.args.edgesValue[i]/this.args.edgesValue.max(); 
		}
		this.eles.push(new DVCurve({'beginX':nodelocation[a][0],'beginY':nodelocation[a][1],'endX':nodelocation[b][0],'endY':nodelocation[b][1],
									'cpx':cpx,'cpy':cpy,'color':curveColor,'lineWidth':lineWidth}));
	}
	
}

/**
 * draw the Dendrogram on dv's canvas
 * @function
 * @param {DVisual} dv - the Dvisual instance you want to draw 
 */
DVCircleConnectChart.prototype.draw = function(dv)
{
	if (this.eles.length==0)
	{
		this.prepare(dv);
	}
	//for (var i=0;i<this.eles.length;i++)
	//	this.eles[i].draw(dv);
	 for (var i=this.eles.length-1;i>=0;i--)
	 	this.eles[i].draw(dv);
}


/**
 * A DVisual graph element indicate a Parallel coordinate
 * @constructor
 * @param {Object[]} args - a array contain arguments below
 * @param {Array(Array(double))} args.Xs - the set of multiple series nodes' x value,the length of Xs is the instance's number you want to draw,the elements' length is same with the arguments' length
 * @param {Array(string)} args.arguments - the arguments' name
 * @param {DVColor=} [args.color = new DVColor(100,100,100,0.3)] - the lines' default color,the more color optional can be configured in ColorPattern arguments
 * @param {Object[]} [args.ColorPattern = empty] - the color pattern of lines,the element is [[DVColor1,indexs1,indexs2...],[DVColor2,indexs11,indexs12...]]
 */
function DVParallelCoordinate(args)
{
	if (arguments.length==0)
		args = {};
	this.args = args.cloneAll();

	if (args['Xs']==null)
		this.args['Xs'] = [];

	if (args['arguments']==null)
		this.args['arguments'] = [];

	if (args['classes']==null)
		this.args['classes'] = [];

	if (args['style']==null)
		this.args['style'] = 'dot|line';

	if (args['color']==null)
		this.args['color'] = new DVColor(100,100,100,0.3);

	if (args['ColorPattern']==null)
		this.args['ColorPattern'] = {};

	if (args['xGrid']==null)
		this.args['xGrid'] = true;

	if (args['yGrid']==null)
		this.args['yGrid'] = true;

	if (args['lineWidth']==null)
		this.args['lineWidth'] = 1;

	this.eles = new Array();
}
/**
 * prepare the needed elements on the first time to draw it
 * @function
 * @param {DVisual} dv - the Dvisual instance you want to draw 
 */
DVParallelCoordinate.prototype.prepare = function(dv)
{

	coordinate = (dv.oldWidth*1.0)/(this.args.arguments.length);
	yupper =  20;
	ybottom = dv.oldHeight - 30;

	var ydrawMargin = ybottom - yupper;
	var maxx = [];
	var minn = [];
	var colors = [];
	for (var i =0;i<this.args.Xs.length;i++)
	{
		colors.push(this.args.color);
		if (this.args.Xs[i].length!=this.args.arguments.length)
		{
			console.log("ERROR! the Xs and arugument length in DVParallelCoordinate can not match");
			return -1;
		}
		for (var j=0;j<this.args.arguments.length;j++)
		{
			if (i==0)
			{
				maxx.push(this.args.Xs[i][j]);
				minn.push(this.args.Xs[i][j]);
			} else
			{
				maxx[j] = Math.max(maxx[j],this.args.Xs[i][j]);
				minn[j] = Math.min(minn[j],this.args.Xs[i][j]);
			}
		}
	}
	for (var j=0;j<this.args.arguments.length;j++)
	{
		maxx[j] = Math.ceil(maxx[j]);
		minn[j] = Math.floor(minn[j]);	
	}
	for (var i=0;i<this.args.arguments.length;i++)
	{
		nowx = i*coordinate + coordinate/2;
		this.eles.push(new DVLine({'beginX':nowx,'beginY':yupper,'endX':nowx,'endY':ybottom,'lineWidth':2}));
		texty = ybottom  + 29;
		this.eles.push(new DVText({'text':this.args.arguments[i],'x':nowx,'y':texty,'font':'12px Arial','textAlign':'center','maxwidth':coordinate*0.8}))
		this.eles.push(new DVText({'text':minn[i].toFixed(1),'x':nowx,'y':texty-22,'textAlign':'center','maxwidth':coordinate*0.8}))
		this.eles.push(new DVText({'text':maxx[i].toFixed(1),'x':nowx,'y':18,'textAlign':'center','maxwidth':coordinate*0.8}))
	}

	for (var j=0;j<this.args.ColorPattern.length;j++)
	{
		s = this.args.ColorPattern[j]
		for (var i=1;i<s.length;i++)
		{
			colors[s[i]] = s[0];
		}
	}
	var nowx = 0;
	var nowy = 0;
	var oldx = 0;
	var oldy = 0;
	

	for (var i=0;i<this.args.Xs.length;i++)
	{
		for (var j=0;j<this.args.arguments.length;j++)
		{
			nowy = ybottom - (this.args.Xs[i][j] - minn[j])*1.0/(maxx[j] - minn[j])*ydrawMargin
			nowx = j*coordinate + coordinate/2;
			color = colors[i];
			add = 0;
			if (color.tostring()!=this.args.color.tostring())
				add = 0.3;
			if (j!=0)
			{
				this.eles.push(new DVLine({'beginX':oldx,'beginY':oldy,'endX':nowx,'endY':nowy,'lineWidth':this.args.lineWidth+add,'color':color,'shadow':false}))
			}
			oldx = nowx;
			oldy = nowy;
		}
	}
}

/**
 * draw the Parallel Coordinate on dv's canvas
 * @function
 * @param {DVisual} dv - the Dvisual instance you want to draw 
 */
DVParallelCoordinate.prototype.draw = function(dv)
{
	if (this.eles.length==0)
	{
		this.prepare(dv);
	}
	//for (var i=0;i<this.eles.length;i++)
	//	this.eles[i].draw(dv);
	 for (var i=this.eles.length-1;i>=0;i--)
	 	this.eles[i].draw(dv);
}


