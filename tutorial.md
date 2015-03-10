#Getting Started with DVisual

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

#Class Formate Guide
dvisual offer some basic graph elements like `DVDot(),DVRect(),DVLine(),DVSector()` etc.they are used to build the chart you used,but there is not need for you to use them.

the most commonly used DVisual graph elements are:

##DVBarChart()

it's the chart that we used at the first of the tutorial.we passed two member in the `args`,'X' and 'Y',in most of class in DVisual,'X' indicate the component related to the X-axe,in this case it's the bars' name.in other chart,X can also be the value in X-axe.

DVBarChart alse offer the 'stacked' bar chart,now the 'Y' is useless,becaues stacked bar chart need more data to support,it needs `stackedY`,`stackedClass`,`stackedColor`  members in args,it will be easy to know there function by an example.
	
	args = {'X':["bar1","bar1","bar3"],
			'stackedClass':["stacked_1","stacked_2"],
			'stackedY':[[1,2],[3,4],[5,6]],
			'style':'stacked',
			'stackedColor':[new DVColor(55,185,241,0.5),new DVColor(207,231,62,0.5)]}

<img src="https://raw.githubusercontent.com/justdark/dvisual/master/image/14.png" alt="Drawing" width="400px" />

##DVMulBarChart()

a multiple version of bar chart,which means you can assign more bars for a x-label,
now we use `Ys` to pass the values,`[[1,2,3],[4,5,6]]` means 2 x-label,each label have 3 bars.`Z` to pass different kinds of bar's name,you can set there color by pass `colors`,otherwise random colors.
	
	args = {'X':["A",'B'],'Ys':[[3,2,4],[5,7,8]],'Z':["first","second","third"]}
	dvisual.addElement(new DVMulBarChart(args));

<img src="https://raw.githubusercontent.com/justdark/dvisual/master/image/15.png" alt="Drawing" width="400px" />

##DVLineChart()

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

##DVMulLineChart()

DVMulLineChart is a extension of Line Chart,similar to the MulBarChart,the arguments now we need are `Xs` and `Ys`,if you want to draw `bubble`,`Zs` is also needed,`classes` is a list of string indicate different kind of `dot/line/area/bubble`,here is a example:

	dvisual.addElement(new DVMulLineChart({'Xs':[[1,-2,3,4,5,6],[1,2,3,4,5,6]],
											'Ys':[[1,2,3,4,3,6],[-3,5,2,7,5,2]],
											'Zs':[[3,2,1,4,5,7],[3,2,7,6,8,4]],
											'classes':['A','B'],
											'style':'bubble'}));
<img src="https://raw.githubusercontent.com/justdark/dvisual/master/image/19.png" alt="Drawing" width="400px" />	

we haven't set the color,so it's random,you can set it by pass `colors` an Array of DVColor.ps : the O's coordinates is not (0,0),you must notice that we draw two red line to figure out the zero value.								

##DVHistChart()

DVHistChart draw the histogram chart,it's a statistic chart for a set of data,so we just need a seires value by pass `X` an Array,and you can pass the `sec` for the segment length otherwise we will auto-calculate it.`yStyle` mean the style on y-axes,"percentage" or "value" you can choose.here is an example:

	dviusal.addElement(new DVHistChart( {'X':[4.845526425588935, 4.259344936827764, 3.8098053040235538, 1.952000211472447, 4.635797415383389, 4.024019790968537, 3.3602908242946734, 5.904528760874355, 4.198898591038685, 3.590128975916881, 4.332713128186926, 3.1865396813511784, 2.5162865661667198, 4.712821025260148, 3.71360994330834, 3.8493524061913744, 3.7159258918857536, 5.51399789047954, 3.6300232108929382, 3.545076471891732, 3.0676446553817147, 3.2444930114999093, 3.5479330646839933, 4.976746738515327, 3.9332813190873934, 5.006312033998867, 3.404727953308918, 3.5033407619438233, 3.079551989356432, 3.8632840581876042, 3.157986089467415, 3.4195326824382866, 3.8080356643280124, 2.957309227091329, 4.118392736251364, 3.6411410599078917, 3.7624757886685964, 4.8647889699576226, 5.21796736714372, 3.976067213322964, 5.126928746440573, 3.974656703704623, 3.233580498913617, 4.395312593899124, 4.068962687058488, 3.891929789953702, 4.469243993566407, 4.334454703693426, 3.9209889294562856, 3.4434304992247453, 4.497549493028219, 3.416343894896489, 4.665283209646114, 4.680609105269387, 4.983997832840491, 3.6712180044043317, 3.265064804033842, 3.4698542145767295, 3.600410757683259, 3.258705331315113, 3.4711330714824475, 5.850035283124024, 4.4280162444420395, 2.9032881754752737, 3.8438971175165753, 4.876106607781984, 2.558687703308084, 3.5013932005344044, 3.5555419525521454, 5.1907150725045845, 4.011722379620389, 3.527897189378135, 4.10495828533477, 6.62176464809461, 4.2726902430636144, 3.900071148628866, 2.575252541466217, 5.328266087881893, 2.5589399335225336, 5.724120236174612, 4.4515392634560085, 4.7151321389757594, 2.8531894976428953, 3.4703243319242265, 2.2640882905146724, 5.0719845838182795, 3.574145032952119, 4.477360695988922, 5.779618114520955, 4.456319741265055, 3.8274174274387756, 6.050865845999171, 5.286157426108568, 4.197556181625366, 3.2386132037552726, 4.409816073319034, 4.225877761979799, 5.313407146149141, 5.042124222577709, 3.979632468039347],
				'yStyle':'value'}))

<img src="https://raw.githubusercontent.com/justdark/dvisual/master/image/20.png" alt="Drawing" width="400px" />	

if we set the `'sec':0.5`,`'yStyle':'percentage'`,we can get the image like this:

<img src="https://raw.githubusercontent.com/justdark/dvisual/master/image/21.png" alt="Drawing" width="400px" />	

##DVPieChart()

the data we need is intuitive,`'X'` is a list of string indicate each sector's name,`'Y'` contains their values,the `style` of DVPieChart decide the text in the sector,'empty','showPercentage' or 'showtext',if you want to 'showtext',you need pass the `'text'` argument a list of string too.another argument `'colors'`,use it as in other chart.here is an example:

	dvisual.addElement(new DVPieChart({'X':["ClassA","ClassB","ClassC","ClassD"],
										'Y':[2,3,4,5]}))

<img src="https://raw.githubusercontent.com/justdark/dvisual/master/image/22.png" alt="Drawing" width="400px" />	

another piechart is DVAreaPieChart(),all the arguments are same with DVPieChart(),but draw the pie in another style:

	dvisual.addElement(new DVAreaPieChart({'X':["ClassA","ClassB","ClassC","ClassD","ClassE","ClassF"],
										'Y':[2,3,4,5,7,9]}))

<img src="https://raw.githubusercontent.com/justdark/dvisual/master/image/24.png" alt="Drawing" width="400px" />

to get a Donut chart,you can set the `ring_ratio` indicate the inner empty core's radius ratio of the outer circle,for example:

	dvisual.addElement(new DVPieChart({'X':["ClassA","ClassB","ClassC","ClassD"],
										'Y':[2,3,4,5],
										'ring_ratio':0.5}))
<img src="https://raw.githubusercontent.com/justdark/dvisual/master/image/26.png" alt="Drawing" width="400px" />
##DVRadarChart()

radar chart is a useful chart when you want to judge two kind of object in more than 3 arguments,let's see what we need:

1) the objects' names:it's `'X'`,an Array(string);

2) the arguments' names:it's `'arguments'`,an Array(string);

3) each  object's value on each arugument,it's `'Y'`,an Array(Array(double))

4) the maxium of argument(`'argmax'`),minium of argument(`'argmin'`),0 and 10 in default.

5) colors:random in default.

here is an example	:

	dvisual.addElement(new DVRadarChart({'X':["ClassA","ClassB"],
										'Y':[[3,4,5,6,3,7],[6,7,6,5,8,9]],
										'arguments':["速度","能力","强度","战斗力","成本","价格"]}))
									
<img src="https://raw.githubusercontent.com/justdark/dvisual/master/image/23.png" alt="Drawing" width="400px" />	


##DVBoxChart()

The Box Chart is another chart show some statistical value for the data,the input is also intuitive,`'X'` means each box's name,`'Ys'` contains the set of data for each box,It's easy for us to build an box chart as below and judge different data,include the median,Quartile,Bounds and outliers.you can also pass the `'colors'` for each box,of course,random in default.

	dvisual.addElement(new DVBoxChart({'X':["ClassA","ClassB","ClassC"],
										'Ys':[[2,3,4,5,7,9,5,6,2,4,6,7,8,3,5,6,3,2],
											  [5,6,2,4,7,8,3,6,2,7,15,4,8,3,8,9,5,6],
											  [3,2,4,5,6,7,2,12,11,13,12,10,11,15]]}))

<img src="https://raw.githubusercontent.com/justdark/dvisual/master/image/25.png" alt="Drawing" width="400px" />	

##DVDendrogram()
The Dendrogram chart can intepret a tree ,for example a hierarchical clustering result,the most important you should pass is the `'tree'` elements,an array contains the structure of tree,`["A",["B","C"]]` for example.you can determined the  base elements' style by pass the `'style'` with 'text' or 'bubble',you can also appoint the bubble's color by pass the `'color'` argument.

	dvisual.addElement(new DVDendrogram({'style':'bubble','tree':[["A",[[["S",[[[[[["A","B"],"B"],"B"],"B"],"B"],"TM"]],"VB"],"ASD"]],["B","C"]]}))

<img src="https://raw.githubusercontent.com/justdark/dvisual/master/image/27.png" alt="Drawing" width="400px" />	

##DVCircleConnectChart()
Sometime we want to show some nodes' connecting relationships,so the DVCircleConnectChart will be useful.by pass the `'nodes'` and `'edges'` to this DVisual element,you can get a well organized picture,more optinal arguments can make the chart more personality.here is an example.

	dvisual.addElement(new DVCircleConnectChart({'nodes':["AAAA","BBBB","CCCC","DDDD","EEEE","FFFF","GGGGGGG","HHHH","IIII","JJJJ","KKKK",'LLLL','MMMM','NNNN','OOOO','PPPP','QQQQ','RRR','SSS','TTT','UUU','VVV','WWW','XXX','YYY','ZZZ',"AAAA","BBBB","CCCC","DDDD","EEEE","FFFF","GGGGGGG","HHHH","IIII","JJJJ","KKKK",'LLLL','MMMM','NNNN','OOOO','PPPP','QQQQ','RRR','SSS','TTT','UUU','VVV','WWW','XXX','YYY','ZZZ']
									,'edges':getMulRandomtuple(51,50) //random data
									,'bubbleRadius':5 
									,'edgesValue':getMulRandomSet(10,50) //random data
									,'lineWidth':2 // maxium curve width.
									,'CurveColor':new DVColor(14,110,179) //color of the curve
									}))
<img src="https://raw.githubusercontent.com/justdark/dvisual/master/image/28.png" alt="Drawing" width="400px" />	