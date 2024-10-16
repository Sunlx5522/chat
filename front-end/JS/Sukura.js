// 樱花特效
var stop, staticx;
var img = new Image(); // 创建一个新图片对象
img.src = "../SOURCEFILE/IMAGES/public/Sukura.png"; // 设置图片的路径

// Sakura 类，用于表示每个樱花对象
function Sakura(x, y, s, r, fn) {
    this.x = x; // 樱花的X坐标
    this.y = y; // 樱花的Y坐标
    this.s = s; // 樱花的缩放比例
    this.r = r; // 樱花的旋转角度
    this.fn = fn; // 樱花的运动函数
}

// 定义 Sakura 类的 draw 方法，负责绘制樱花
Sakura.prototype.draw = function (cxt) {
    cxt.save(); // 保存当前绘图状态
    var xc = 40 * this.s / 4; // 计算缩放后的宽度
    cxt.translate(this.x, this.y); // 将绘图上下文的原点移动到樱花的当前位置
    cxt.rotate(this.r); // 旋转绘图上下文
    cxt.drawImage(img, 0, 0, 40 * this.s, 40 * this.s); // 绘制樱花图片
    cxt.restore(); // 恢复之前保存的绘图状态
}

// 定义 Sakura 类的 update 方法，负责更新樱花的状态
Sakura.prototype.update = function () {
    this.x = this.fn.x(this.x, this.y); // 更新樱花的X坐标
    this.y = this.fn.y(this.y, this.y); // 更新樱花的Y坐标
    this.r = this.fn.r(this.r); // 更新樱花的旋转角度
    // 如果樱花超出屏幕范围，重新设置其位置和状态
    if (this.x > window.innerWidth || this.x < 0 || this.y > window.innerHeight || this.y < 0) {
        this.r = getRandom('fnr'); // 随机生成一个旋转角度
        // 随机决定樱花的生成位置和大小
        if (Math.random() > 0.4) {
            this.x = getRandom('x');
            this.y = 0;
            this.s = getRandom('s');
            this.r = getRandom('r');
        } else {
            this.x = window.innerWidth;
            this.y = getRandom('y');
            this.s = getRandom('s');
            this.r = getRandom('r');
        }
    }
}

// SakuraList 类，用于管理多个樱花对象
SakuraList = function () {
    this.list = []; // 用于存储樱花对象的数组
}

// 向列表中添加一个樱花对象
SakuraList.prototype.push = function (sakura) {
    this.list.push(sakura);
}

// 更新列表中所有樱花的状态
SakuraList.prototype.update = function () {
    for (var i = 0, len = this.list.length; i < len; i++) {
        this.list[i].update(); // 更新每个樱花对象
    }
}

// 绘制列表中所有的樱花
SakuraList.prototype.draw = function (cxt) {
    for (var i = 0, len = this.list.length; i < len; i++) {
        this.list[i].draw(cxt); // 绘制每个樱花对象
    }
}

// 获取列表中指定索引的樱花对象
SakuraList.prototype.get = function (i) {
    return this.list[i];
}

// 返回樱花列表的大小
SakuraList.prototype.size = function () {
    return this.list.length;
}

// 获取随机数或随机函数，用于生成随机位置、大小、旋转角度等
function getRandom(option) {
    var ret, random;
    switch (option) {
        case 'x':
            ret = Math.random() * window.innerWidth; // 随机生成X坐标
            break;
        case 'y':
            ret = Math.random() * window.innerHeight; // 随机生成Y坐标
            break;
        case 's':
            ret = Math.random(); // 随机生成缩放比例
            break;
        case 'r':
            ret = Math.random() * 6; // 随机生成旋转角度
            break;
        case 'fnx':
            random = -0.5 + Math.random() * 1; // 随机生成水平运动的速度
            ret = function (x, y) {
                return x + 0.5 * random - 1.7; // 定义水平运动函数
            };
            break;
        case 'fny':
            random = 1.5 + Math.random() * 0.7; // 随机生成垂直运动的速度
            ret = function (x, y) {
                return y + random; // 定义垂直运动函数
            };
            break;
        case 'fnr':
            random = Math.random() * 0.03; // 随机生成旋转速度
            ret = function (r) {
                return r + random; // 定义旋转运动函数
            };
            break;
    }
    return ret; // 返回生成的随机数或函数
}

// 开始樱花飘落动画的函数
function startSakura() {
    requestAnimationFrame = window.requestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        window.oRequestAnimationFrame; // 兼容不同浏览器的动画帧函数

    var canvas = document.createElement('canvas'), // 创建画布元素
        cxt;
    staticx = true;
    canvas.height = window.innerHeight; // 设置画布高度
    canvas.width = window.innerWidth; // 设置画布宽度
    canvas.setAttribute('style', 'position: fixed;left: 0;top: 0;pointer-events: none;'); // 设置画布样式
    canvas.setAttribute('id', 'canvas_sakura'); // 设置画布ID
    document.getElementsByTagName('body')[0].appendChild(canvas); // 将画布添加到页面中
    cxt = canvas.getContext('2d'); // 获取绘图上下文
    var sakuraList = new SakuraList(); // 创建一个樱花列表

    // 初始化樱花对象并添加到列表中
    for (var i = 0; i < 50; i++) {
        var sakura, randomX, randomY, randomS, randomR, randomFnx, randomFny;
        randomX = getRandom('x'); // 随机生成X坐标
        randomY = getRandom('y'); // 随机生成Y坐标
        randomR = getRandom('r'); // 随机生成旋转角度
        randomS = getRandom('s'); // 随机生成缩放比例
        randomFnx = getRandom('fnx'); // 随机生成水平运动函数
        randomFny = getRandom('fny'); // 随机生成垂直运动函数
        randomFnR = getRandom('fnr'); // 随机生成旋转函数
        sakura = new Sakura(randomX, randomY, randomS, randomR, {
            x: randomFnx,
            y: randomFny,
            r: randomFnR
        });
        sakura.draw(cxt); // 绘制樱花
        sakuraList.push(sakura); // 将樱花添加到列表
    }

    // 启动动画帧更新
    stop = requestAnimationFrame(function () {
        cxt.clearRect(0, 0, canvas.width, canvas.height); // 清除画布
        sakuraList.update(); // 更新樱花状态
        sakuraList.draw(cxt); // 绘制樱花
        stop = requestAnimationFrame(arguments.callee); // 递归调用下一帧
    })
}

// 窗口大小变化时调整画布大小
window.onresize = function () {
    var canvasSnow = document.getElementById('canvas_snow');
    canvasSnow.width = window.innerWidth; // 更新画布宽度
    canvasSnow.height = window.innerHeight; // 更新画布高度
}

// 图片加载完成后启动樱花效果
img.onload = function () {
    startSakura();
}

// 停止或重新启动樱花动画的函数
function stopp() {
    if (staticx) {
        var child = document.getElementById("canvas_sakura");
        child.parentNode.removeChild(child); // 移除画布
        window.cancelAnimationFrame(stop); // 停止动画
        staticx = false;
    } else {
        startSakura(); // 重新启动樱花效果
    }
}
