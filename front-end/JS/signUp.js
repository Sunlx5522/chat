// signUp.js

// 获取输入框元素
var username = document.getElementById('username');
var signUpPassword = document.getElementById('signUpPassword');
var signUpPassword_confirm = document.getElementById('signUpPassword_confirm');
var email = document.getElementById('email');
var phoneNumber = document.getElementById('phoneNumber');


var signUpForm = document.getElementById('signUpForm');
// var findPasswordButton = document.getElementById('findPasswordButton');
// var registerButton = document.getElementById('registerButton');

document.addEventListener("DOMContentLoaded", function() {
    if (signUpForm) {
        signUpForm.classList.add('show'); // 添加类以触发特效
    }
});

// 为用户名输入框添加事件监听
username.oninvalid = function () {
    this.setCustomValidity('请输入用户名');
};
username.oninput = function () {
    this.setCustomValidity('');
};

// 为密码输入框添加事件监听
signUpPassword.oninvalid = function () {
    this.setCustomValidity('请输入密码');
};
signUpPassword.oninput = function () {
    this.setCustomValidity('');
};

// 为确认密码输入框添加事件监听
signUpPassword_confirm.oninvalid = function () {
    this.setCustomValidity('请确认密码');
};
signUpPassword_confirm.oninput = function () {
    this.setCustomValidity('');
};

// 为邮箱输入框添加事件监听
email.oninvalid = function () {
    this.setCustomValidity('请输入邮箱地址');
};
email.oninput = function () {
    this.setCustomValidity('');
};

// 为电话号码输入框添加事件监听
phoneNumber.oninvalid = function () {
    this.setCustomValidity('请输入电话号码');
};
phoneNumber.oninput = function () {
    this.setCustomValidity('');
};

//返回按钮
returnBackButton.addEventListener('click', () => {
    window.location.href = '../HTML/index.html';
});

//限制输入用户名不允许出现尖括号 长度加以限制
username.addEventListener('input', function () {
    if (this.value.length > 50) {
        this.value = this.value.slice(0, 50);
    }
});

//限制输入密码不允许出现尖括号 长度加以限制
signUpPassword.addEventListener('input', function () {
    this.value = this.value.replace(/[^a-zA-Z0-9_`~!@#$%^&*()\-=+\[\]{}|;:'",./?\\]/g, '');
    if (this.value.length > 20) {
        this.value = this.value.slice(0, 20);
    }
});

//限制输入确认密码不允许出现尖括号 长度加以限制
signUpPassword_confirm.addEventListener('input', function () {
    this.value = this.value.replace(/[^a-zA-Z0-9_`~!@#$%^&*()\-=+\[\]{}|;:'",./?\\]/g, '');
    if (this.value.length > 20) {
        this.value = this.value.slice(0, 20);
    }
});

//限制输入邮箱不允许出现尖括号 长度加以限制
email.addEventListener('input', function () {
    this.value = this.value.replace(/[^a-zA-Z0-9_`~!@#$%^&*()\-=+\[\]{}|;:'",./?\\]/g, '');
    if (this.value.length > 50) {
        this.value = this.value.slice(0, 50);
    }
});

//限制输入电话号码不允许出现尖括号 长度加以限制
phoneNumber.addEventListener('input', function () {
    this.value = this.value.replace(/[^a-zA-Z0-9_`~!@#$%^&*()\-=+\[\]{}|;:'",./?\\]/g, '');
    if (this.value.length > 20) {
        this.value = this.value.slice(0, 20);
    }
});

// oninvalid事件：当输入框的值不符合验证条件（如未填写必填字段）时触发。使用setCustomValidity()方法设置自定义的提示信息。
// oninput事件：当用户在输入框中输入内容时触发。将自定义的验证信息清空，避免提示信息在输入后仍然存在。

document.getElementById('signUpForm').addEventListener('submit', function (event) {
    // 为表单添加提交事件的监听器，当用户点击“注册”按钮时触发此函数

    event.preventDefault();
    // 阻止浏览器的默认提交行为，防止页面刷新或跳转
    const username = document.getElementById('username').value;
    // 获取输入框中用户填写的用户名
    const signUpPassword = document.getElementById('signUpPassword').value;
    // 获取输入框中用户填写的密码
    const signUpPassword_confirm = document.getElementById('signUpPassword_confirm').value;
    // 获取输入框中用户填写的确认密码
    const email = document.getElementById('email').value;
    // 获取输入框中用户填写的邮箱
    const phoneNumber = document.getElementById('phoneNumber').value;
    // 获取输入框中用户填写的电话号码

    if(signUpPassword != signUpPassword_confirm)
    {
        alert('两次输入密码不一致。'); // 弹出提示框，告知用户密码不一致
        return;
    }

    // 构建要发送给后端的请求数据对象
    const data = {
        username: username,   // 用户名字段，值为用户输入的账号
        signUpPassword: signUpPassword,  // 密码字段，值为用户输入的密码
        email: email,  //邮箱字段，值为用户输入的密码
        phoneNumber: phoneNumber  //电话号码字段，值为用户输入的密码
    };

    // 使用 Fetch API 向后端发送异步请求
    fetch('http://localhost:8080/api/signUp', { // 后端登录接口的完整 URL
        method: 'POST', // 请求方法为 POST，表示向服务器提交数据
        headers: {
            'Content-Type': 'application/json' // 设置请求头，指定请求体的格式为 JSON
        },
        body: JSON.stringify(data) // 将 JavaScript 对象转换为 JSON 字符串，作为请求体发送
    })
        .then(response => response.text()) // 将服务器返回的响应转换为文本格式
        .then(result => {
            // 处理服务器返回的结果
            alert('您的帐号：'+ result); // 弹出提示框，告知用户登录失败
        })
        .catch(error => {
            // 如果请求过程中发生错误，执行此代码块
            console.error('Error:', error); // 在控制台输出错误信息，便于调试
            alert('网络超时，请重试。'); // 弹出提示框，告知用户登录失败
        });
});