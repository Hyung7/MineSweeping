var game = null,
  mine = null;

var tr = [],
  td = [];

var wrapper = document.getElementsByClassName("wrapper")[0];
var count = document.getElementsByClassName("count")[0];
var time = document.getElementsByClassName("time")[0];

// 阻止右键出菜单事件
wrapper.oncontextmenu = function () {
  return false;
}

// 小方块点击事件
var table = document.getElementsByTagName("table")[0];
table.onmousedown = function (e) {
  // 第一次点击小方块时，游戏开始
  if (game.state === "ready") {
    game.start();
  }
  if (game.state !== "over") {
    var x = e.target.parentElement.rowIndex;
    var y = e.target.cellIndex;
    // 点击鼠标左键打开小方块， 点击鼠标右键插旗/标问号
    if (e.button === 0 && td[x][y].state === "normal") {
      mine.method.open.call(td[x][y], x, y);
    } else if (e.button === 2 && td[x][y].state !== "open") {
      td[x][y].changeState();
    }
  }
}

// 笑脸鼠标事件，按下鼠标时改变样式，松开时游戏重新开始
var face = document.getElementsByClassName("face")[0];
face.onmousedown = function () {
  face.className = "face click";
  face.onmouseup = function () {
    face.className = "face";
    face.style = {};
    clearInterval(game.timer);
    table.innerHTML = "";
    game = new Game();
    game.init();
  }
}


function Square(tag) {
  this.mine = false; // 是否是雷
  this.flage = false; // 是否插旗
  this.count = 0; // 周围雷数量
  this.state = "normal"; // 状态（normal: 正常, flag: 插旗, ask: 问号, open: 打开）
  this.ele = document.createElement(tag);
  this.ele.className = "normal";
}
// 改变小方块状态
Square.prototype.changeState = function () {
  if (this.state === "normal") {
    this.state = "flag";
    this.ele.className = "flag";
    this.flag = true;
    game.setCount(-1);
  } else if (this.state === "flag") {
    this.state = "ask";
    this.ele.className = "ask"
    this.flag = false;
    game.setCount(1);
  } else if (this.state === "ask") {
    this.state = "normal";
    this.ele.className = "normal";
  }
}

function Mine() {
  this.mines = []; // 所有雷坐标
  this.notOpen = 81; // 未打开的小方块数量
}
// 初始化
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
    fragment.appendChild(tr[i].ele);
  }
  table.appendChild(fragment);
  this.setMine();
}
// 设置10个不重复的雷
Mine.prototype.setMine = function () {
  var mines = this.mines;
  for (var i = 0; i < 9; i++) {
    for (var j = 0; j < 9; j++) {
      mines[mines.length] = [i, j];
    }
  }
  mines.sort(function () {
    return Math.random() - 0.5;
  })
  mines = mines.slice(0, 10);
  mines.forEach(function (m) {
    td[m[0]][m[1]].mine = true;
    var around = [];
    around = mine.getAround(m[0], m[1]);
    around.forEach(function (square) {
      td[square[0]][square[1]].count++;
    })
  })
}
// 找到周围小方块
Mine.prototype.getAround = function (x, y) {
  var square = [];
  for (var i = x - 1; i <= x + 1; i++) {
    for (var j = y - 1; j <= y + 1; j++) {
      if (i >= 0 && i < 9 && j >= 0 && j < 9 && td[i][j].state !== "open") {
        square.push([i, j]);
      }
    }
  }
  return square;
}
// 是否通关
Mine.prototype.isSuccess = function () {
  if (this.notOpen === 10) {
    this.method.success();
  }
}
Mine.prototype.method = {
  // 打开小方块
  open: function (x, y) {
    if (this.state === "normal") {
      this.state = "open";
      if (this.mine) {
        this.ele.className = "open mine";
        if (game.state === "start") {
          this.ele.style.backgroundColor = "#FF0000";
          mine.method.fail();
        }
      } else if (game.state === "over" && this.flag) {
        this.ele.className = "open error";
      } else {
        mine.notOpen--;
        mine.isSuccess();
        this.flag = false;
        this.ele.className = "open";
        switch (this.count) {
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
    game.over();
    face.style.backgroundImage = "url(./img/face_fail.png)";
    // 打开所有雷和旗
    for (var i = 0; i < 9; i++) {
      for (var j = 0; j < 9; j++) {
        if (td[i][j].mine || td[i][j].flag) {
          this.open.call(td[i][j]);
        }
      }
    }
  },
  // 成功
  success: function () {
    game.over();
    face.style.backgroundImage = "url(./img/face_success.png)";
  }
}

function Game() {
  this.timer = null; // 定时器
  this.time = 0; // 时间
  this.count = 10; // 剩余雷数量
  this.state = "ready"; // 游戏状态（ready: 未开始, start: 游戏中, over: 游戏结束）
  // this.key = true; // timer锁
}
// 初始化
Game.prototype.init = function () {
  mine = new Mine();
  mine.init();
  count.innerText = "010";
  time.innerText = "000";
}
// 设置time和count的innerText
Game.prototype.setText = function (ele, num) {
  if (num < 10) {
    ele.innerText = "00" + num;
  } else if (num < 100) {
    ele.innerText = "0" + num;
  } else {
    ele.innerText = "" + num;
  }
}
// 开始游戏
Game.prototype.start = function () {
  this.state = "start";
  this.timer = setInterval(function () {
    game.time++;
    game.setText(time, game.time);
  }, 1000)
}
// 设置count的innerText
Game.prototype.setCount = function (figure) {
  this.count += figure;
  if (this.count >= 0) {
    this.setText(count, this.count);
  }
}
// 游戏结束
Game.prototype.over = function () {
  this.state = "over";
  clearInterval(this.timer);
  for (var i = 0; i < 9; i++) {
    for (var j = 0; j < 9; j++) {
      if (td[i][j].state === "normal") {
        td[i][j].ele.className = "";
      }
    }
  }
}

game = new Game();
game.init();
