# 原生JS实现扫雷

---
### 效果展示：   
[https://hyung7.github.io/MineSweeping/](https://hyung7.github.io/MineSweeping/)

---
### 大概思路：
点击任意小方块开始游戏，开启定时器。左击小方块打开（插旗和问号的小方块不能打开），如果该小方块不为雷且周围雷数不为0则更改小方块样式，显示周围雷数，如果该小方块不为雷且周围雷数为0则调用打开周围小方块，如果该小方块为雷则游戏结束，翻开所有雷和旗，并更改样式。右击小方块插旗/问号/取消旗和问号，每插一个旗雷数量减一，直至为0。每打开一个小方块判断一下游戏是否成功，如果剩余未打开小方块数量为10则游戏成功。点击笑脸则重新开始游戏。

>待完善：  
可选择难度（初级、中级、高级），难度不同，小方块和雷的数量也不同。

在CSS中引入自定义字体，用来显示剩余雷的数量和时间（IE8 以及更早的版本不支持）：   
```
@font-face{
  font-family: '字体名称'; 
  src: url('文件路径');
}
```
例如：  
```
@font-face{
  font-family: "quiveit";
  src: url("./font/quiveit.ttf");
}
```

---
### 详细代码：
#### 一、	变量声明：
```
var game = null, // game的实例
  mine = null; // mine的实例
var tr = [], // 行
  td = []; // 列
```
#### 二、	Square构造函数
##### 1.	创建构造函数Square，用于创建小方块
```
function Square(tag) {
  this.isMine = false; // 是否是雷
  this.state = "normal"; // 小方块状态（normal:正常，flag:插旗，ask:问号, open:打开）
  this.count = 0; // 周围雷数量
  this.ele = document.createElement(tag); // Element元素
  this.ele.className = "normal"; // 类名
}
```
##### 2.	在Square的原型上创建changeState方法，用于改变小方块样式和状态
```
Square.prototype.changeStyle = function () {
  if (this.state === "normal") { // 如果空白，则插旗
    this.state = "flag"; // 更新状态
    this.ele.className = "flag"; // 改变小方块样式
    game.setCount(-1); // 修改雷的数量
  }else if (this.state === "flag") { // 如果是旗，则改为问号
    this.state = "ask";
    this.ele.className = "ask";
    game.setCount(1);
  } else if (this.state === "ask") { // 如果是问号，则去掉
    this.state = "normal";
    this.ele.className = "normal";
  }
}
```
#### 三、	Mine构造函数
##### 1.	创建Mine构造函数，用于存放雷信息
```
function Mine() {
  this.notOpen = 81; // 未打开的小方块数量
}
```
##### 2.	在Mine的原型上创建init方法，用于初始化雷数据
```
Mine.prototype.init = function () {
  // 插入9*9的表格
  var fragment = document.createDocumentFragment(); // 创建文档碎片
  for (var i = 0; i < 9; i++) {
    tr[i] = new Square("tr", table);
    td[i] = [];
    for (var j = 0; j < 9; j++) {
      td[i][j] = new Square("td", tr[i].ele);
      tr[i].ele.appendChild(td[i][j].ele);
    }
    fragment.appendChild(tr[i].ele); // 把小方块插入文档碎片
  }
  table.appendChild(fragment); // 把文档碎片插入table
  this.setMine(); // 设置雷
}
```
##### 3.	在Mine的原型上创建setMine方法，用于设置10个不重复的雷，并将雷周围小方块的count值+1
```
Mine.prototype.setMine = function () {
  var pos = []; // 所有小方块坐标
  // 生成9*9个坐标数组, [0,0] - [8,8]
  for (var i = 0; i < 9; i++) {
    for (var j = 0; j < 9; j++) {
      pos[pos.length] = [i, j];
    }
  }
  // 打乱pos中坐标数组的排序
  pos.sort(function () {
    return Math.random() - 0.5;
  })
  // 截取前十个坐标数组
  var mines = pos.slice(0, 10);
  // 遍历10个坐标数组
  mines.forEach(function (m) {
    td[m[0]][m[1]].isMine = true; // 将在此坐标的小方块的mine值改为true
    var around = [];
    // 找到该小方块周围的小方块
    around = mine.getAround(m[0], m[1]);
    // 将周围小方块的count值加一
    around.forEach(function (square) {
      td[square[0]][square[1]].count++;
    })
  })
}
```
##### 4.	在Mine的原型上创建getAround方法，用于找到某方块周围的小方块
```
Mine.prototype.getAround = function (x, y) {
  var square = [];
  for (var i = x - 1; i <= x + 1; i++) {
    for (var j = y - 1; j <= y + 1; j++) {
      // 如果小方块坐标值在[0,0] - [8,8]并且没有打开，则push进square数组
      if (i >= 0 && i < 9 && j >= 0 && j < 9 && td[i][j].state !== "open") {
        square.push([i, j]);
      }
    }
  }
  return square;
}
```
##### 5.	在Mine的原型上创建isSuccess方法，用于判断游戏是否成功
```
Mine.prototype.isSuccess = function () {
  // 如果未打开的小方块数量等于10，则游戏成功
  if (this.notOpen === 10) {
    this.method.success();
  }
}
```
##### 6.	在Mine的原型上创建method对象，用于存放方法
```
Mine.prototype.method = {
  // 打开小方块
  open: function (x, y) {
    // 如果小方块状态不为open，则打开小方块
    if (this.state !== "open") {
      // 如果小方块是雷，则游戏结束，并更改小方块样式
      if (this.isMine) {
        this.ele.className = "open mine"; // 更改该小方块样式
        // 如果游戏状态为start（第一次打开雷），则游戏结束，并将该小方块背景颜色设置为红色
        if (game.state === "start") {
          this.ele.style.backgroundColor = "#FF0000";
          mine.method.fail();
        }
      } else if (game.state === "over" && this.state === "flag") { // 如果游戏状态为over且方块为状态为flag（旗插错了），则更改该小方块样式
        this.ele.className = "open error";
      } else {
        this.state = "open";// 更新小方块状态
        mine.notOpen--; // 未打开小方块数量-1
        mine.isSuccess(); // 判断是否通关
        this.ele.className = "open"; // 改变该小方块样式
        // 根据该小方块的count值（周围雷数量）设置text值和颜色
        switch (this.count) {
          // 如果count为0则打开周围小方块（扩散）
          case 0:
            var around = mine.getAround(x, y);
            around.forEach(function (square) {
              mine.method.open.call(td[square[0]][square[1]], square[0], square[1]);
            })
            break;
          case 1:
            this.ele.innerText = 1;
            this.ele.style.color = "#0000FF";
            break;
          case 2:
            this.ele.innerText = 2;
            this.ele.style.color = "#008000";
            break;
          case 3:
            this.ele.innerText = 3;
            this.ele.style.color = "#FF0000";
            break;
          case 4:
            this.ele.innerText = 4;
            this.ele.style.color = "#000080";
            break;
          case 5:
            this.ele.innerText = 5;
            this.ele.style.color = "#800000";
            break;
          case 6:
            this.ele.innerText = 6;
            this.ele.style.color = "#008080";
            break;
          case 7:
            this.ele.innerText = 7;
            this.ele.style.color = "#000000";
            break;
          case 8:
            this.ele.innerText = 8;
            this.ele.style.color = "#808080";
            break;
        }
      }
    }
  },
  // 失败
  fail: function () {
    game.over(); // 游戏结束
    face.style.backgroundImage = "url(./img/face_fail.png)"; // 更改笑脸样式为fail
    // 打开所有雷和旗
    for (var i = 0; i < 9; i++) {
      for (var j = 0; j < 9; j++) {
        if (td[i][j].isMine || td[i][j].state === "flag") {
          this.open.call(td[i][j]);
        }
      }
    }
  },
  // 成功
  success: function () {
    game.over(); // 游戏结束
    face.style.backgroundImage = "url(./img/face_success.png)"; // 更改笑脸样式为success
  }
}
```
#### 四、	Game构造函数
##### 1.	创建Game构造函数，用于存放游戏数据
```
function Game() {
  this.timer = null; // 定时器
  this.time = 0; // 时间
  this.count = 10; // 剩余雷数量
  this.state = "ready"; // 游戏状态（ready: 未开始, start: 游戏中, over: 游戏结束）
}
```
##### 2.	在Game的原型上创建init方法，用于初始化游戏数据
```
Game.prototype.init = function () {
  mine = new Mine(); // 实例化mine
  mine.init(); // 初始化mine数据
  count.innerText = "010"; // 雷数量设置为10
  time.innerText = "000"; // 时间设置为0
}
```
##### 3.	在Game的原型上创建setText方法，用于设置显示的雷数量和时间
```
Game.prototype.setText = function (ele, num) {
  if (num < 10) {
    ele.innerText = "00" + num; // 如果num是一位数，则在前加两个0,并转换为字符串
  } else if (num < 100) {
    ele.innerText = "0" + num; // 如果num是两位数，则在前加一个0,并转换为字符串
  } else {
    ele.innerText = "" + num; // 转换为字符串
  }
}
```
##### 4.	在Game的原型上创建start方法，开始游戏
```
Game.prototype.start = function () {
  this.state = "start"; // 游戏状态改为start
  // 设置定时器
  this.timer = setInterval(function () {
    // 如果时间小于999则+1
    if (game.time < 999) {
      game.time++;
    }
    // 修改显示时间
    game.setText(time, game.time);
  }, 1000)
}
```
##### 5.	在Game的原型上创建setCount方法，用于修改剩余雷数量
```
Game.prototype.setCount = function (figure) {
  this.count += figure; // 修改剩余雷数量
  // 如果剩余雷数量大于等于0，则修改显示雷数量
  if (this.count >= 0) {
    this.setText(count, this.count);
  }
}
```
##### 6.	在Game的原型上创建over方法，游戏结束
```
Game.prototype.over = function () {
  this.state = "over"; // 修改游戏状态为over
  clearInterval(this.timer); // 清除定时器
  for (var i = 0; i < 9; i++) {
    for (var j = 0; j < 9; j++) {
      if (td[i][j].ele.className === "normal" ) {
        td[i][j].ele.className = ""; // 通过改变小方块类名取消hover
      }
    }
  }
}
```
##### 7.	实例化game，初始化游戏数据
```
game = new Game(); // 实例化game
game.init(); // 初始化游戏数据
```
#### 五、	事件
##### 1.	获取DOM元素
```
var wrapper = document.getElementsByClassName("wrapper")[0];
var count = document.getElementsByClassName("count")[0];
var time = document.getElementsByClassName("time")[0];
```
##### 2.	阻止右键出菜单事件
```
wrapper.oncontextmenu = function () {
  return false;
}
```
##### 3.	小方块点击事件
```
var table = document.getElementsByTagName("table")[0];
table.onmousedown = function (e) {
  // 当游戏状态不为"over"时，点击事件有效
  if (game.state !== "over") {
    // 当游戏状态为"ready"时（第一次点击），游戏开始
    if (game.state === "ready") {
      game.start(); // 开始游戏
    }
    var x = e.target.parentElement.rowIndex; // 小方块的所在行
    var y = e.target.cellIndex; // 小方块的所在列
    // 点击鼠标左键打开小方块， 点击鼠标右键插旗/标问号
    if (e.button === 0 && td[x][y].state !== "open" && td[x][y].state !== "flag" && td[x][y].state !== "ask") {
      mine.method.open.call(td[x][y], x, y); // 打开小方块
    } else if (e.button === 2 && td[x][y].state !== "open") {
      td[x][y].changeStyle(); // 改变小方块样式
    }
  }
}
```
##### 4.	笑脸鼠标事件，按下鼠标时改变样式，松开时游戏重新开始
```
var face = document.getElementsByClassName("face")[0];
face.onmousedown = function () {
  face.className = "face click"; // 更改class
  face.onmouseup = function () {
    face.className = "face"; // 更改class
    face.style.backgroundImage = "url(./img/face_normal.png)"; // 将背景图片改为笑脸
    clearInterval(game.timer); // 清除定时器
    table.innerHTML = ""; // 清空table中的子元素
    game = new Game(); // 实例化game对象
    game.init(); // 初始化游戏信息
  }
}
```