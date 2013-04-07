算法描述：

1、根据 位置数 确定占位矩阵 (√)

    1   2   3   4               *1  *2   3   4
    5   6   7   8    cur = 1    *5  *6   7   8
    9   10  11  12  --------->   9   10  11  12
    13  14  15  16	  matrix     13  14  15  16
    17  18  19  20               17  18  19  20
			
2、根据 位置数 确定 值矩阵 (√)

    1   2   3   4               *1  *1   2   3
    5   6   7   8    cur = 1    *1  *1   4   5
    9   10  11  12  --------->   6   7   8   9
    13  14  15  16	 v_matrix    10  11  12  13
    17  18  19  20               14  15  16  17

3、占位矩阵 与 值矩阵转换，然后再按转换后的位置重新计算显示位置:(...ing)
			转换步骤：
			(1) - 根据 v_matrix 矩阵获取对应新的 位置数：getIndexByValue
			(2) - 根据 位置数 获取 占位矩阵：getCurMatrix
			(3) - 根据 显示位置 重建占位矩阵

(1) cur = 15 --> cur = 18

    *1  *1   2   3     (1)      1   2   3   4		(2)      1    2   3   4 	   (3)      1    2    3   4 
    *1  *1   4   5   初始状态   5   6   7   8    cur = 18    5    6   7   8	    cur = 15    5    6    7   8
     6   7   8   9  --------->  9   10  11  12  ---------->  9    10  11  12  ----------->  9    10   11  12
     10  11  12  13             13  14  15  16	  matrix     13  *14 *15  16	v_matrix    13  *15  *15  14
     14 *15  16  17             17 *18  19  20               17  *18 *19  20                16  *15  *15  17

4、前一状态 到 当前状态的转换（?）

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