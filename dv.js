Array.prototype.max = function(){ 
return Math.max.apply({},this) 
} 
Array.prototype.min = function(){ 
return Math.min.apply({},this) 
} 
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

	this.ctx.moveTo(this.originX+1, height - 40);
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
	oldStyle = [this.ctx.fillStyle,this.ctx.strokeStyle];
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
	this.ctx.arc(result[0],result[1],3,0,2*Math.PI,true);
	this.ctx.closePath();
	this.ctx.fill();
	if (arguments.length==4)
	{
		this.ctx.strokeStyle = bak_color;
		this.ctx.beginPath();
		this.ctx.arc(result[0],result[1],4,0,2*Math.PI,true);
		this.ctx.closePath();
		this.ctx.stroke();
	}


	this.ctx.lineWidth = 2; 
	//this.ctx.stroke();
	
	this.ctx.fillStyle = oldStyle[0];
	this.ctx.strokeStyle  = oldStyle[1];
	
}


DVcanvas.prototype.rect = function(x1,y1,height,width,color)
{
	flag = false;
	if (y1==-1)
	{
		flag = true;
		y1 = 0;
	}
	result1 = this.xyTrans(x1,y1);
	result2 = [height*1.0/this.YZoom/this.ratio,width*1.0/this.XZoom/this.ratio];
	result1[1] = result1[1] - result2[0]; 
	oldStyle = [this.ctx.fillStyle,this.ctx.strokeStyle];
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
	
	this.ctx.fillStyle = oldStyle[0];
	this.ctx.strokeStyle  = oldStyle[1];
}

DVcanvas.prototype.fillRect = function(x1,y1,height,width,color)
{
	flag = false;
	if (y1==-1)
	{
		flag = true;
		y1 = 0;
	}
	result1 = this.xyTrans(x1,y1);
	result2 = [height*1.0/this.YZoom/this.ratio,width*1.0/this.XZoom/this.ratio];
	result1[1] = result1[1] - result2[0]; 
	this.ctx.beginPath();
	oldStyle = [this.ctx.fillStyle,this.ctx.strokeStyle];
	this.ctx.fillStyle = "rgba(100,100,100,0.3)";
	this.ctx.rect(result1[0]+3,result1[1]+3,result2[1],result2[0]-2);
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


	this.ctx.fillStyle = oldStyle[0];
	this.ctx.strokeStyle  = oldStyle[1];
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
	if ((xm/X.max())<0.1)
		incX = X.min();

	ym = (Y.max()-Y.min());
	if ((ym/Y.max())<0.1)
		incY = Y.min();

	this.setinc(incX,incY);
	this.setmargin(xm,ym);

	this.Drawed = true;


}
DVcanvas.prototype.getShadow = function(X,Y,i)
{
	if (Y[i]>=Y[i+1])
		return [1,0]
	return[1,0]
}
DVcanvas.prototype.linePath = function(X,Y,color)
{

	if (X.length!=Y.length || X.length<=0)
	{
		console.log("WRONG DATA LENGTH");
		return 0;
	}
	if (this.Drawed==false)
	{
		this.initial(X,Y);
		this.drawGrid();
		this.drawGrad();
	}
	oldStyle = [this.ctx.fillStyle,this.ctx.strokeStyle];
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


	if(arguments.length==2){
		color = 'rgb(0,0,0)';
	} 
	this.ctx.fillStyle = color;
	this.ctx.strokeStyle = color;
	result = this.xyTrans(X[0],Y[0]);

	this.ctx.beginPath();
	this.ctx.moveTo(result[0],result[1]);
	for (var i = 1; i < X.length; i++) {
		result = this.xyTrans(X[i],Y[i]);
		this.ctx.lineTo(result[0],result[1]);
		this.ctx.moveTo(result[0],result[1]);

	};
	this.ctx.closePath();
	this.ctx.stroke();

	this.ctx.fillStyle = oldStyle[0];
	this.ctx.strokeStyle  = oldStyle[1];
}
DVcanvas.prototype.MulLinePath = function(X,Y,Z,colors,style)
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
	for (var i=0;i<Z.length;i++)
	{
		for (var j=0;j<X[i].length;j++)
		{
			maxX = Math.max(maxX,X[i][j]);
			maxY = Math.max(maxY,Y[i][j]);
		}
	}
	
	this.initial([0,maxX],[0,maxY]);

	this.drawGrid();
	this.drawGrad();

	for (var i=0;i<Z.length;i++)
		this.linePath(X[i],Y[i],colors[i]);
	this.DrawLineLegend(Z,colors,style);
}
DVcanvas.prototype.DrawLineLegend = function(Z,colors,flag)
{
	oldStyle = [this.ctx.fillStyle,this.ctx.strokeStyle,this.ctx.font];
	H = this.yLenTrans(this.Ymargin*1.0/20); //绘图高度
	if (flag==0)
	{
		this.fillRect(this.Xmargin+this.Xinc-this.Xmargin*1.0/4,this.Ymargin+this.Yinc-this.Ymargin*1.0/20*Z.length,this.Ymargin*1.0/20*Z.length,this.Xmargin*1.0/4,"rgbA(142,214,249,0.6)");
		Increment = [0,this.Ymargin*1.0/20]
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
	this.ctx.lineWidth = 3;
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
	this.ctx.fillStyle = oldStyle[0];
	this.ctx.strokeStyle = oldStyle[1];
	this.ctx.font = oldStyle[2]
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
		result = this.xyTrans(now,0);
		
		
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
			this.ctx.fillText(X[count-1],result[0]-Math.min(X[count-1].length,5)*4,result[1]+15,0.8/this.XZoom/this.ratio);
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
	oldStyle = [this.ctx.fillStyle,this.ctx.strokeStyle];
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
		this.ctx.moveTo(result[0],result[1]);
		this.ctx.lineTo(result[0],result[1]-this.Ymargin*1.1/this.YZoom/this.ratio);
		now = now + margin; 
	}
	this.ctx.closePath();
	this.ctx.stroke();
	this.ctx.strokeStyle = oldStyle[1];
	this.ctx.lineWidth = 2;
}
DVcanvas.prototype.drawGridY = function()
{	
	this.ctx.lineWidth = 1; 
	oldStyle = [this.ctx.fillStyle,this.ctx.strokeStyle];
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
		this.ctx.moveTo(result[0],result[1]);
		this.ctx.lineTo(result[0]+this.Xmargin*1.1/this.XZoom/this.ratio,result[1]);
		now = now + margin; 
	}
	this.ctx.closePath();
	this.ctx.stroke();
	this.ctx.strokeStyle = oldStyle[1];
	this.ctx.lineWidth = 2;
}
DVcanvas.prototype.drawGrid = function()  
{
	this.drawGridY();
	this.drawGridX();
}
DVcanvas.prototype.DotPath = function(X,Y,color)
{
	if (X.length!=Y.length || X.length<=0)
	{
		console.log("WRONG DATA LENGTH");
		return 0;
	}
	this.initial(X,Y);
	this.drawGrid();
	this.drawGrad();
	if(arguments.length==2)
		color = 'rgb(0,0,0)';
	for (var i = 0; i < X.length; i++) {
		this.Dot(X[i],Y[i],color);
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
		this.initial([0,X.length+1],[0,Y.max()]);
		this.drawGrad(X);
		this.drawGridY();
	}
	for (var i=0;i<X.length;i++)
	{
		result = this.xyTrans(i+1,Y[i]);
		this.fillRect(i+0.7+0.7/all*(index-1),-1,Y[i],(0.7/all),color);
		//this.rect(i+0.2,-1,Y[i],0.6,color);
		this.rect(i+0.7+0.7/all*(index-1),-1,Y[i],(0.7/all),color);
	}
	this.ctx.lineWidth = 1; 
	oldfont = this.ctx.font;
	this.ctx.font= this.canvas.style.width/400*15+ "px Arial";
	for (var i=0;i<X.length;i++)
	{
		this.ctx.beginPath();
		result = this.xyTrans(i+0.7+0.7/all*(index-1)+(0.7/all)/2,Y[i]);
		str = "" + Y[i];
		var metrics = this.ctx.measureText(str);
		this.ctx.fillText(""+Y[i],result[0]-metrics.width/2,result[1]-7);
		this.ctx.closePath();
		this.ctx.stroke();
	}
	this.ctx.lineWidth = 1;
	this.ctx.font = oldfont;
	
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
	for (var i=0;i<Y.length;i++)
		for (var j=0;j<Y[i].length;j++)
			if (ymax<Y[i][j])
				ymax = Y[i][j];
	if (!this.Drawed)
	{
		this.initial([0,X.length+1],[0,ymax]);
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
	this.DrawLegend(X.length+1,0,Z,colors);
}

DVcanvas.prototype.DrawLegend = function(x,y,Z,colors,pie)
{
	color = 'rgbA(142,214,249,0.5)';
	if (arguments.length==4)
	{
		this.fillRect(x-0.5,this.Ymargin/25,this.Ymargin/5.5,0.7,color);
		y = this.Ymargin/20;
	}
	else
	{
		this.fillRect(x-0.5,y,this.Ymargin/5.5,this.Xmargin/7.1,color);
	}
	oldfont = this.ctx.font;
	this.ctx.font = this.canvas.width/800*10+ "px Arial";

	for (var i=0;i<Z.length;i++)
	{
		result = this.xyTrans(x-0.12,this.Ymargin/6/Z.length*(i)+y+this.Ymargin/6/Z.length*0.2);
		if (arguments.length==4)
		{
			this.ctx.fillText(Z[i],result[0],result[1],this.xLenTrans(0.31));
			this.rect(x-0.45,this.Ymargin/6/Z.length*(i)+this.Ymargin/20,this.Ymargin/6/Z.length*0.8,0.3,color);
			this.fillRect(x-0.45,this.Ymargin/6/Z.length*(i)+this.Ymargin/20,this.Ymargin/6/Z.length*0.8,0.3,colors[i]);
		} else
		{
			this.ctx.fillStyle = "#000";
			this.ctx.fillText(Z[i],result[0]+this.Xmargin/11/this.ratio,result[1]-this.Ymargin*0.004,(this.Xmargin/10.6 - this.Xmargin/14)*2/this.ratio);
			this.rect(x+5*this.ratio,this.Ymargin/6/Z.length*(i)+y+this.Ymargin*0.008,this.Ymargin/6/Z.length*0.8,this.Xmargin/14-2,colors[i]);
			this.fillRect(x+4*this.ratio,this.Ymargin/6/Z.length*(i)+y+this.Ymargin*0.008,this.Ymargin/6/Z.length*0.8,this.Xmargin/14-1,colors[i]);
		}
	}
	this.ctx.font = oldfont;
}

DVcanvas.prototype.DrawHist = function(X,inc,margin,color)
{
	if (arguments.length==3 || arguments.length==1 || arguments.length==2)
	{
		color = this.getrandomCoLOR(1)[0];
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
	

	this.initial([0,Math.floor( (X.max()-inc)*1.0+2 )],TmpY);
	this.drawGradX([],margin);
	this.drawGradY();
	this.drawGridY();
	for (var i=0;i<TmpY.length;i++)
	{
		result = this.xyTrans(i*margin+margin/2,TmpY[i]);
		this.rect(i*margin,0,TmpY[i],margin,"#000");
		this.fillRect(i*margin,0,TmpY[i],margin,color);
		str = TmpY[i]+"";
		var metrics = this.ctx.measureText(str);
		if (TmpY[i]>0)
			this.ctx.fillText(TmpY[i]+"",result[0]-metrics.width/2,result[1]-4,this.xLenTrans(0.31));
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

	oldStyle = [this.ctx.fillStyle,this.ctx.strokeStyle];
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
						CircleDia/2+Math.sin((destAng+nowAng)*1.0/2)*CircleDia/2*0.01,CircleDia/2- 4*this.ratio,nowAng+0.005,destAng-0.005);
		this.ctx.fill();

		this.ctx.fillStyle = colors[i];
		this.ctx.strokeStyle = colors[i];
		
		this.ctx.sector(CircleDia/2,CircleDia/2,CircleDia/2-20,nowAng,destAng);
		this.ctx.closePath();
		this.ctx.fill();
		//////////////!!!!!TODO////////
		oldfont = this.ctx.font;
		

		this.ctx.fillStyle = "#FFF";
		str = 	Math.floor(Y[i]/sum*100)+"%";
		var metrics = this.ctx.measureText(str);
		textX = CircleDia/2 + Math.cos((destAng+nowAng)*1.0/2)*CircleDia/2*0.8 - metrics.width*Math.cos((destAng+nowAng)*1.0/2);
		textY = CircleDia/2 + Math.sin((destAng+nowAng)*1.0/2)*CircleDia/2*0.8 - metrics.width*Math.sin((destAng+nowAng)*1.0/2);
		this.ctx.fillText(str,textX,textY);
		

		nowAng = destAng;
		
	}
	this.ctx.font = oldfont;
	this.ctx.strokeStyle = oldStyle[1];
	this.ctx.fillStyle = oldStyle[0];
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
		colors = this.getrandomCoLOR(X.length,0.5);
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
		MapX.push(Math.cos(Ang)*CircleDia/2*0.8);
		MapY.push(Math.sin(Ang)*CircleDia/2*0.8);
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
				this.ctx.font = this.canvas.width/800*20*2/this.ratio+ "px Arial";
				this.ctx.moveTo(CircleDia/2,CircleDia/2);
				this.ctx.lineTo(result[0]+shadow[0],result[1]+shadow[1]);
				str =Z[i%Z.length]

				textX = result[0] + MapX[i]*0.15 - MapX[i]*0.2*(Is(MapX[i]) );
				textY = result[1] - 25+ MapY[i]*0.15 + MapY[i]*0.2*(Is(MapY[i]) );
				this.ctx.fillText(str,textX,textY);
			}
			if (i==0)
			{	
				this.ctx.font = this.canvas.width/800*10+ "px Arial";
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
		
		this.ctx.beginPath();
		shadow = this.getShadow(MapX,MapY,0);
		result = [MapX[0]/max*(Y[class_index][0]-min)+CircleDia/2,MapY[0]/max*(Y[class_index][0]-min)+CircleDia/2];
		this.ctx.moveTo(result[0]+shadow[0],result[1]+shadow[1]);
		this.ctx.strokeStyle = colors[class_index];
		this.ctx.fillStyle = colors[class_index];
		this.ctx.lineWidth = 2;
		if (MainStep==0) //绘制多边形
		for (var j = 0; j <= Z.length; j++) {
			i = j % Z.length;
			result = [MapX[i]/max*(Y[class_index][i]-min)+CircleDia/2,MapY[i]/max*(Y[class_index][i]-min)+CircleDia/2];
			shadow = [0,0];//this.getShadow(MapX,MapY,i);
			this.ctx.lineTo(result[0]+shadow[0],result[1]+shadow[1]);
			//this.ctx.moveTo(result[0]+shadow[0],result[1]+shadow[1]);
		};
		this.ctx.closePath();
		this.ctx.lineWidth = 2;
		this.ctx.fill();
		this.ctx.stroke();
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
	// sum = 0;
	// for (var i=0;i<X.length;i++)
	// {
	// 	sum += Y[i];
	// }

	// oldStyle = [this.ctx.fillStyle,this.ctx.strokeStyle];
	// nowAng = 0;
	
	// oldfont = this.ctx.font;
	// this.ctx.font = CircleDia/400*17+ "px Arial";
	// for (var i=0;i<X.length;i++)
	// {
	// 	this.ctx.beginPath();
	// 	destAng = nowAng + 2*Math.PI*Y[i]*1.0/sum;

	// 	this.ctx.fillStyle = "rgba(100,100,100,0.3)";
	// 	this.ctx.sector(CircleDia/2+Math.cos((destAng+nowAng)*1.0/2)*CircleDia/2*0.01,
	// 					CircleDia/2+Math.sin((destAng+nowAng)*1.0/2)*CircleDia/2*0.01,CircleDia/2- 4*this.ratio,nowAng+0.005,destAng-0.005);
	// 	this.ctx.fill();

	// 	this.ctx.fillStyle = colors[i];
	// 	this.ctx.strokeStyle = colors[i];
		
	// 	this.ctx.sector(CircleDia/2,CircleDia/2,CircleDia/2-20,nowAng,destAng);
	// 	this.ctx.closePath();
	// 	this.ctx.fill();


	// 	//////////////!!!!!TODO////////
	// 	oldfont = this.ctx.font;
		

	// 	this.ctx.fillStyle = "#FFF";
	// 	str = 	Math.floor(Y[i]/sum*100)+"%";
	// 	textX = CircleDia/2 + Math.cos((destAng+nowAng)*1.0/2)*CircleDia/2*0.8 - 8*str.length*Math.cos((destAng+nowAng)*1.0/2);
	// 	textY = CircleDia/2 + Math.sin((destAng+nowAng)*1.0/2)*CircleDia/2*0.8 - 4*str.length*Math.sin((destAng+nowAng)*1.0/2);
	// 	this.ctx.fillText(str,textX,textY);
		

	// 	nowAng = destAng;
		
	// }
	// this.ctx.font = oldfont;
	// this.ctx.strokeStyle = oldStyle[1];
	// this.ctx.fillStyle = oldStyle[0];
	// //根据canvas的大小调整Legend的位置
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