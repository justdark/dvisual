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

todo

DVMulLineChart()
-
todo

DVHistChart()
-
todo

DVPieChart()
-
todo

DVRadarChart()
-















