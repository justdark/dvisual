Getting Started with DVisual
===

1.add the dvisual.js in your html file:
	
	<script type="text/javascript" src="dvisual.js"></script>

2.create a DVisual instance by pass the id of canvas (a string):
	
	dvisual = new DVisual('canvas_id');

3.now you can create some dvisual graph elements by pass the argument.

	args = {'X':["ClassA","ClassB","ClassC","ClassD"]
		   ,'Y':[5,9,4,8]};
	bar = new DVBarChart(args);

4.now you can add the chart elements into the dvisual and draw it.

	dvisual.addElement(bar);
	dvisual.draw();

5.you will get an image like this:

<img src="https://raw.githubusercontent.com/justdark/dvisual/master/image/13.png" alt="Drawing" width="400px" />

6.there are  more arguments can configure the style of paiting,you can find it from the API doc.

Class Formate Guide
===
dvisual offer some basic graph elements like `DVDot(),DVRect(),DVLine(),DVSector()` etc.they are used to build the chart you used,but there is not need for you to use them.

the most commonly used DVisual graph elements are:

DVBarChart()
-
it's the chart that we used at the first of the tutorial.we passed two member in the `args`,'X' and 'Y',in most of class in DVisual,'X' indicate the component related to the X-axe,in this case it's the bars' name.in other chart,X can also be the value in X-axe.

DVBarChart alse offer the 'stacked' bar chart,now the 'Y' is useless,becaues stacked bar chart need more data to support,it needs `stackedY`,`stackedClass`,`stackedColor`  members in args,it will be easy to know there function by an example.
	
	args = {'X':["bar1","bar1","bar3"],
			'stackedClass':["stacked_1","stacked_2"],
			'stackedY':[[1,2],[3,4],[5,6]],
			'style':'stacked',
			'stackedColor':[new DVColor(55,185,241,0.5),new DVColor(207,231,62,0.5)]}

<img src="https://raw.githubusercontent.com/justdark/dvisual/master/image/14.png" alt="Drawing" width="400px" />

DVMulBarChart()
-
a multiple version of bar chart,which means you can assign more bars for a x-label,
now we use `Ys` to pass the values,`[[1,2,3],[4,5,6]]` means 2 x-label,each label have 3 bars.`Z` to pass different kinds of bar's name,you can set there color by pass `colors`,otherwise random colors.
	
	args = {'X':["A",'B'],'Ys':[[3,2,4],[5,7,8]],'Z':["first","second","third"]}
	dvisual.addElement(new DVMulBarChart(args));

<img src="https://raw.githubusercontent.com/justdark/dvisual/master/image/15.png" alt="Drawing" width="400px" />

DVLineChart()
-
DVLineChart can show `dot`,`line`,`area` and `bubble` chart,and the first three chart can be drawed simultaneously by set the style like `dot|line`,the arguments in args are intuitive,`X` indicate the x value for all node,`Y` for y value.here is a basic example:

	divisual.addElement(new DVLineChart({'X':[1,2,3,4,5,6],
										 'Y':[1,2,3,4,5,6],
										 'style':'dot|line'}));
	
<img src="https://raw.githubusercontent.com/justdark/dvisual/master/image/16.png" alt="Drawing" width="400px" />

we can see the red dots and the lines connect them, the default color is red.now we change the style to `dot|line|area`,we can get the area chart with dots and line.
<img src="https://raw.githubusercontent.com/justdark/dvisual/master/image/17.png" alt="Drawing" width="400px" />

as to the bubble chart,of course the need pass the third degree data,`bubbleRadius`,set the style to `bubble`:

	divisual.addElement(new DVLineChart({'X':[1,2,3,4,5,6],'Y':[1,2,3,4,5,6],
										'bubbleRadius':[1,2,3,4,5,6],
										'style':'bubble'}));
<img src="https://raw.githubusercontent.com/justdark/dvisual/master/image/18.png" alt="Drawing" width="400px" />	

DVMulLineChart()
-
DVMulLineChart is a extension of Line Chart,similar to the MulBarChart,the arguments now we need are `Xs` and `Ys`,if you want to draw `bubble`,`Zs` is also needed,`classes` is a list of string indicate different kind of `dot/line/area/bubble`,here is a example:

	dvisual.addElement(new DVMulLineChart({'Xs':[[1,-2,3,4,5,6],[1,2,3,4,5,6]],
											'Ys':[[1,2,3,4,3,6],[-3,5,2,7,5,2]],
											'Zs':[[3,2,1,4,5,7],[3,2,7,6,8,4]],
											'classes':['A','B'],
											'style':'bubble'}));
<img src="https://raw.githubusercontent.com/justdark/dvisual/master/image/18.png" alt="Drawing" width="400px" />	
we haven't set the color,so it's random,you can set it by pass `colors` an Array of DVColor.ps : the O's coordinates is not (0,0),you must notice that we draw two read line to figure out the zero value.								

DVHistChart()
-
todo

DVPieChart()
-
todo

DVRadarChart()
-















