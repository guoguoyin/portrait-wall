/**
 * jQuery Portrait Wall 0.1.0
 * Author: bluishoul
 * Since:2013-04-07
 * 
 * TODOs:
 * 1、暂时只支持长宽相同图片，http://jsfiddle.net/kTewC/13/
 * 2、当前性能尚未优化，position未改变item不作动画处理
 * 3、图片需要预加载
 *
 * http://www.apache.org/licenses/LICENSE-2.0.txt
 */
;(function($) {
	
	var selector,
	
	options = {
		width : 80,
		height : 80,
		rows : 12,
		columns : 8,
		images : [],
		hdimages:[],
		css:[],
		//当大图现实后调用
		onHDShow:function(){},
		//当大图被点击后调用
		onHDClick:function(){},
		//当不存在大图的头像被点击后调用
		onNoHDClick:function(){},
		debug : false
	},
	
	css = ['<style type="text/css" id="portrait-wall-css">',
	       		'.portrait-wall{position: relative;}',
	       		'.portrait-wall .item{background-color:#EEE;position: absolute;text-align: center;}',
	       		'.portrait-wall .cur{}',
	       '</style>'].join('\n'),
	       
	prv_cur = cur = 1, v_matrix = matrix = [],
	
	// debug 相关统计参数
	position_change_count = animate_count = 0;

	var getCurMatrix = function(rows, columns, cur) {
		var next = cur + 1;
		var down = cur + columns;
		var corner = down + 1;
		if (cur != rows * columns) {
			if (next != 1 && next % columns == 1) {
				next = cur - 1;
				corner = down - 1;
			}
			if (down != 1 && down > rows * columns) {
				down = cur - columns;
				corner = down + 1;
			}
		} else {
			next = cur - 1;
			down = cur - columns;
			corner = down - 1;
		}

		return [ cur, next, down, corner ];
	};

	/**
	 * 
	 * 根据当前给定位置数获得行列值，如：cur = 1,返回 [1,1]
	 */
	var getPosition = function(cur, columns, rows) {
		var row = parseInt((cur - 1) / columns + 1);
		var col = parseInt((cur % columns)) || columns;
		return [ row, col ];
	};

	var getValueMatrix = function(cur, columns, rows) {
		var v_matrix = [];
		var matrix = getCurMatrix(rows, columns, cur);
		var got_cur = false;
		var count = 1;
		for ( var i = 1; i <= rows * columns; i++) {
			if (matrix.indexOf(i) == -1) {
				v_matrix[i] = count++;
			} else {
				v_matrix[i] = cur;
				if (!got_cur) {
					got_cur = true;
					count++;
				}
			}
		}
		return v_matrix;
	};

	var getTransferVMatrix = function(cur, columns, rows, org_cur) {
		var matrix = getCurMatrix(rows, columns, cur);
		var v_matrix = [];
		var count = 1;
		for ( var i = 1; i <= rows * columns; i++) {
			if (matrix.indexOf(i) == -1) {
				if (count == org_cur) {
					count++;
				}
				v_matrix[i] = count++;
			} else {
				v_matrix[i] = org_cur;
			}
		}
		return v_matrix;
	};

	var transfer = function(prev_cur, v_matrix) {
		var cur = getIndexByValue(tv_matrix, 6);
		return getTransferVMatrix(cur, options.columns, options.rows, prev_cur);
	};

	/*
	 * 值与位置数转换
	 */
	var getIndexByValue = function(v_matrix, value) {
		for ( var i in v_matrix) {
			if (value == v_matrix[i])
				return (+i);
		}
		console.error("error value:" + value + " in " + v_matrix.join(","));
	};

	var getValueByIndex = function(v_matrix, index) {
		return v_matrix[index];
	};

	var onItemClicked = function(event) {
		var item = event.srcElement;
		if (item.className && item.className.indexOf('item') != -1) {
			var hashd = +$(item).data('hashd');
			if(!hashd){
				if(typeof options.onNoHDClick === 'function'){
					options.onNoHDClick.call(this,item,options);
				}
				return;
			}
			prv_cur = cur;
			cur = +$(item).data("value");
			if (prv_cur == cur){
				if(typeof options.onHDClick === 'function'){
					options.onHDClick.call(this,item,options);
				}
				return;
			}
			var prev_cur = getIndexByValue(v_matrix, cur);
			v_matrix = getTransferVMatrix(prev_cur, options.columns, options.rows, cur);
			render(cur, v_matrix, options.rows, options.columns, true);
		}
	}

	var getRandomImage = function(images) {
		return images && images.length ? images[Math.floor(Math.random() * images.length)] : "";
	}

	/**
	 * 优化性能：减少位置不变item的动画。
	 */
	var isSamePosition = function(item, index) {
		if (options.debug) {
			try {
				var pos1 = getPosition(index, options.columns, options.rows);
				var pos2 = [ +item.position().top / options.width + 1, +item.position().left / options.width + 1 ];
				if (pos1.join(':') != pos2.join(':')) {
					position_change_count++;
					console.error('position change count:' + position_change_count + '\n' + pos1.join(':') + ' --> ' + pos2.join(':'));
					console.error(item);
				} else {
					console.log(pos1.join(':') + ' --> ' + pos2.join(':'));
				}
			} catch (e) {
			}
		}
		return false && +item.data('index') == index;
	};

	var render = function(cur, v_matrix, rows, columns, animate) {
		var wrapper = selector.css({
			'width' : options.width * columns,
			'height' : options.height * rows
		});
		var count = 0, cur_index = 0;
		var start = new Date().getTime();
		if (animate) {
			$('.cur').removeClass("cur");
		}
		var total_count = options.images.length+1;
		for ( var i = 1; i <= total_count; i++) {
			var value = v_matrix[i];
			var item = selector.find('#'+'item' + value);
			var position = getPosition(i, columns, rows);
			if (cur == value) {
				if (!animate) {
					if ($('.cur').length == 0) {
						item.addClass("cur").css({
							'top' : (position[0] - 1) * options.height,
							'left' : (position[1] - 1) * options.width,
							'width' : options.width * 2,
							'height' : options.height * 2,
							'background-image' : 'url(' + options.images[count] + ')',
							'background-size' : options.width * 2 + 'px'
						}).attr({
							'id' : "item" + value,
							'data-value' : value,
							'data-index' : i,
							'data-img': options.images[count],
							'data-hd' : options.hdimages[count++]
						});
					}
				} else {
					if (cur_index == 0) {
						cur_index = i;
					}
				}
			} else {
				if (animate) {
					if (options.debug) {
						isSamePosition(item, i);
					}
					if (value == prv_cur) {
						var image = item.data('img');
						item.css({'background-image' : 'url(' + image + ')'}).animate({
							'top' : (position[0] - 1) * options.height,
							'left' : (position[1] - 1) * options.width,
							'width' : options.width,
							'height' : options.height,
							'background-size' : options.width + 'px'
						}, function() {
							animate_count++;
						});
					} else {
						var info = item.find('.info');
						info.animate({bottom:-info.eq(0).height()});
						item.animate({
							'top' : (position[0] - 1) * options.height,
							'left' : (position[1] - 1) * options.width
						}, function() {
							animate_count++;
						});
					}
				} else {
					item.css({
						'top' : (position[0] - 1) * options.height,
						'left' : (position[1] - 1) * options.width,
						'width' : options.width,
						'height' : options.height,
						'background-image' : 'url(' + options.images[count] + ')',
						'background-size' : options.width + 'px'
					}).attr({
						'id' : 'item' + value,
						'data-value' : value,
						'data-index' : i,
						'data-img' : options.images[count],
						'data-hd' : options.hdimages[count++]
					});
				}
			}
		}
		if (animate) {
			var position = getPosition(cur_index, columns, rows);
			var item = $('#item' + cur);
			var image = item.data('hd');
			var info = selector.find('.info');
			info.animate({bottom:-info.eq(0).height()});
			item.addClass('cur').css({'background-image' : 'url(' + image + ')'}).animate({
				top : (position[0] - 1) * options.height,
				left : (position[1] - 1) * options.width,
				width : options.width * 2,
				height : options.height * 2,
				'background-size' : options.width * 2 + 'px'
			}, function() {
				if(typeof options.onHDShow === 'function'){
					options.onHDShow.call(this,item,options);
				}
				if (options.debug) {
					alert(rows + '*' + columns + '(' + rows * columns + ') in :' + (new Date().getTime() - start) / 1000 + ' seconds' + '\n position change count:' + position_change_count + '\n animate count:' + animate_count);
					position_change_count = 0;
					animate_count = 0;
				}
			});
		}
		wrapper.unbind('click', onItemClicked).bind('click', onItemClicked);
	};

	var init = function() {
		v_matrix = getValueMatrix(prv_cur, options.columns, options.rows);
		render(prv_cur, v_matrix, options.rows, options.columns);
	};

	$.fn.portraitwall = function(opts) {
		$.extend(options, opts);
		$("#portrait-wall-css").remove();
		$("head").append(css);
		$("#portrait-wall-css").append(options.css.join('\n'));
		selector = this;
		init();
	};

})(jQuery);