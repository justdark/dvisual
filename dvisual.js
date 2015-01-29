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
CanvasRenderingContext2D.prototype.clear = function () {
	this.save()
	this.fillStyle="#ffffff";
	this.fillRect(0,0,4000,4000);
	this.restore();
	return this;
}

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
DVColor.prototype.tostring = function()
{
	return "rgba("+this.r+","+this.g+","+this.b+","+this.a+")";
}

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
	this.ctx.clear();
	this.eles = new Array();

	this.devicePixelRatio = window.devicePixelRatio || 1;
    this.backingStorePixelRatio = this.ctx.webkitBackingStorePixelRatio ||
                                             this.ctx.mozBackingStorePixelRatio ||
                                             this.ctx.msBackingStorePixelRatio ||
                                             this.ctx.oBackingStorePixelRatio ||
                                             this.ctx.backingStorePixelRatio || 1;
    this.ratio = this.devicePixelRatio / this.backingStorePixelRatio;
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
DVisual.prototype.xyTrans = function(x,y)
{
	resultX = (x*1.0 - this.Xinc)/this.XZoom + this.originX;
	resultY = this.originY - (y*1.0 - this.Yinc)/this.YZoom;
	return [resultX,resultY]
}
DVisual.prototype.transXY = function(x,y)
{
	resultX = (x - this.originX)*this.XZoom+this.Xinc;
	resultY = (this.originY - y)*this.YZoom+this.Yinc;
	return [resultX,resultY]
}

DVisual.prototype.xLenTrans = function(len) {
	return len*1.0/this.XZoom;
}

DVisual.prototype.yLenTrans = function(len) {
	return len*1.0/this.YZoom;
}

DVisual.prototype.initialZ = function(Z) {
		zmm = [Z.min(),Z.max()];
		this.zinc = 0;
		if ((zmm[1]-zmm[0])*1.0/zmm[0]<0.2)
			this.zinc = zmm[0];
		this.Zzoom = (Math.min(this.oldWidth,this.oldHeight)/10 - 5)/(zmm[1] - this.zinc);
}

DVisual.prototype.zLenTrans = function(len)
{
		return (len - this.zinc)*this.Zzoom+5;

}

DVisual.prototype.setinc = function(Xinc,Yinc)
{
	this.Xinc = Xinc;
	this.Yinc = Yinc;
};
DVisual.prototype.setmargin = function(Xmargin,Ymargin)
{	
	this.XZoom = Xmargin*1.2/this.Xmargin;
	this.YZoom = Ymargin*1.2/this.Ymargin;
	this.Xmargin = Xmargin*1.2;
	this.Ymargin = Ymargin*1.2;
};

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


DVisual.prototype.addElement = function(ele)
{

	this.eles.push(ele);
}
DVisual.prototype.draw = function()
{
	for (var i=this.eles.length-1;i>=0;i--)
		this.eles[i].draw(this);
}



//args : x,y,color,style,shadow,description
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

	if (args['shadow']==null)
		this.args['shadow'] = true;

	if (args['radius']==null)
		this.args['radius'] = 2;
	
	if (args['lineWidth']==null)
		this.args['lineWidth'] = 1;

}

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
	}
	dv.ctx.restore();
}

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

	if (args['testAlign']==null)
		this.args['testAlign'] = 'left';

	if (args['direction']==null || (args['direction']!='vertical' && args['direction']!='horizontal'))
		this.args['direction'] = 'horizontal';

}

DVText.prototype.draw = function(dv)
{
	dv.ctx.save();
	dv.ctx.fillStyle = this.args.color.tostring();
	dv.ctx.strokeStyle = this.args.color.tostring();
	dv.ctx.font = this.args['font'];
	dv.ctx.lineWidth = this.args['lineWidth'];
	dv.ctx.textAlign = this.args['textAlign'];
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
	if (this.direction=='vertical')
	{
		dv.ctx.rotate(Math.PI/2);
	}
	dv.ctx.restore();
}
//args: beginX,beginY,endX,endY,shadow,color,lineWidth,style
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
DVLine.prototype.getShadow = function()
{
	// if ((this.args.beginX<this.args.endX && this.args.beginY<=this.args.endY)
	// 	|| (this.args.beginX>this.args.endX && this.args.beginY>this.args.endY))
	// 	return [0,-1]
	return [0,1]
}
DVLine.prototype.between =function(x,y)
{
	if (x>=Math.min(this.args['beginX'],this.args['endX']) && x<=Math.max(this.args['beginX'],this.args['endX']) &&
		y>=Math.min(this.args['beginY'],this.args['endY']) && y<=Math.max(this.args['beginY'],this.args['endY']))
		return true;
	return false;
}
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


//X,Y:Array();color,style("fill","stroke","transFill"),lineWidth,shadow,
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

		dv.ctx.fillStyle = (new DVColor(this.args.color.r,this.args.color.g,this.args.color.b,0.5)).tostring();
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

//polygon 变形
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

//args: xGrid :boolean
//      yGrid :boolean
//      xStyle : 'value','class'
//      xDescript : string
//		yDescript : string
//		xSpan : double
//      ySpan : double
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

	if (args['yStyle']==null || (args['yStyle']!='value' && args['yStyle']!='percentage'))
		this.args['yStyle'] = 'value';

	if (args['classes']==null)
		this.args['classes'] = ["A",'B','C'];

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
	while (dv.xyTrans(x,y)[1]>70)
	{
		result = dv.xyTrans(x,y);
		if (this.args.yStyle=='value')
			str = y+"";
		else
			str = y.toFixed(2)*100+"%";
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

DVCoordinate.prototype.draw = function(dv)
{
	if (this.eles.length==0)
	{
		this.prepare(dv);
	}
	for (var i=this.eles.length-1;i>=0;i--)
		this.eles[i].draw(dv);
}



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
DVLegend.prototype.getHeightWidth =function(dv)
{
	if (this.args['direction']=='vertical')
		return [dv.yLenTrans((dv.Ymargin*1.0/6)),dv.xLenTrans((dv.Xmargin*1.0/5))]
	return [20,dv.xLenTrans((dv.Xmargin*1.0*2/3))]
}
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
	if (this.args.outerbox)
	{
		this.eles.push(new DVRect({'x':this.args.x,'y':boxtopy,'width':this.args.width,'height':this.args.height,'style':'fill',
									'color':new DVColor(30,144,255,0.3)}))
	}
	dv.ctx.save();
	dv.ctx.font = font;
	maxlength = 0;
	for (var i=0;i<this.args.classes.length;i++)
	{
		maxlength = Math.max(maxlength,dv.ctx.measureText(this.args.classes[i]).width);
	}
	for (var i=0;i<this.args.classes.length;i++)
	{
		paintX = drawLength/10 + drawXinc*i +this.args.x;
		paintY = TextHeight/6 +drawYinc*i +boxtopy;
		ratio = 2.0/4;
		// this.eles.push(new DVRect({'x':paintX,'y':paintY,'width':drawLength,'height':TextHeight,'style':'fill',
		// 							'color':new DVColor(0,0,0,0.7)}))
		if (maxlength<drawLength*(1-ratio)*1.0)
		{
			ratio = 1 - maxlength*1.0/drawLength;
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
			ratio*=3.0/4;
		}
		this.eles.push(new DVText({'text':this.args.classes[i],'x':paintX + drawLength*ratio+drawLength*(1-ratio)*1.0*0+2,'y':paintY+TextHeight*1.0/1.3,'textAlign':'left',
									'maxwidth':drawLength*(1-ratio)*1.0,'font':font}))
	}
	dv.ctx.restore();
}
DVLegend.prototype.draw = function(dv)
{
	if (this.eles.length==0)
	{
		this.prepare(dv);
	}
	for (var i=0;i<this.eles.length;i++)
		this.eles[i].draw(dv);
}

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

DVgetRightTextStyleByStrLenght = function(dv,str,length)
{
	dv.ctx.save();
	i = 0;
	for (i=1;i<100;i++)
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

//style : 'dot' 'line' 'area'  ||style可叠加使用
//color,X,Y
//lineWidth
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
DVLineChart.prototype.draw = function(dv)
{
	if (this.eles.length==0)
	{
		this.prepare(dv);
	}
	for (var i=this.eles.length-1;i>=0;i--)
		this.eles[i].draw(dv);
}
function getrandom(N)
{
	return Math.floor(Math.random() * ( N + 1));
}
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
DVMulLineChart.prototype.draw = function(dv)
{
	if (this.eles.length==0)
	{
		this.prepare(dv);
	}
	for (var i=this.eles.length-1;i>=0;i--)
		this.eles[i].draw(dv);
}


///////////////style : bar stack
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
		this.args['legendOuterBox'] = true;

	this.eles = new Array();
}

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
DVBarChart.prototype.draw = function(dv)
{
	if (this.eles.length==0)
	{
		this.prepare(dv);
	}
	for (var i=this.eles.length-1;i>=0;i--)
		this.eles[i].draw(dv);
}

//style 只能是bar
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
DVMulBarChart.prototype.draw = function(dv)
{
	if (this.eles.length==0)
	{
		this.prepare(dv);
	}
	for (var i=this.eles.length-1;i>=0;i--)
		this.eles[i].draw(dv);
}


//style 只能是bar
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
function DVGetSpan(Ymargin)
{
	ySpan = 1;
	if (Ymargin<0.5)
		ySpan = 0.05;
	else if (Ymargin<1)
		ySpan = 0.1;
	else if (Ymargin<5)
		ySpan = 0.5;
	else if (Ymargin<15)
		ySpan = 1;
	else if (Ymargin<50)
		ySpan = 5;
	else if (Ymargin<100)
		ySpan = 10;
	else if (Ymargin<500)
		ySpan = 50;
	else if (Ymargin<1000)
		ySpan = 100;
	return ySpan;
}
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
DVHistChart.prototype.draw = function(dv)
{
	if (this.eles.length==0)
	{
		this.prepare(dv);
	}
	for (var i=this.eles.length-1;i>=0;i--)
		this.eles[i].draw(dv);
}


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
			teststr = this.args.innerText;
			//alert(teststr.length)
			if (teststr[teststr.length-1]=="%" && teststr.length<3)
				teststr = "12%";
			font = DVgetRightTextStyleByStrLenght(dv,teststr,Math.min(1.7*r,Math.min(dv.oldWidth,dv.oldHeight)*1.0/10));
			dv.ctx.font = font;
			yinc = dv.ctx.measureText('D').width/2;
			textX = this.args.x + (this.args.radius-r)*Math.cos((this.args.sDeg + this.args.eDeg)*1.0/2);
			textY = this.args.y + (this.args.radius-r)*Math.sin((this.args.sDeg + this.args.eDeg)*1.0/2)+yinc;

			this.innerDV = new DVText({'maxwidth':1.7*r,'text':this.args.innerText,'x':textX,'y':textY,'textAlign':'center','color':new DVColor(256,256,256,1),'font':font})	
		}
		this.innerDV.draw(dv);
	}
	dv.ctx.restore();
}

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
		this.args['legendOuterBox'] = true;

	if (args['colors']==null)
		this.args['colors'] = DVgetRandomColor(this.args.X.length);

	if (args['text']==null)
	{
		this.args['text'] = new Array();
		for (var i=0;i<this.args.X.length;i++)
			this.args['text'].push(this.args.X[i]+":"+this.args.Y[i]);
	}

	if (args['style']==null || (args.style!="empty" && args.style!="showPercentage" && args.style!="showtext"))
		this.args['y'] = 'showPercentage';
	this.eles = new Array();
}

DVPieChart.prototype.prepare = function(dv)
{
	acumDeg = 0;
	sum = 0;
	for (var i=0;i<this.args.X.length;i++)
	{
		sum+=this.args.Y[i];
	}
	D = Math.min(dv.oldWidth,dv.oldHeight);
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
		//
		
		//this.eles.push(new DVSector({'x':200,'y':200,'sDeg':Math.PI*1.95 ,'radius':180,'eDeg':Math.PI*2,'innerText':'15%'}));
		//alert(D/2+" "+sDeg+" "+r+" "+eDeg+" "+str);
		this.eles.push(new DVSector({'x':D/2-D/15,'y':D/2-D/15,'sDeg':sDeg,'radius':r,'eDeg':eDeg,'innerText':str,'color':this.args.colors[i]}));
		acumDeg = eDeg;
	}
	xs = (7.0/24/1.41+5.0/12+1.0/9);
	this.eles.push(new DVLegend({'classes':this.args.X,'colors':this.args.colors,'x':xs*D,'y':dv.oldHeight,
						'height':(1-xs)*D,'width':(1-xs)*D,'outerbox':this.args.legendOuterBox}))
}
DVPieChart.prototype.draw = function(dv)
{
	if (this.eles.length==0)
	{
		this.prepare(dv);
	}
	for (var i=this.eles.length-1;i>=0;i--)
		this.eles[i].draw(dv);
}


function DVRadarChart(args)
{
	if (arguments.length==0)
		args = {};

	this.args = args.cloneAll();
	if (args['Xs']==null)
		this.args['Xs'] = [];

	if (args['Ys']==null)
		this.args['Ys'] = [];

	if (args['arguments']==null)
		this.args['arguments'] = [];

	if (args['argumax']==null)
		this.args['argumax'] = 10;

	if (args['argumin']==null)
		this.args['argumin'] = 0;

	if (args['legendOuterBox']==null)
		this.args['legendOuterBox'] = true;

	if (args['colors']==null)
		this.args['colors'] = DVgetRandomColor(this.args.X.length,0.4);

	this.eles = new Array();
}

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
	xs = 0.8;
	this.eles.push(new DVLegend({'classes':this.args.X,'colors':this.args.colors,'x':xs*D,'y':dv.oldHeight,
						'height':(1-xs)*D,'width':(1-xs)*D,'outerbox':this.args.legendOuterBox}))

}
DVRadarChart.prototype.draw = function(dv)
{
	if (this.eles.length==0)
	{
		this.prepare(dv);
	}
	for (var i=this.eles.length-1;i>=0;i--)
		this.eles[i].draw(dv);
}





