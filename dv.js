Array.prototype.max = function(){ 
return Math.max.apply({},this) 
} 
Array.prototype.min = function(){ 
return Math.min.apply({},this) 
} 
// arcFilltext = function(ctx,text,x,y,arc)
// {

// 	metrics = ctx.measureText(text);
// 	ctx.translate(x,y);
// 	NewX = 14;
// 	NewY = -10;
// 	if ((arc+Math.PI/2)%(Math.PI*2) > Math.PI)
// 	{
// 		arc = arc + Math.PI; 
// 		NewX = -14;
// 	}
// 	ctx.rotate(arc);

// 	ctx.textAlign = "center";
// 	ctx.fillText(text,NewX,NewY);
// 	ctx.rotate(-arc);
// 	ctx.translate(-x,-y);
// }
//绘制扇形
CanvasRenderingContext2D.prototype.sector = function (x, y, radius, sDeg, eDeg) {
	// 初始保存
	this.save();
	// 位移到目标点
	this.translate(x, y);
	this.beginPath();
	// 画出圆弧
	this.arc(0,0,radius,sDeg, eDeg);
	// 再次保存以备旋转
	this.save();
	// 旋转至起始角度
	this.rotate(eDeg);
	// 移动到终点，准备连接终点与圆心
	this.moveTo(radius,0);
	// 连接到圆心
	this.lineTo(0,0);
	// 还原
	this.restore();
	// 旋转至起点角度
	this.rotate(sDeg);
	// 从圆心连接到起点
	this.lineTo(radius,0);
	this.closePath();
	// 还原到最初保存的状态
	this.restore();
	return this;
}
//////

function DVColor(r,g,b,a)
{
	if (arguments.length<4)
		this.a = 0.5;
	if (arguments.length<3)
		this.b = 100;
	if (arguments.length<2)
		this.g = 100;
	if (arguments.length<1)
		this.r = 100;
}

function DVcanvas(canvasName)
{
 	this.canvas = document.getElementById(canvasName);
	this.ctx = this.canvas.getContext('2d');
	//解决retina屏幕下绘图发虚的问题
	//http://blog.csdn.net/laijingyao881201/article/details/39505043
	this.devicePixelRatio = window.devicePixelRatio || 1;
    this.backingStorePixelRatio = this.ctx.webkitBackingStorePixelRatio ||
                                             this.ctx.mozBackingStorePixelRatio ||
                                             this.ctx.msBackingStorePixelRatio ||
                                             this.ctx.oBackingStorePixelRatio ||
                                             this.ctx.backingStorePixelRatio || 1;
    this.ratio = this.devicePixelRatio / this.backingStorePixelRatio;
	if (this.devicePixelRatio !== this.backingStorePixelRatio) {
		this.oldWidth = this.canvas.width;
		this.oldHeight = this.canvas.height;

		this.canvas.width = this.oldWidth * this.ratio;
		this.canvas.height = this.oldHeight * this.ratio;

		this.canvas.style.width = this.oldWidth + 'px';
		this.canvas.style.height = this.oldHeight + 'px';

		this.ctx.scale(this.ratio, this.ratio);
    }

    ///this.ratio要配合每一个绘制参数使用，主要在于XZoom以及xyTrans里
	this.ctx.lineWidth = 1; 
	this.Xinc = 0;
	this.Yinc = 0;
	this.Drawed = false;
	this.Xmargin = this.canvas.width - 20*this.ratio;
	this.Ymargin = this.canvas.height - 20*this.ratio; 
	this.Zoom = 1;
	this.XZoom = 1;
	this.YZoom = 1;
	this.originX = 0;
	this.originY = this.Ymargin/this.ratio;
	this.LegendWidth = 1;
	this.bubbleRatio = 1;
	this.bubbleInc = 0;
}

DVcanvas.prototype.setLegendWidth = function(width)
{
	this.LegendWidth = width;
}
DVcanvas.prototype.setinc = function(Xinc,Yinc)
{
	if (this.Drawed)
	{
		return 0;
	}
	this.Xinc = Xinc;
	this.Yinc = Yinc;

};
DVcanvas.prototype.setmargin = function(Xmargin,Ymargin)
{
	if (this.Drawed)
	{
		return 0;
	}
	
	this.XZoom = Math.max(Xmargin*1.1/this.Xmargin,Ymargin*1.1/this.Ymargin)
	this.YZoom = this.XZoom;
	
	this.XZoom = Xmargin*1.1/this.Xmargin;
	this.YZoom = Ymargin*1.1/this.Ymargin;
	this.Xmargin = Xmargin;
	this.Ymargin = Ymargin;

};

DVcanvas.prototype.transmargin = function(x)
{
	return x*1.0/2*this.ratio;
}


DVcanvas.prototype.drawAxes = function(X_shift,Y_shift,xName,yName) {
	height = this.canvas.height/this.ratio;
	width = this.canvas.width/this.ratio;
	this.originX = 40 + X_shift;
	this.originY = height - 40 - Y_shift;
	X_axis_Y = this.originY;
	X_axis_X = width - 10;
	Y_axis_X = this.originX;
	Y_axis_Y = 10;
	this.ctx.lineWidth = 2; 
	this.ctx.moveTo(40, this.originY);
	this.ctx.lineTo(X_axis_X, X_axis_Y);

	this.ctx.moveTo(X_axis_X, X_axis_Y);
	this.ctx.lineTo(X_axis_X - 5, X_axis_Y + 5);
	this.ctx.moveTo(X_axis_X, X_axis_Y);
	this.ctx.lineTo(X_axis_X - 5, X_axis_Y - 5);

	this.ctx.moveTo(this.originX, height - 40);
	this.ctx.lineTo(Y_axis_X, Y_axis_Y);

	this.ctx.moveTo(Y_axis_X, Y_axis_Y);
	this.ctx.lineTo(Y_axis_X + 5, Y_axis_Y + 5);
	this.ctx.moveTo(Y_axis_X, Y_axis_Y);
	this.ctx.lineTo(Y_axis_X - 5, Y_axis_Y + 5);
	this.ctx.strokeStyle = "#000";
	this.ctx.stroke();
	if (arguments.length>2)
	{
		oldfont = this.ctx.font; 
		this.ctx.font = "12px Arial"
		this.ctx.rotate(270*Math.PI/180);
		var metrics = this.ctx.measureText(yName);

		this.ctx.fillText(yName,-(height/2)-metrics.width/2,20);
		this.ctx.rotate(90*Math.PI/180);
		this.ctx.font = "14px Arial";
		metrics = this.ctx.measureText(xName);
		this.ctx.fillText(xName,(width)-metrics.width,height-50);
		this.ctx.font = oldfont;
	}
	
}

DVcanvas.prototype.xyTrans = function(x,y) {
	resultX = (x*1.0 - this.Xinc)/this.XZoom/this.ratio + this.originX ;
	
	resultY = this.originY - (y*1.0 - this.Yinc)/this.YZoom/this.ratio;

	return [resultX,resultY];
}

DVcanvas.prototype.xLenTrans = function(len) {
	return len*1.0/this.XZoom/this.ratio;
}

DVcanvas.prototype.yLenTrans = function(len) {
	return len*1.0/this.YZoom/this.ratio;
}
DVcanvas.prototype.Dot = function(x,y,color,flag)
{
	result = this.xyTrans(x,y)
	this.ctx.save();
	bak_color = color;
	if (arguments.length==4)
	{
		result = [x,y];

		color = "#FFF";
	}

	if (arguments.length!=4)
	{
		this.ctx.fillStyle = "rgba(100,100,100,0.5)";
		this.ctx.beginPath();
		this.ctx.arc(result[0]+1,result[1]+1,2,0,2*Math.PI,true);
		this.ctx.closePath();
		this.ctx.fill();
	}

	if(arguments.length==2){
		this.ctx.fillStyle = 'rgb(0,0,0)';
		this.ctx.strokeStyle  = 'rgb(0,0,0)';
	} else
	{
		this.ctx.fillStyle = color;
		this.ctx.strokeStyle  = color;
	}

	this.ctx.beginPath();
	if (arguments.length!=4)
	this.ctx.arc(result[0],result[1],2,0,2*Math.PI,true);
	else
	this.ctx.arc(result[0],result[1],Math.min(this.canvas.width,this.canvas.height)/800*4,0,2*Math.PI,true);
	this.ctx.closePath();
	this.ctx.fill();
	if (arguments.length==4)
	{
		this.ctx.strokeStyle = bak_color;
		this.ctx.beginPath();
		this.ctx.arc(result[0],result[1],Math.min(this.canvas.width,this.canvas.height)/800*5,0,2*Math.PI,true);
		this.ctx.closePath();
		this.ctx.stroke();
	}


	
	this.ctx.restore();
	
}

DVcanvas.prototype.fillPoly = function(X,Y,flag,color)
{
	if (arguments.length<4)
		color = this.getrandomCoLOR(1)[0];
	if (arguments.length<3)
		flag = 1;                //默认是首尾相连的多边形， 如果flag为0，则是到X轴的面积图
	if (flag==0)
	{
		sort = this.sortXY(X,Y);
		X = sort[0];
		Y = sort[1];
		//alert(X[0]+" "+this.originX)
		X.push(Math.max(X[X.length-1],this.originX));
		X.push(Math.max(X[0],this.originX-1));
		X.push(Math.max(X[0],this.originX-1));
		Y.push(this.originY-1);
		Y.push(this.originY-1);
		Y.push(Y[0]);

	}
	this.ctx.save()
	this.ctx.beginPath()
	this.ctx.moveTo(X[0]+1,Y[0]+2);
	this.ctx.fillStyle = "rgba(100,100,100,0.3)";
	for (var i=0;i<X.length;i++)
	{
		this.ctx.lineTo(X[i]+2,Y[i]+2);
	}
	this.ctx.closePath();
	this.ctx.fill();
	this.ctx.beginPath();
	this.ctx.fillStyle = color;
	this.ctx.moveTo(X[0],Y[0]);
	for (var i=0;i<X.length;i++)
	{
		this.ctx.lineTo(X[i],Y[i]);
	}
	this.ctx.closePath();
	this.ctx.fill();
	this.ctx.restore();
}

DVcanvas.prototype.rect = function(x1,y1,height,width,color)
{
	flag = false;
	if (y1==-1)
	{
		flag = true;
		y1 = this.Yinc;
	}
	result1 = this.xyTrans(x1,y1);
	result2 = [(height)*1.0/this.YZoom/this.ratio,width*1.0/this.XZoom/this.ratio];
	result1[1] = result1[1] - result2[0]; 
	this.ctx.save();
	this.ctx.beginPath();
	if(arguments.length==4){
		this.ctx.fillStyle = 'rgb(0,0,0)';
		this.ctx.strokeStyle  = 'rgb(0,0,0)';
	} else
	{
		this.ctx.fillStyle = color;
		this.ctx.strokeStyle = color;
	}
	this.ctx.lineWidth = 1; 

	this.ctx.rect(result1[0]+1,result1[1],result2[1]-1,result2[0]-1);

	this.ctx.closePath();
	this.ctx.stroke();
	this.ctx.restore();
}

DVcanvas.prototype.fillRect = function(x1,y1,height,width,color)
{
	flag = false;
	if (y1==-1)
	{
		flag = true;
		y1 = this.Yinc;
	}
	result1 = this.xyTrans(x1,y1);
	result2 = [(height)*1.0/this.YZoom/this.ratio,width*1.0/this.XZoom/this.ratio];
	result1[1] = result1[1] - result2[0]; 
	this.ctx.beginPath();
	this.ctx.save();
	this.ctx.fillStyle = "rgba(50,50,50,0.1)";
	this.ctx.rect(result1[0]+3,result1[1]+2,result2[1],result2[0]);
	this.ctx.closePath();
	this.ctx.fill();

	this.ctx.beginPath();
	if(arguments.length==4){
		this.ctx.fillStyle = 'rgb(0,0,0)';
		this.ctx.strokeStyle  = 'rgb(0,0,0)';
	} else
	{
		this.ctx.fillStyle = color;
		this.ctx.strokeStyle = color;
	}	
	this.ctx.rect(result1[0]+1,result1[1],result2[1]-1,result2[0]-1);

	this.ctx.lineWidth = 1; 
	this.ctx.closePath();
	//this.ctx.stroke();
	this.ctx.fill();
	this.ctx.restore();
}
DVcanvas.prototype.initial = function(X,Y)
{
	incX = 0.0;
	incY = 0.0;
	if (this.Drawed)
	{
		return 0;
	}
	xm = X.max();
	ym = Y.max();

	xm = (X.max()-X.min())*1.0;
	if ((xm/X.max())<0.3)
		incX = Math.floor(X.min())-1;

	ym = (Y.max()-Y.min());
	if ((ym/Y.max())<0.3)
		incY = Math.floor(Y.min())-1;

	this.setinc(incX,incY);
	this.setmargin(X.max()-incX,Y.max()-incY);

	this.Drawed = true;


}
DVcanvas.prototype.getShadow = function(X,Y,i)
{
	if (Y[i]>=Y[i+1])
		return [1,0]
	return[1,0]
}
DVcanvas.prototype.sortXY = function(X,Y)
{
	mysort = function(i,j)
		{
			return X[i]-X[j];
		}
	sort_index = new Array();
	for (var k=0;k<X.length;k++)
		sort_index.push(k);
	sort_index.sort(mysort);
	newX = new Array();
	newY = new Array();
	for (var k=0;k<X.length;k++)
	{
		newY.push(Y[sort_index[k]]);
		newX.push(X[sort_index[k]]);
	}
	return [newX,newY];
}

DVcanvas.prototype.formatColor =function(color)
{
	this.ctx.save();

	this.ctx.fillStyle = color;
	this.ctx.strokeStyle = color;
	this.ctx.rect(0,0,1,1);
	this.ctx.fill();
	this.ctx.stroke();

	imageData = this.ctx.getImageData(0,0,10,10);
	r = imageData.data[0];  // red   color
	g = imageData.data[1];  // green color
	b = imageData.data[2];  // blue  color
	a = imageData.data[3];



	this.ctx.restore();
	return [r,g,b,a]
}

DVcanvas.prototype.linePath = function(X,Y,color,flag)
{

	if (X.length!=Y.length || X.length<=0)
	{
		console.log("WRONG DATA LENGTH");
		return 0;
	}
	if (this.Drawed==false)
	{
		this.initial([X.min(),X.max()*1.1],[Y.min(),Y.max()*1.1]);
		this.drawGrid();
		this.drawGrad();
	}
	sort = this.sortXY(X,Y);
	X = sort[0];
	Y = sort[1];
	this.ctx.save();
	this.ctx.beginPath();
	shadow = this.getShadow(X,Y,0);
	result = this.xyTrans(X[0],Y[0]);

	this.ctx.moveTo(result[0]+shadow[0],result[1]+shadow[1]);

	this.ctx.strokeStyle = "rgba(100,100,100,0.5)";
	for (var i = 1; i < X.length; i++) {
		result = this.xyTrans(X[i],Y[i]);
		shadow = this.getShadow(X,Y,i);
		this.ctx.lineTo(result[0]+shadow[0],result[1]+shadow[1]);
		this.ctx.moveTo(result[0]+shadow[0],result[1]+shadow[1]);

	};
	this.ctx.closePath();
	this.ctx.stroke();

	if(arguments.length<3)
		color = 'rgb(0,0,0)';

	if (arguments.length<4)
		flag = 0; // 默认不是与X面积形式 
	this.ctx.fillStyle = color;
	this.ctx.strokeStyle = color;
	result = this.xyTrans(X[0],Y[0]);
	tmpX = [result[0]]
	tmpY = [result[1]]
	this.ctx.beginPath();
	this.ctx.moveTo(result[0],result[1]);
	for (var i = 1; i < X.length; i++) {
		result = this.xyTrans(X[i],Y[i]);
		this.ctx.lineTo(result[0],result[1]);
		this.ctx.moveTo(result[0],result[1]);
		tmpX.push(result[0]);
		tmpY.push(result[1]);
	};
	this.ctx.closePath();
	this.ctx.stroke();
	this.ctx.restore();
	color_Format = this.formatColor(color);
	color = "rgba("+color_Format[0]+","+color_Format[1]+","+color_Format[2]+",0.3)"
	if (flag==0)
		this.fillPoly(tmpX,tmpY,0,color);
}
DVcanvas.prototype.MulLinePath = function(X,Y,Z,colors,style,flag)
{

	if (X.length!=Y.length || X.length<=0)
	{
		console.log("WRONG DATA LENGTH");
		return 0;
	}

	maxX = 0;
	maxY = 0;
	if (arguments.length<=3 || colors==0)
	{
		colors = this.getrandomCoLOR(Z.length);
	}
	if (arguments.length<=4)
	{
		style = 0;
	}
	if (arguments.length<=5)
	{
		flag = 1;
	}
	for (var i=0;i<Z.length;i++)
	{
		for (var j=0;j<X[i].length;j++)
		{
			maxX = Math.max(maxX,X[i][j]);
			maxY = Math.max(maxY,Y[i][j]);
		}
	}
	
	this.initial([0,maxX*1.1],[0,maxY*1.1]);

	this.drawGrid();
	this.drawGrad();

	for (var i=0;i<Z.length;i++)
		this.linePath(X[i],Y[i],colors[i],flag);
	this.DrawLineLegend(Z,colors,style);
}
DVcanvas.prototype.DrawLineLegend = function(Z,colors,flag)
{
	this.ctx.save();
	H = this.yLenTrans(this.Ymargin*1.0/20); //绘图高度
	if (flag==0)
	{
		this.fillRect(this.Xmargin+this.Xinc-this.Xmargin*1.0/4,this.Ymargin+this.Yinc-this.Ymargin*1.0/20*Z.length,this.Ymargin*1.0/20*Z.length,this.Xmargin*1.0/4,"rgbA(142,214,249,0.6)");
		Increment = [0,this.Ymargin*1.0/25]
		Oxy = this.xyTrans(this.Xmargin+this.Xinc-this.Xmargin*1.0/4,this.Ymargin+this.Yinc-this.Ymargin*1.0/20*Z.length);
		W = this.Xmargin*1.0/4*2/4;
	}
	else
	{
		Increment = [-this.Xmargin*0.6/Z.length,0];
		
		W = this.Xmargin*0.6/Z.length*2/4;
		Oxy = [this.canvas.width/this.ratio/2 - (this.xLenTrans(W*2)*Z.length)/2,this.canvas.height/this.ratio];
	}
	Increment = [this.xLenTrans(Increment[0]),this.yLenTrans(Increment[1])];
	W = this.xLenTrans(W);
	this.ctx.lineWidth = 2;
	this.ctx.font = H/30*20+"px Arial";
	for (var i=0;i<Z.length;i++)
	{

		this.ctx.strokeStyle = colors[i];
		this.ctx.fillStyle = colors[i];

		this.ctx.beginPath();
		this.ctx.moveTo(Oxy[0]+W/5,Oxy[1]-H/2);
		this.ctx.lineTo(Oxy[0]+W,Oxy[1]-H/2);

		this.ctx.closePath();
		this.ctx.stroke();

		this.ctx.fillStyle = "#000"
		this.ctx.fillText(Z[i],Oxy[0]+W*1.1,Oxy[1]-H/4,W*0.8);
		Oxy[0] -= Increment[0];
		Oxy[1] -= Increment[1];
	}
	this.ctx.restore();
} 

DVcanvas.prototype.drawGradX = function(X,margin)
{
	if (arguments.length==1 || arguments.length==0)
	{
		margin = 1;
		if (this.Xmargin<15)
			margin = 1;
		else if (this.Xmargin<50)
			margin = 5;
		else if (this.Xmargin<100)
			margin = 10;
		else if (this.Xmargin<500)
			margin = 50;
	}
	now = this.Xinc;
	this.ctx.beginPath();
	count = 0;
	//alert(this.Xmargin + " " + this.Xinc +" " + margin);
	oldfont = this.ctx.font;
	//this.ctx.font="oblique 13px Arial"
	//alert(this.Xmargin+"  "+this.Xinc);
	while (now<this.Xmargin*1.1+this.Xinc)
	{
		result = this.xyTrans(now,this.Yinc);
		
		if (result[0]>this.canvas.width/this.ratio-20)
			break;
		this.ctx.lineWidth = 1; 

		if (arguments.length==0  || X.length==0)
		{
			str = ""+now;
			var metrics = this.ctx.measureText(str);
			this.ctx.fillText(""+now,result[0]-metrics.width/2,result[1]+15);
			this.ctx.moveTo(result[0]+1,result[1]);
			this.ctx.lineTo(result[0]+1,result[1]-5*this.ratio);
		}
		else if (count>=1 && count<=X.length)
		{
			this.ctx.lineWidth = 1; 
			str = X[count-1];
			var metrics = this.ctx.measureText(str);
			this.ctx.fillText(str,result[0]-Math.min(metrics.width/2,this.xLenTrans(0.35)),result[1]+15,0.8/this.XZoom/this.ratio);
		}
		this.ctx.lineWidth = 2;
		now = now + margin; 
		count = count + 1;
	}
	this.ctx.closePath();
	this.ctx.stroke();
}
DVcanvas.prototype.drawGradY = function(X,margin)
{
		///////////////Draw Y Grad
	if (arguments.length==1 || arguments.length==0)
	{
		margin = 1;
		if (this.Ymargin<15)
			margin = 1;
		else if (this.Ymargin<50)
			margin = 5;
		else if (this.Ymargin<100)
			margin = 10;
		else if (this.Ymargin<500)
			margin = 50;
	}
	now = this.Yinc;
	this.ctx.beginPath();
		count = 0;
	//alert(this.Ymargin + " " + this.Yinc +" " + margin);
	while (now<this.Ymargin*1.1+this.Yinc)
	{
		result = this.xyTrans(0,now);
		if (result[1]<15)
			break;
		this.ctx.moveTo(result[0],result[1]);
		this.ctx.lineTo(result[0]+5*this.ratio,result[1]);
		
		this.ctx.lineWidth = 1; 
		str = "" + now;
		var metrics = this.ctx.measureText(str);
		this.ctx.fillText(""+now,result[0]-metrics.width-3,result[1]+3,1/this.XZoom/this.ratio+10);
		this.ctx.lineWidth = 2;
		now = now + margin; 
	}
	this.ctx.closePath();
	this.ctx.stroke();
	this.ctx.font = oldfont;
}
DVcanvas.prototype.drawGrad = function(X,margin) //X can be some text
{
	if (arguments.length==0)
	{
		this.drawGradX();
		this.drawGradY();
	}
	if (arguments.length==1)
	{
		this.drawGradX(X);
		this.drawGradY(X);
	}
	if (arguments.length==2)
	{
		this.drawGradX(X,margin);
		this.drawGradY(X,margin);
	}

}

DVcanvas.prototype.drawGridX = function()
{
	this.ctx.lineWidth = 1; 
	this.ctx.save();
	this.ctx.strokeStyle = "rgba(96,96,96,0.5)"
	margin = 1;
	if (this.Xmargin<15)
		margin = 1;
	else if (this.Xmargin<50)
		margin = 5;
	else if (this.Xmargin<100)
		margin = 10;
	else if (this.Xmargin<500)
		margin = 50;
	now = this.Xinc;
	this.ctx.beginPath();
	while (now<this.Xmargin*1.1+this.Xinc)
	{
		result = this.xyTrans(now,0);
		if (result[0]>this.canvas.width/this.ratio-13)
			break;
		this.ctx.moveTo(result[0],result[1]);
		this.ctx.lineTo(result[0],result[1]-this.Ymargin*1.1/this.YZoom/this.ratio);
		now = now + margin; 
	}
	this.ctx.closePath();
	this.ctx.stroke();
	this.ctx.restore();
	this.ctx.lineWidth = 2;
}
DVcanvas.prototype.drawGridY = function()
{	
	this.ctx.lineWidth = 1; 
	this.ctx.save();
	this.ctx.strokeStyle = "rgba(96,96,96,0.5)"
	margin = 1;
	if (this.Ymargin<15)
		margin = 1;
	else if (this.Ymargin<50)
		margin = 5;
	else if (this.Ymargin<100)
		margin = 10;
	else if (this.Ymargin<500)
		margin = 50;
	now = this.Yinc;
	this.ctx.beginPath();
	//alert(this.Ymargin + " " + this.Yinc +" " + margin);
	while (now<this.Ymargin*1.1+this.Yinc)
	{
		result = this.xyTrans(0,now);
		if(result[1]<12)
			break;
		this.ctx.moveTo(result[0],result[1]);
		this.ctx.lineTo(result[0]+this.Xmargin*1.1/this.XZoom/this.ratio,result[1]);
		now = now + margin; 
	}
	this.ctx.closePath();
	this.ctx.stroke();
	this.ctx.restore();
	this.ctx.lineWidth = 2;
}
DVcanvas.prototype.drawGrid = function()  
{
	this.drawGridY();
	this.drawGridX();
}
DVcanvas.prototype.DotChart = function(X,Y,color)
{
	if (X.length!=Y.length || X.length<=0)
	{
		console.log("WRONG DATA LENGTH");
		return 0;
	}

	this.initial([X.min(),X.max()*1.2],[Y.min(),Y.max()*1.2]);
	this.drawGrid();
	this.drawGrad();
	if(arguments.length==2)
		color = 'rgb(0,0,0)';
	for (var i = 0; i < X.length; i++) {
		this.Dot(X[i],Y[i],color);
	};

}
DVcanvas.prototype.initBubble = function(Z)
{

	this.bubbleInc = Z.min();
	this.bubbleRatio = (Math.min(this.canvas.width,this.canvas.height)/this.ratio*0.15-10)/(Z.max() - Z.min());
}
DVcanvas.prototype.getRightTextStyle = function(str,length)
{
	this.ctx.save();
	i = 0;
	for (i=1;i<(Math.min(this.canvas.width,this.canvas.height)/this.ratio/400*23);i++)
	{
		this.ctx.font = i+"px Arial";
		if (this.ctx.measureText(str).width>length)
		{
			i = i - 1;
			this.ctx.restore();
			return i+"px Arial";
		}
	}
	this.ctx.restore();
	return i + "px Arial";
	
}
DVcanvas.prototype.Bubble = function(x,y,z,color,text)
{
	this.ctx.save();
	result = this.xyTrans(x,y);
	z = (z - this.bubbleInc)*this.bubbleRatio+10;
	this.ctx.fillStyle = color;
	this.ctx.strokeStyle = color;
	this.ctx.sector(result[0],result[1],z,0,Math.PI*2);
	this.ctx.fill();
	this.ctx.stroke();

	if (arguments.length==5)
	{

		this.ctx.fillStyle = "#FFF";
		this.ctx.font = this.getRightTextStyle(text,z);

		this.ctx.textAlign = "center";
		this.ctx.fillText(text,result[0],result[1]+this.ctx.measureText("D").width/2);
	}

	this.ctx.restore();
}
DVcanvas.prototype.BubbleChart = function(X,Y,Z,text,color)
{
	if (X.length!=Y.length || X.length<=0)
	{
		console.log("WRONG DATA LENGTH");
		return 0;
	}
	if (!this.Drawed)
	{
		this.initial([X.min(),X.max()*1.2],[Y.min(),Y.max()*1.2]);
		this.drawGrid();
		this.drawGrad();
		this.initBubble(Z);
	}
	if(arguments.length<5)
		color = 'rgbA(142,214,249,0.5)';
	for (var i = 0; i < X.length; i++) {
		if (arguments.length<=3 || text==0)
			this.Bubble(X[i],Y[i],Z[i],color);
		else
			this.Bubble(X[i],Y[i],Z[i],color,text[i]);

	};
}

DVcanvas.prototype.MulBubbleChart = function(Xs,Ys,Zs,texts,colors)
{
	//TODO.......
	if (X.length!=Y.length || X.length<=0)
	{
		console.log("WRONG DATA LENGTH");
		return 0;
	}
	if (!this.Drawed)
	{
		this.initial([X.min(),X.max()*1.2],[Y.min(),Y.max()*1.2]);
		this.drawGrid();
		this.drawGrad();
		this.initBubble(Z);
	}
	if(arguments.length<=5)
		color = 'rgbA(142,214,249,0.5)';
	for (var i = 0; i < X.length; i++) {
		if (text==0)
			this.Bubble(X[i],Y[i],Z[i],color);
		else
			this.Bubble(X[i],Y[i],Z[i],color,text[i]);

	};
} 

//这里可以以这种模式处理，index 和 all 表示是第几项，总共几项
DVcanvas.prototype.DrawBar = function(X,Y,index,all,color)
{
	if (X.length!=Y.length || X.length<=0)
	{
		console.log("WRONG DATA LENGTH");
		return 0;
	}
	if(arguments.length==4 || arguments.length==2)
		color = 'rgbA(142,214,249,0.8)';
	if (arguments.length==2)
	{
		index = 1;
		all = 1;
	}
	if (!this.Drawed)
	{
		this.initial([0,X.length*1.3],[Y.min(),Y.max()*1.2]);
		this.drawGrad(X);
		this.drawGridY();
	}
	for (var i=0;i<X.length;i++)
	{
		result = this.xyTrans(i+1,Y[i]);
		this.fillRect(i+0.7+0.7/all*(index-1),-1,Y[i]-this.Yinc,(0.7/all),color);
		//this.rect(i+0.2,-1,Y[i],0.6,color);
		this.rect(i+0.7+0.7/all*(index-1),-1,Y[i]-this.Yinc,(0.7/all),color);
	}
	this.ctx.lineWidth = 1; 
	oldfont = this.ctx.font;
	this.ctx.font= Math.min(this.canvas.width,this.canvas.height)/this.ratio/400*15+ "px Arial";
	for (var i=0;i<X.length;i++)
	{
		this.ctx.beginPath();
		result = this.xyTrans(i+0.7+0.7/all*(index-1)+(0.7/all)/2,Y[i]);
		str = "" + Y[i];
		var metrics = this.ctx.measureText(str);
		this.ctx.fillText(str,result[0]- Math.min(metrics.width/2,this.xLenTrans((0.7/all)/2)),result[1]-4,Math.min(metrics.width,this.xLenTrans((0.7/all))));
		this.ctx.closePath();
		this.ctx.stroke();
	}
	this.ctx.lineWidth = 1;
	this.ctx.font = oldfont;
}
DVcanvas.prototype.DrawStackBar = function(X,Y,Z,colors)
{
	if (X.length!=Y.length || X.length<=0 ||arguments.length<3)
	{
		console.log("WRONG DATA LENGTH");
		return 0;
	}
	if(arguments.length==3)
		colors = this.getrandomCoLOR(Z.length,0.3);
	maxsum = 0;
	for (var i=0;i<Y.length;i++)
	{
		sum = 0;
		for (var j=0;j<Y[i].length;j++)
			sum+=Y[i][j];
		maxsum = Math.max(maxsum,sum);
	}
	if (!this.Drawed)
	{
		this.initial([0,X.length*1.3],[0,maxsum*1.2]);
		this.drawGrad(X);
		this.drawGridY();
	}

	for (var i=0;i<X.length;i++)
	{
		tmp_y_inc = 0.0;
		for (var j=0;j<Y[i].length;j++)
		{
			
			//color = "rgba("+color_Format[0]+","+color_Format[1]+","+color_Format[2]+",0.3)"
			result = this.xyTrans(i+1,Y[i][j]);
			this.fillRect(i+0.7,tmp_y_inc,Y[i][j]-this.Yinc,0.7,colors[j]);
			//this.rect(i+0.2,-1,Y[i],0.6,color);
			color_Format = this.formatColor(colors[j]);
			color = "rgba("+color_Format[0]+","+color_Format[1]+","+color_Format[2]+",1)"
			this.rect(i+0.7,tmp_y_inc,Y[i][j]-this.Yinc,0.7,color);
			tmp_y_inc+=Y[i][j];
		}

	}

	this.DrawLegend(X.length+1.2,this.Yinc+this.Ymargin/20,Z,colors)
}

DVcanvas.prototype.getrandom =function(N)
{
	return Math.floor(Math.random() * ( N + 1));
}
DVcanvas.prototype.getrandomCoLOR = function(len,alpha)
{
	result = new Array();
	if (arguments.length==1)
		alpha = 0.8;
	for (var i=0;i<len;i++)
	{
		result.push("rgbA("+ this.getrandom(256)+","+this.getrandom(256)+","+this.getrandom(256)+","+alpha+")");
	}
	return result
	//return ["rgbA(142,214,249,0.5)","rgbA(256,0,0,0.5)"]
}
DVcanvas.prototype.DrawMulBar = function(X,Y,Z,colors)
{
	if (X.length!=Y.length || X.length<=0 || arguments.length<3)
	{
		console.log("WRONG DATA LENGTH");
		return 0;
	}
	if (arguments.length==3)
	{
		colors = this.getrandomCoLOR(Z.length);
	}
	ymax = 0;
	ymin = 100000;
	for (var i=0;i<Y.length;i++)
		for (var j=0;j<Y[i].length;j++)
			{
				ymax = Math.max(ymax,Y[i][j]);
				ymin = Math.min(ymin,Y[i][j]);
			}
	if (!this.Drawed)
	{
		this.initial([0,X.length+1],[ymin,ymax*1.1]);
		this.drawGrad(X);
		this.drawGridY();
	}
	for (var i=0;i<Z.length;i++)
	{
		TmpY = new Array();
		for (var j=0;j<X.length;j++)
			TmpY.push(Y[j][i]);
		this.DrawBar(X,TmpY,i+1,Z.length,colors[i]);
	}
	this.setLegendWidth(0.7);
	this.DrawLegend(X.length+1,this.Ymargin/20+this.Yinc,Z,colors);
	this.setLegendWidth(1);
}

DVcanvas.prototype.DrawLegend = function(x,y,Z,colors,pie)
{
	color = 'rgbA(142,214,249,0.5)';
	if (arguments.length==4)
	{
		this.fillRect(x-0.5,this.Ymargin/25+y,this.Ymargin/5.5,this.LegendWidth,color);
		//y = this.Ymargin/20+this.Yinc;
	}
	else
	{
		this.fillRect(x-0.5,y,this.Ymargin/5.5,this.Xmargin/7.1,color);
	}
	this.ctx.save();

	for (var i=0;i<Z.length;i++)
	{

		
		this.ctx.font = Math.min(this.canvas.width,this.canvas.height)/this.ratio/200*5+ "px Arial";
		if (arguments.length==4)
		{
			result = this.xyTrans(x-0.5+this.LegendWidth*0.65,this.Ymargin/20+this.Ymargin/6/Z.length*(i)+y+this.Ymargin/6/Z.length*0.2);
			this.ctx.fillText(Z[i],result[0],result[1],this.xLenTrans(this.LegendWidth*0.35));
			this.rect(x-0.45,this.Ymargin/6/Z.length*(i)+this.Ymargin/20+y,this.Ymargin/6/Z.length*0.8,this.LegendWidth*0.55,color);
			this.fillRect(x-0.45,this.Ymargin/6/Z.length*(i)+this.Ymargin/20+y,this.Ymargin/6/Z.length*0.8,this.LegendWidth*0.55,colors[i]);
		} else
		{
			result = this.xyTrans(x-0.12,this.Ymargin/6/Z.length*(i)+y+this.Ymargin/6/Z.length*0.2);
			this.ctx.fillStyle = "#000";
			this.ctx.fillText(Z[i],result[0]+this.Xmargin/11/this.ratio,result[1]-this.Ymargin*0.004,(this.Xmargin/10.6 - this.Xmargin/14)*2/this.ratio);
			this.rect(x+5*this.ratio,this.Ymargin/6/Z.length*(i)+y+this.Ymargin*0.008,this.Ymargin/6/Z.length*0.8,this.Xmargin/14-2,colors[i]);
			this.fillRect(x+4*this.ratio,this.Ymargin/6/Z.length*(i)+y+this.Ymargin*0.008,this.Ymargin/6/Z.length*0.8,this.Xmargin/14-1,colors[i]);
		}
	}
	this.ctx.restore();
}

DVcanvas.prototype.DrawHist = function(X,inc,margin,color)
{
	if (arguments.length==3 || arguments.length==1 || arguments.length==2)
	{
		color = 'rgbA(142,214,249,0.8)';
	}
	if (arguments.length==2)
	{
		margin = (X.max()-X.min())*1.0/8;
	}
	if (arguments.length==1)
	{
		margin = (X.max()-X.min())*1.0/8;
		inc = X.min();
	}

	var TmpY = new Array();
	for (var i=0;i<Math.floor( (X.max()-inc)*1.0/margin+2 );i++)
	{
		TmpY.push(0);
	}
	for (var i=0;i<X.length;i++)
	{
		TmpY[ Math.floor((X[i]-inc)*1.0/margin)]++;
	}
	

	this.initial([0,Math.floor( (X.max()-inc)*1.0+2 )],[TmpY.min(),TmpY.max()*1.3]);
	this.drawGradX([],margin);
	this.drawGradY();
	this.ctx.font = Math.min(this.canvas.height,this.canvas.width)/400*6+ "px Arial";
	for (var i=0;i<TmpY.length;i++)
	{
		result = this.xyTrans(i*margin+margin/2,TmpY[i]);
		this.rect(i*margin,0,TmpY[i],margin,"#000");
		this.fillRect(i*margin,0,TmpY[i],margin,color);
		str = TmpY[i]+"";
		var metrics = this.ctx.measureText(str);
		if (TmpY[i]>0)
			this.ctx.fillText(TmpY[i]+"",result[0]-metrics.width/2,result[1]-4);
	}
}


DVcanvas.prototype.DrawPie = function(X,Y,colors)
{
	if (arguments.length==2)
	{
		colors = this.getrandomCoLOR(X.length);
	}
	if (X.length != Y.length)
	{
		return 0;
	}
	sum = 0;
	for (var i=0;i<X.length;i++)
	{
		sum += Y[i];
	}

	//oldStyle = [this.ctx.fillStyle,this.ctx.strokeStyle];
	this.ctx.save();
	nowAng = 0;
	CircleDia = Math.min(this.canvas.width,this.canvas.height)/this.ratio;
	oldfont = this.ctx.font;
	this.ctx.font = CircleDia/400*17+ "px Arial";
	for (var i=0;i<X.length;i++)
	{
		this.ctx.beginPath();
		destAng = nowAng + 2*Math.PI*Y[i]*1.0/sum;

		this.ctx.fillStyle = "rgba(100,100,100,0.3)";
		this.ctx.sector(CircleDia/2+Math.cos((destAng+nowAng)*1.0/2)*CircleDia/2*0.01,
						CircleDia/2+Math.sin((destAng+nowAng)*1.0/2)*CircleDia/2*0.01,CircleDia/2-20 + CircleDia/30,nowAng+0.005,destAng-0.005);
		this.ctx.fill();

		this.ctx.fillStyle = colors[i];
		this.ctx.strokeStyle = colors[i];
		
		this.ctx.sector(CircleDia/2,CircleDia/2,CircleDia/2-20,nowAng,destAng);
		this.ctx.closePath();
		this.ctx.fill();
		oldfont = this.ctx.font;
		

		this.ctx.fillStyle = "#FFF";
		str = 	Math.floor(Y[i]/sum*100)+"%";
		var metrics = this.ctx.measureText(str);
		textX = CircleDia/2 + Math.cos((destAng+nowAng)*1.0/2)*CircleDia/2*0.8 - metrics.width*Math.cos((destAng+nowAng)*1.0/2);
		textY = CircleDia/2 + Math.sin((destAng+nowAng)*1.0/2)*CircleDia/2*0.8 - metrics.width*Math.sin((destAng+nowAng)*1.0/2);
		this.ctx.fillText(str,textX,textY);
		

		nowAng = destAng;
		
	}
	this.ctx.restore();
	//根据canvas的大小调整Legend的位置
	y = 0;
	if (this.canvas.height>this.canvas.width)
	{
		y = (this.canvas.height - this.canvas.width)/2;
	}
	x = this.canvas.width*0.86;
	if (this.canvas.height<this.canvas.width)
	{
		x = x - (this.canvas.width - this.canvas.height)/2;
	}
	//alert(y)
	this.DrawLegend(x,y,X,colors,1);
}

Is = function(x) //Inspector
{
	if (x>0)
		return 1;
	return -1;
} 
DVcanvas.prototype.DrawRadar = function(X,Y,Z,min,max,colors)
{
	if (X.length != Y.length)
		return 0;
	if (arguments.length<6)
	{
		colors = this.getrandomCoLOR(X.length,0.3);
	}
	if (arguments.length<5)
	{
		max = 0;
		min = 1000;
		for (var i=0;i<X.length;i++)
		{
			max = Math.max(max,Y[i]);
			min = Math.min(min,Y[i]);
		}
	}

	CircleDia = Math.min(this.canvas.width,this.canvas.height)/this.ratio;
	BaseAng = 1.5*Math.PI;
	incAng = 2*Math.PI/Z.length;

	MapX = new Array();
	MapY = new Array();

	for (var i=0;i<=Z.length;i++)
	{
		t = i%Z.length;
		Ang = t*incAng + BaseAng;
		MapX.push(Math.cos(Ang)*CircleDia*1.0/2*0.8);
		MapY.push(Math.sin(Ang)*CircleDia*1.0/2*0.8);
	}
	incScore = (max - min)*1.0/5;
	for (var step=0;step<=5;step++)
	{
		this.ctx.beginPath();
		shadow = this.getShadow(MapX,MapY,0);
		result = [MapX[0]/6*(6-step)+CircleDia/2,MapY[0]/6*(6-step)+CircleDia/2];
		this.ctx.moveTo(result[0]+shadow[0],result[1]+shadow[1]);
		if (step==0)
			this.ctx.strokeStyle = "#000";
		else
			this.ctx.strokeStyle = "rgba(100,100,100,0.3)"
		this.ctx.lineWidth = 2;
		oldfont = this.ctx.font;
		
		for (var i = 0; i <= Z.length; i++) {
			result = [MapX[i]/5*(5-step)+CircleDia/2,MapY[i]/5*(5-step)+CircleDia/2];
			shadow = this.getShadow(MapX,MapY,i);
			this.ctx.lineTo(result[0]+shadow[0],result[1]+shadow[1]);
			
			if (step==0)
			{
				this.ctx.font = Math.min(this.canvas.width,this.canvas.height)/800*30/this.ratio+ "px Arial";
				this.ctx.moveTo(CircleDia/2,CircleDia/2);
				this.ctx.lineTo(result[0]+shadow[0],result[1]+shadow[1]);
				str =Z[i%Z.length]

				textX = result[0] + MapX[i]*0.15 ;
				textY = result[1] + MapY[i]*0.15 ;
				Ang = (i % Z.length)*incAng + BaseAng;
				//arcFilltext(this.ctx,str,textX,textY,Ang+(Math.PI - 2*Math.PI/Z.length)/2)
				this.ctx.textAlign = "center";
				this.ctx.fillText(str,textX,textY);
				this.ctx.textAlign = "left";
			}
			if (i==0)
			{	
				this.ctx.font = Math.min(this.canvas.width,this.canvas.height)/800*20/this.ratio+ "px Arial";
				this.ctx.fillText(min+incScore*(5-step),result[0]+shadow[0]+5,result[1]+shadow[1]);
			}
			this.ctx.moveTo(result[0]+shadow[0],result[1]+shadow[1]);
		};
		this.ctx.font = oldfont;
		this.ctx.closePath();
		this.ctx.stroke();
	}
	for (var MainStep = 0;MainStep<2;MainStep++)
	{
		for (var class_index=0;class_index<X.length;class_index++)
		{
			
			shadow = this.getShadow(MapX,MapY,0);
			result = [MapX[0]/max*(Y[class_index][0]-min)+CircleDia/2,MapY[0]/max*(Y[class_index][0]-min)+CircleDia/2];
			this.ctx.moveTo(result[0]+shadow[0],result[1]+shadow[1]);
			this.ctx.strokeStyle = colors[class_index];
			this.ctx.fillStyle = colors[class_index];
			this.ctx.lineWidth = 2;
			if (MainStep==0) //绘制多边形
			{
				tmpX = new Array();
				tmpY = new Array();
				for (var j = 0; j <= Z.length; j++) {
					i = j % Z.length;
					result = [MapX[i]/max*(Y[class_index][i]-min)+CircleDia/2,MapY[i]/max*(Y[class_index][i]-min)+CircleDia/2];
					tmpY.push(result[1]);
					tmpX.push(result[0]);
					//this.ctx.moveTo(result[0]+shadow[0],result[1]+shadow[1]);
				};
				this.fillPoly(tmpX,tmpY,1,colors[class_index])
			}


			if (MainStep==1) //绘制点
			for (var j = 0; j <= Z.length; j++) {
				i = j % Z.length;
				result = [MapX[i]/max*(Y[class_index][i]-min)+CircleDia/2,MapY[i]/max*(Y[class_index][i]-min)+CircleDia/2];
				shadow = this.getShadow(MapX,MapY,i);
				this.Dot(result[0]+shadow[0],result[1]+shadow[1],colors[class_index],1);
				//this.ctx.moveTo(result[0]+shadow[0],result[1]+shadow[1]);
			};

		}
	}

	if (X.length>1)
	{
		y = 0;
		if (this.canvas.height>this.canvas.width)
		{
			y = (this.canvas.height - this.canvas.width)/2;
		}
		x = this.canvas.width*0.86;
		if (this.canvas.height<this.canvas.width)
		{
			x = x - (this.canvas.width - this.canvas.height)/2;
		}
		//alert(y)

		this.DrawLegend(x,y,X,colors,1);
	}
}