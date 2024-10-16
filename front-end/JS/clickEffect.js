// 鼠标点击特效函数
function clickEffect() {
    let balls = []; // 用于存储生成的小球对象
    let longPressed = false; // 标识是否长按
    let longPress; // 用于存储长按的定时器
    let multiplier = 0; // 用于控制长按情况下小球的增加效果
    let width, height; // 画布的宽度和高度
    let origin; // 小球的起始位置
    let normal; // 影响小球运动的一个系数
    let ctx; // canvas的上下文对象
    const colours = ["#F73859", "#14FFEC", "#00E0FF", "#FF99FE", "#FAF15D"]; // 颜色数组
    const canvas = document.createElement("canvas"); // 创建一个canvas元素
    document.body.appendChild(canvas); // 将canvas元素添加到页面中
    canvas.setAttribute("style", "width: 100%; height: 100%; top: 0; left: 0; z-index: 99999; position: fixed; pointer-events: none;"); // 设置canvas的样式
    const pointer = document.createElement("span"); // 创建一个span元素，用作指针
    pointer.classList.add("pointer"); // 为指针元素添加类
    document.body.appendChild(pointer); // 将指针元素添加到页面中

    if (canvas.getContext && window.addEventListener) {
        ctx = canvas.getContext("2d"); // 获取canvas的2D上下文
        updateSize(); // 初始化画布尺寸
        window.addEventListener('resize', updateSize, false); // 窗口调整大小时更新画布尺寸
        loop(); // 启动动画循环
        window.addEventListener("mousedown", function (e) {
            // 鼠标按下事件，生成随机数量的小球
            pushBalls(randBetween(10, 20), e.clientX, e.clientY);
            document.body.classList.add("is-pressed"); // 添加按下样式
            longPress = setTimeout(function () {
                document.body.classList.add("is-longpress"); // 添加长按样式
                longPressed = true; // 标记为长按状态
            }, 500); // 如果按下超过500毫秒，认为是长按
        }, false);
        window.addEventListener("mouseup", function (e) {
            // 鼠标松开事件
            clearInterval(longPress); // 清除长按的定时器
            if (longPressed == true) {
                document.body.classList.remove("is-longpress"); // 移除长按样式
                pushBalls(randBetween(50 + Math.ceil(multiplier), 100 + Math.ceil(multiplier)), e.clientX, e.clientY); // 根据长按时间生成更多的小球
                longPressed = false; // 重置长按标识
            }
            document.body.classList.remove("is-pressed"); // 移除按下样式
        }, false);
        window.addEventListener("mousemove", function (e) {
            // 鼠标移动事件，更新指针位置
            let x = e.clientX;
            let y = e.clientY;
            pointer.style.top = y + "px"; // 设置指针的顶部位置
            pointer.style.left = x + "px"; // 设置指针的左侧位置
        }, false);
    } else {
        console.log("canvas or addEventListener is unsupported!"); // 如果canvas或事件监听不支持，输出日志
    }

    // 更新画布尺寸
    function updateSize() {
        canvas.width = window.innerWidth * 2; // 设置画布的宽度为窗口宽度的两倍
        canvas.height = window.innerHeight * 2; // 设置画布的高度为窗口高度的两倍
        canvas.style.width = window.innerWidth + 'px'; // 设置画布样式的宽度
        canvas.style.height = window.innerHeight + 'px'; // 设置画布样式的高度
        ctx.scale(2, 2); // 缩放canvas以适应高分辨率
        width = (canvas.width = window.innerWidth); // 更新画布的实际宽度
        height = (canvas.height = window.innerHeight); // 更新画布的实际高度
        origin = {
            x: width / 2,
            y: height / 2
        }; // 设置小球的起点为画布中心
        normal = {
            x: width / 2,
            y: height / 2
        }; // 设置默认的运动参数
    }

    // 小球类
    class Ball {
        constructor(x = origin.x, y = origin.y) {
            this.x = x; // 小球的X坐标
            this.y = y; // 小球的Y坐标
            this.angle = Math.PI * 2 * Math.random(); // 随机生成小球的角度
            if (longPressed == true) {
                this.multiplier = randBetween(14 + multiplier, 15 + multiplier); // 如果是长按，使用更大的倍增器
            } else {
                this.multiplier = randBetween(6, 12); // 普通情况下的倍增器
            }
            this.vx = (this.multiplier + Math.random() * 0.5) * Math.cos(this.angle); // X方向速度
            this.vy = (this.multiplier + Math.random() * 0.5) * Math.sin(this.angle); // Y方向速度
            this.r = randBetween(8, 12) + 3 * Math.random(); // 小球的半径
            this.color = colours[Math.floor(Math.random() * colours.length)]; // 随机选取颜色
        }
        update() {
            this.x += this.vx - normal.x; // 更新X坐标
            this.y += this.vy - normal.y; // 更新Y坐标
            normal.x = -2 / window.innerWidth * Math.sin(this.angle); // 更新运动的系数X
            normal.y = -2 / window.innerHeight * Math.cos(this.angle); // 更新运动的系数Y
            this.r -= 0.3; // 小球半径逐渐缩小
            this.vx *= 0.9; // X方向速度逐渐减小
            this.vy *= 0.9; // Y方向速度逐渐减小
        }
    }

    // 生成小球的函数
    function pushBalls(count = 1, x = origin.x, y = origin.y) {
        for (let i = 0; i < count; i++) {
            balls.push(new Ball(x, y)); // 向数组中添加新的小球对象
        }
    }

    // 在给定范围内生成随机数
    function randBetween(min, max) {
        return Math.floor(Math.random() * max) + min;
    }

    // 主循环函数，控制动画效果
    function loop() {
        ctx.fillStyle = "rgba(255, 255, 255, 0)"; // 设置填充样式
        ctx.clearRect(0, 0, canvas.width, canvas.height); // 清除画布内容
        for (let i = 0; i < balls.length; i++) {
            let b = balls[i];
            if (b.r < 0) continue; // 如果小球半径小于0，跳过该小球
            ctx.fillStyle = b.color; // 设置小球颜色
            ctx.beginPath(); // 开始绘制小球路径
            ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2, false); // 绘制圆形小球
            ctx.fill(); // 填充小球颜色
            b.update(); // 更新小球的状态
        }
        if (longPressed == true) {
            multiplier += 0.2; // 如果是长按状态，增加倍增器
        } else if (!longPressed && multiplier >= 0) {
            multiplier -= 0.4; // 如果不是长按状态，减小倍增器
        }
        removeBall(); // 移除已经消失的小球
        requestAnimationFrame(loop); // 循环调用
    }

    // 移除离开画布的小球
    function removeBall() {
        for (let i = 0; i < balls.length; i++) {
            let b = balls[i];
            if (b.x + b.r < 0 || b.x - b.r > width || b.y + b.r < 0 || b.y - b.r > height || b.r < 0) {
                balls.splice(i, 1); // 如果小球超出画布或半径小于0，移除该小球
            }
        }
    }
}

// 调用点击特效函数
clickEffect();
