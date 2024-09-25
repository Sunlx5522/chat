// script.js

// 获取输入框元素
var accountInput = document.getElementById('account');
var passwordInput = document.getElementById('password');

var loginForm = document.getElementById('loginForm');
var findPasswordButton = document.getElementById('findPasswordButton');
var registerButton = document.getElementById('registerButton');

document.addEventListener("DOMContentLoaded", function () {
    if (loginForm) {
        loginForm.classList.add('show'); // 添加类以触发特效
    }
});


// 为账号输入框添加事件监听
accountInput.oninvalid = function () {
    this.setCustomValidity('请输入账号');
};
accountInput.oninput = function () {
    this.setCustomValidity('');
};

// 为密码输入框添加事件监听
passwordInput.oninvalid = function () {
    this.setCustomValidity('请输入密码');
};
passwordInput.oninput = function () {
    this.setCustomValidity('');
};

findPasswordButton.addEventListener('click', () => {
    window.location.href = '../HTML/findPassword.html';
});

registerButton.addEventListener('click', () => {
    window.location.href = '../HTML/signUp.html';
});

// 为账号输入框添加输入事件监听器，限制只能输入最多20位数字
accountInput.addEventListener('input', function () {
    // 使用正则表达式移除非数字字符
    this.value = this.value.replace(/\D/g, ''); // \D匹配非数字字符，替换为空
    // 限制输入长度为20位
    if (this.value.length > 20) {
        this.value = this.value.slice(0, 20); // 截取前20个字符
    }
});

// 为密码输入框添加输入事件监听器，限制只能输入指定的字符
passwordInput.addEventListener('input', function () {
    // 定义允许的字符的正则表达式
    // 允许的字符：数字、大小写字母、符号和下划线
    // [^...]表示匹配不在括号内的字符，将其替换为空
    this.value = this.value.replace(/[^a-zA-Z0-9_`~!@#$%^&*()\-=+\[\]{}|;:'",./?\\]/g, '');
    // 限制输入长度为20位
    if (this.value.length > 20) {
        this.value = this.value.slice(0, 20); // 截取前20个字符
    }
    // 解释：
    // - a-zA-Z0-9：匹配大小写字母和数字
    // - _：匹配下划线
    // - 后面的符号列表：匹配指定的符号 （不允许尖括号出现）
});

// oninvalid事件：当输入框的值不符合验证条件（如未填写必填字段）时触发。使用setCustomValidity()方法设置自定义的提示信息。
// oninput事件：当用户在输入框中输入内容时触发。将自定义的验证信息清空，避免提示信息在输入后仍然存在。

document.getElementById('loginForm').addEventListener('submit', function (event) {
    // 为表单添加提交事件的监听器，当用户点击“登录”按钮时触发此函数

    event.preventDefault();
    // 阻止浏览器的默认提交行为，防止页面刷新或跳转

    const account = document.getElementById('account').value;
    // 获取输入框中用户填写的账号
    const password = document.getElementById('password').value;
    // 获取输入框中用户填写的密码

    // 构建要发送给后端的请求数据对象
    const data = {
        account: account,   // 账号字段，值为用户输入的账号
        password: password  // 密码字段，值为用户输入的密码
    };

    // 使用 Fetch API 向后端发送异步请求
    fetch('http://localhost:8080/api/login', { // 后端登录接口的完整 URL
        method: 'POST', // 请求方法为 POST，表示向服务器提交数据
        headers: {
            'Content-Type': 'application/json' // 设置请求头，指定请求体的格式为 JSON
        },
        body: JSON.stringify(data) // 将 JavaScript 对象转换为 JSON 字符串，作为请求体发送
    })
        .then(response => response.text()) // 将服务器返回的响应转换为文本格式
        .then(result => {
            // 处理服务器返回的结果
            if (result == "yes") {
                alert("登录成功"); // 弹出提示框，显示服务器返回的消息（如登录成功或失败）
                sessionStorage.setItem('account', account); // 使用sessionStorage存储
                window.location.href = '../HTML/welcome.html';
            }
            else if (result == "repeat") {
                alert("账号已在别处登录"); // 弹出提示框，显示服务器返回的消息（如登录成功或失败）
            }
            else {
                alert("用户名或密码错误"); // 弹出提示框，显示服务器返回的消息（如登录成功或失败）
            }
        })
        .catch(error => {
            // 如果请求过程中发生错误，执行此代码块
            console.error('Error:', error); // 在控制台输出错误信息，便于调试
            alert('网络超时，请重试。'); // 弹出提示框，告知用户登录失败
        });
});


