##illustration

The DVisualMap is a package based on [Leaflet](http://leafletjs.com/index.html) and add some method that are easy to use,especialy for data in china,so this tutoial will be in Chinese,to get more powerful tools,I strongly suggest you using [Leaflet](http://leafletjs.com/index.html) directly.


##a . 引子
本来是想找基于canvas绘图的地图工具，但是找了好久也没找到，所以最后还是使用了 [Leaflet](http://leafletjs.com/index.html) 作为基础进行地图工具的封装和编写，所以这和之前的DVisual图形工具差异相当大，所以专门写一个教程进行说明。

##b . 初始化
你的html文件必须添加四行引用，分别是：

	<script type="text/javascript" src="dvisual_map.js"></script>
	<link rel="stylesheet" href="http://cdn.leafletjs.com/leaflet-0.7.3/leaflet.css" />
	<script type="text/javascript" src="http://cdn.leafletjs.com/leaflet-0.7.3/leaflet.js"></script>
	<script type="text/javascript" src="https://raw.githubusercontent.com/justdark/dvisual/master/dvmap/china.js"></script>

然后创建一个`<div>`标签作为绘图的载体，id是后面需要用到的标识符:

	<div id="map" style="width: 1200px; height: 700px"></div>

接着就可以scipt代码的地方进行各种操作了
	
	<script>
		var dvmap = new DVisualMap('map');
		// your code here
	</script>

##c . 点
点的添加方法是 `dvmap.addDot()`,有两种添加格式，一种就是将参数包裹在一个args中传入,最重要的当然是`position`了，使用具体的一个类进行表示，`text`指定的是点击点弹出的消息,`color`可以是任意的颜色字符串，可以直接是颜色名，也可以用`'rgb(a,b,c)'`或者`'#ff0'`这样的格式

	dvmap.addDot({'position':new DVisualGeoPosition(longitude,latidude)
					,'text':"this is a dot""
					,'color':color})

而另一种简化的方法是传入参数直接传入longitude、latitude、text，即是：

	dvmap.addDot(31.0,120.0,'ssss')

另一个快速添加多个点的方法是`addDots(arr)`，直接传入一个数组`[[long1,lati1],[long2,lati2],[long3,lati3]]`,就会以默认的风格将这些点绘制在地图上。
	
这里的点默认是一种Marker，放大缩小时点的可视大小会保持不变，我们实际上可以通过设置style来绘制圆形并指定其半径，也就是气泡，除了将`'style'`设置为bubble外，还需要设置`'radius'`(以米为单位)

	dvmap.addDot({'position':new DVisualGeoPosition(longitude,latidude)
					,'style':'bubble'
					,'text':'xx'
					,'color':'#0f0'
					,'radius':1000});


##d . 线
线也是地图数据可视化中非常重要的一部分，线的绘制函数为`dvmap.addLines(arr,color)`,arr同样是一系列的点`[[long1,lati1],[long2,lati2],[long3,lati3]]`，这个方法会将这些点依次以color指定的颜色连接起来
	
	dvmap.addLines([lat[t],lat[i]],'#0f0')


##e . 点线的例子
在网上随便找了一份中国城市的经纬坐标图，将所有点绘制上去，效果如下(大概2500个，这个工具在绘制10000个点以下的个数的时候不灰太卡)

![ss](https://raw.githubusercontent.com/justdark/dvisual/master/dvmap/dvmap_image/dot.png)

局部放大的效果(点击显示了其中一个弹出文字，这里是设置的数据的行号，无实际意义):

![ss](https://raw.githubusercontent.com/justdark/dvisual/master/dvmap/dvmap_image/dot_local.png)

随机选了一些点和靠近上海的一个点连接起来：

![ss](https://raw.githubusercontent.com/justdark/dvisual/master/dvmap/dvmap_image/line.png)

##f . 加入颜色图例
有时我们需要一些图例来显示不同的数据，`addLegend()`方法可以做到这一点，传入参数是一个数组，分别表示每一类的颜色和名称`[[color1,class_name_1],[color2,class_name_2]...]`,如：
	
	dvmap.addLegend([['#f00','AAA'],['#0f0','BBBB'],['#00f','CC']]);

![ss](https://raw.githubusercontent.com/justdark/dvisual/master/dvmap/dvmap_image/legend.png)

##f . 中国区域图

这是用来封装的一个适用于中国不同省份地区的数据展示工具，其实就是Leaflet上面的一个实例，只不过我将其特殊化为了中国区域的图罢了。如果你有其他需求的话请参考[Leaflet](http://leafletjs.com/index.html)
中国区域图方法：

	dvmap.setChinaJson(color_function,infomation_function,arr)

一共需要三个参数，其中第三个其实就是Legend需要的那个数组，前两个则是函数，分别是「颜色」和「显示信息」函数。

「颜色函数」就是对于不同省份，会传入该省份的名字，你只需要返回相应的颜色即可

「显示信息函数」是你鼠标移动到不同省份的时候显示在右上角的数据，参数同样也是该省份的名字

举个例子：

	color_function = function(prov)
		{
			if (String(prov)==String('四川'))
				return 'rgb(255,0,0)';
			return 'rgb(32,140,248)'
		}
即是在省份名称是四川的时候返回红色，其他时候返回默认颜色；效果图：

![ss](https://raw.githubusercontent.com/justdark/dvisual/master/dvmap/dvmap_image/sichuan.png)

通过这个方法你可以对不同省份的等级数据指定不同的颜色，从而达到相应的显示效果，就像[这个例子](http://leafletjs.com/examples/choropleth.html)里的美国人口图一样

而`infomation_function(prov)`则是指定不同区域显示在屏幕右上角的消息了，我们简单地显示省份名称和该名称的长度：

	infomation_function = function(pro){
			return String(pro)+":"+ String(pro).length;
		}
![ss](https://raw.githubusercontent.com/justdark/dvisual/master/dvmap/dvmap_image/info.png)
实际上这个函数返回的字符串是加入到innerHTML中的，所以你可以使用任意的html格式标签使其按格式显示更丰富的数据数据。


