// script.js

// 获取输入框元素
var accountInput = document.getElementById('account');  // 获取账号输入框的元素
var passwordInput = document.getElementById('password');  // 获取密码输入框的元素

var loginForm = document.getElementById('loginForm');  // 获取登录表单元素
var findPasswordButton = document.getElementById('findPasswordButton');  // 获取找回密码按钮元素
var registerButton = document.getElementById('registerButton');  // 获取注册按钮元素

// 淡入特效
window.onload = function () {
    if (loginForm) {
        loginForm.classList.add('show');
        console.log('测试版本号0');
    }
};

// 添加监听事件
// 为账号输入框添加事件监听
accountInput.oninvalid = function () {
    this.setCustomValidity('请输入账号');  // 设置自定义的无效提示信息
};
accountInput.oninput = function () {
    this.setCustomValidity('');  // 清除自定义的无效提示信息
};

// 为密码输入框添加事件监听
passwordInput.oninvalid = function () {
    this.setCustomValidity('请输入密码');  // 设置自定义的无效提示信息
};
passwordInput.oninput = function () {
    this.setCustomValidity('');  // 清除自定义的无效提示信息
};

// 添加点击事件
// 找回密码按钮的点击事件
findPasswordButton.addEventListener('click', () => {
    window.location.href = '../HTML/findPassword.html';  // 跳转到找回密码页面
});

// 注册按钮的点击事件
registerButton.addEventListener('click', () => {
    window.location.href = '../HTML/signUp.html';  // 跳转到注册页面
});

// 为账号输入框添加输入事件监听器，限制只能输入最多20位数字
accountInput.addEventListener('input', function () {
    this.value = this.value.replace(/\D/g, '');  // 仅保留数字字符，移除其他字符
    if (this.value.length > 20) {  // 如果输入超过20位
        this.value = this.value.slice(0, 20);  // 截取前20个字符
    }
});

// 为密码输入框添加输入事件监听器，限制只能输入指定的字符
passwordInput.addEventListener('input', function () {
    this.value = this.value.replace(/[^a-zA-Z0-9_`~!@#$%^&*()\-=+\[\]{}|;:'",./?\\]/g, '');  // 仅允许特定字符 绝对不允许出现尖括号
    if (this.value.length > 20) {  // 如果输入超过20位
        this.value = this.value.slice(0, 20);  // 截取前20个字符
    }
});

// 表单提交事件监听器
document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault();  // 阻止表单的默认提交行为

    const account = document.getElementById('account').value;  // 获取账号输入框中的值
    const password = document.getElementById('password').value;  // 获取密码输入框中的值

    // 构建要发送的请求数据
    const data = {
        account: account,   // 用户输入的账号
        password: password  // 用户输入的密码
    };

    // 使用 Fetch API 向服务器发送登录请求
    fetch('/api/login', {  // 登录接口的URL
        method: 'POST',  // POST 请求方法
        headers: {
            'Content-Type': 'application/json'  // 设置请求头，指定请求体的格式为 JSON
        },
        body: JSON.stringify(data)  // 将数据对象转换为 JSON 字符串
    })
    .then(response => response.text())  // 将服务器响应转换为文本格式
    .then(result => {
        if (result == "yes") {  // 如果登录成功
            sessionStorage.setItem('account', account);  // 使用sessionStorage存储账号
            var title = "登录成功";
            Swal.fire({
                title: title,
                icon: 'success',  // 其他选项：'error', 'warning', 'info', 'question'
                confirmButtonText: '确定'
        }).then((result) => {
            if (result.isConfirmed) {
                // 用户点击了“确定”按钮，执行页面跳转
                window.location.href = '../HTML/welcome.html';  // 跳转到欢迎页面
            }
        });
        } else if (result == "repeat") {  // 如果账号已在别处登录
            var title = "账号已在别处登录";
            var text = "若不是你，请尽快修改密码";
            Swal.fire({
                title: title,
                text: text,
                icon: 'error',  // 其他选项：'error', 'warning', 'info', 'question'
                confirmButtonText: '确定'
            });
        }else if (result == "noAccount"){
            var title = "此账号不存在";
            Swal.fire({
                title: title,
                icon: 'error',  // 其他选项：'error', 'warning', 'info', 'question'
                confirmButtonText: '确定',
            });
        }else if (result == "noPassword"){
            var title = "密码错误";
            Swal.fire({
                title: title,
                icon: 'error',  // 其他选项：'error', 'warning', 'info', 'question'
                confirmButtonText: '确定',
            });
        }else {
            var title = "Warning";
            var text = result;
            Swal.fire({
                title: title,
                html: text,
                icon: 'warning',  // 其他选项：'error', 'warning', 'info', 'question'
                confirmButtonText: '确定'
            });
        }
    })
    .catch(error => {
        console.error('Error:-------------------------', error);  // 在控制台输出错误信息
        var title = "网络超时，请重试";
            Swal.fire({
                title: title,
                icon: 'error',  // 其他选项：'error', 'warning', 'info', 'question'
                confirmButtonText: '确定'
            });
    });
});
