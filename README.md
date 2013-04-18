# 一、一瞥

*1、2行7列*  
![Demo][1]

*2、3行4列* 
![Demo2][2] 

*3、[演示地址][3]*

# 二、如何使用

*1、引入库*

    <script type="text/javascript" src="http://runjs.cn/js/sandbox/jquery/jquery-1.8.3.min.js"></script>
	<script type="text/javascript" src="http://git.oschina.net/bluishoul/portrait-wall/raw/master/jquery-portraitwall.js"></script>

    
*2、添加一个div用于显示头像墙*  

	<div class="portrait-wall">
    </div>

*3、构建需要显示的头像item*

可利用模版语言在 portrait-wall 中生成，也可以用 Javascript 生成，以下以 Javascript 方式为例：
	
    $(function(){
      var pt = $(".portrait-wall");
      var item_tpl = '<div class="item" id="" title="" data-hashd="1"><div class="info"><a href="http://www.oschina.net/" target="_blank">OSChina</a></div></div>';
      var counts = images.length;//图片数
      for (var i = 0; i < counts; i++) {
          var item = $(item_tpl);
          item.attr("id", "item" + (i + 1));
          pt.append(item);
          if(i==0){
              item.find(".info").css("bottom","0px");
          }
      }
      //下面启用插件以及配置参数
      *****
    });

*4、启用 portrait-wall 插件，并配置参数*

    $(".portrait-wall").portraitwall({
          width: 100,
          height: 100,
          columns: 4,
          rows:3,
          images: images,
          hdimages: hdimages,
          onHDShow:function(item,options){
              $(item).find('.info').animate({
                  bottom:0
              });
          },
          onHDClick:function(item,options){
              
          },
          onNoHDClick:function(item,options){
              var self = $(item).find('.info');
              if(parseInt(self.css("bottom"))==-100){
                  self.animate({
                      bottom:0
                  });
              }else{
                  self.animate({
                      bottom:-100
                  });
              }
          },
          css: [
              '.portrait-wall{margin:40px auto;}',
              '.portrait-wall .item{overflow:hidden;}',
              '.portrait-wall .cur{box-shadow:0px 0px 10px rgba(0,0,0,0.2) inset;}',
              '.portrait-wall .info{position:absolute;text-align:center;width:100%;height:100px;bottom:-100px;background-color:rgba(0, 0, 0, .5);;color:#FFF;line-height:100px;}',
              '.portrait-wall .info a{color:#FFF;text-shadow: 2px 2px 1px black;font-size: 14px;}',
              '.portrait-wall .info.show{bottom:0px;}'
          ]
 	 });

*4、1 参数详解*  

`width`：小头像宽  

`height`：小头像高  

*注：*当前只支持宽高相等图片  

`columns`：头像显示列数

`rows`：头像显示行数  

`images`：小头像图片 `URL` 数组  

`hdimages`：高清头像图片 `URL` 数组  

`css`：头像墙样式，字符串数组  

`onHDShow`：当高清头像显示时被调用，具有两个参数 `item` 为当前显示的 item 节点，`options` 配置参数对  象

`onHDClick`：当高清头像显示后被点击是调用，参数同上  

`onNoHDClick`：当没有高清头像的节点被点击时调用，参数同上 

# 三、HOW IT WORKS?

*1、根据 位置数 确定占位矩阵*

    1   2   3   4               *1  *2   3   4
    5   6   7   8    cur = 1    *5  *6   7   8
    9   10  11  12  --------->   9   10  11  12
    13  14  15  16	  matrix     13  14  15  16
    17  18  19  20               17  18  19  20
			
*2、根据 位置数 确定 值矩阵*

    1   2   3   4               *1  *1   2   3
    5   6   7   8    cur = 1    *1  *1   4   5
    9   10  11  12  --------->   6   7   8   9
    13  14  15  16	 v_matrix    10  11  12  13
    17  18  19  20               14  15  16  17

*3、占位矩阵 与 值矩阵转换，然后再按转换后的位置重新计算显示位置:*
			转换步骤：
			(1) - 根据 v_matrix 矩阵获取对应新的 位置数：getIndexByValue
			(2) - 根据 位置数 获取 占位矩阵：getCurMatrix
			(3) - 根据 显示位置 重建占位矩阵

(1) cur = 15 --> cur = 18

    *1  *1   2   3     (1)      1   2   3   4		(2)      1    2   3   4 	   (3)      1    2    3   4 
    *1  *1   4   5   初始状态    5   6   7   8    cur = 18    5    6   7   8	 cur = 15    5    6    7   8
     6   7   8   9  --------->  9   10  11  12  ---------->  9    10  11  12  ----------->  9    10   11  12
     10  11  12  13             13  14  15  16	  matrix     13  *14 *15  16	v_matrix    13  *15  *15  14
     14 *15  16  17             17 *18  19  20               17  *18 *19  20                16  *15  *15  17

*4、前一状态 到 当前状态的转换*

          prv: 							  now:

    *1  *1   2   3                  1    2    3   4 
    *1  *1   4   5                  5    6    7   8
     6   7   8   9   (1)--->(15)    9    10   11  12
     10  11  12  13                 13  *15  *15  14
     14  15  16  17                 16  *15  *15  17

根据当前给定位置数获得所占据的显示位（2*2）矩阵 如：cur = 2，columns = 4，rows = 5，返回 [2,3,6,7]

    1   2   3   4               1   *2  *3  4
    5   6   7   8    cur = 2    5   *6  *7  8
    9   10  11  12  --------->  9   10  11  12
    13  14  15 1 6              13  14  15  16
    17  18  19  20              17  18  19  20

  [1]: http://git.oschina.net/bluishoul/portrait-wall/raw/master/res/demo.png
  [2]: http://git.oschina.net/bluishoul/portrait-wall/raw/master/res/demo2.png
  [3]: http://sandbox.runjs.cn/show/oxynfmff