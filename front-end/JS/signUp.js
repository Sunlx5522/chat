// signUp.js

// 获取输入框元素
var username = document.getElementById('username');  // 获取用户名输入框元素
var signUpPassword = document.getElementById('signUpPassword');  // 获取密码输入框元素
var signUpPassword_confirm = document.getElementById('signUpPassword_confirm');  // 获取确认密码输入框元素
var email = document.getElementById('email');  // 获取邮箱输入框元素
var phoneNumber = document.getElementById('phoneNumber');  // 获取电话号码输入框元素

var signUpForm = document.getElementById('signUpForm');  // 获取注册表单元素

// 淡入特效
window.onload = function () {
    if (signUpForm) {  // 如果获取到表单元素
        signUpForm.classList.add('show');  // 为表单添加 'show' 类，触发 CSS 中的特效
    }
};

// 添加监听事件
// 为用户名输入框添加事件监听
username.oninvalid = function () {
    this.setCustomValidity('请输入用户名');  // 设置无效提示信息，当输入框为空或不符合要求时触发
};
username.oninput = function () {
    this.setCustomValidity('');  // 当用户开始输入时，清除之前的提示信息
};

// 为密码输入框添加事件监听
signUpPassword.oninvalid = function () {
    this.setCustomValidity('请输入密码');  // 设置无效提示信息，当输入框为空或不符合要求时触发
};
signUpPassword.oninput = function () {
    this.setCustomValidity('');  // 当用户开始输入时，清除之前的提示信息
};

// 为确认密码输入框添加事件监听
signUpPassword_confirm.oninvalid = function () {
    this.setCustomValidity('请确认密码');  // 设置无效提示信息，当输入框为空时触发
};
signUpPassword_confirm.oninput = function () {
    this.setCustomValidity('');  // 当用户开始输入时，清除之前的提示信息
};

// 为邮箱输入框添加事件监听
email.oninvalid = function () {
    this.setCustomValidity('请输入邮箱地址');  // 设置无效提示信息，当输入框为空时触发
};
email.oninput = function () {
    this.setCustomValidity('');  // 当用户开始输入时，清除之前的提示信息
};

// 为电话号码输入框添加事件监听
phoneNumber.oninvalid = function () {
    this.setCustomValidity('请输入电话号码');  // 设置无效提示信息，当输入框为空时触发
};
phoneNumber.oninput = function () {
    this.setCustomValidity('');  // 当用户开始输入时，清除之前的提示信息
};

// 返回按钮的点击事件
returnBackButton.addEventListener('click', () => {
    window.location.href = '../HTML/index.html';  // 点击按钮后，跳转到首页
});

// 限制用户名输入的长度，最多50个字符
username.addEventListener('input', function () {
    if (this.value.length > 50) {  // 如果用户名长度超过50个字符
        this.value = this.value.slice(0, 50);  // 截取前50个字符
    }
});

// 限制密码输入的长度，最多20个字符，不允许输入尖括号等特殊符号
signUpPassword.addEventListener('input', function () {
    this.value = this.value.replace(/[^a-zA-Z0-9_`~!@#$%^&*()\-=+\[\]{}|;:'",./?\\]/g, '');  // 仅允许指定字符
    if (this.value.length > 20) {  // 如果密码长度超过20个字符
        this.value = this.value.slice(0, 20);  // 截取前20个字符
    }
});

// 限制确认密码输入的长度和字符，同样不允许尖括号等特殊符号
signUpPassword_confirm.addEventListener('input', function () {
    this.value = this.value.replace(/[^a-zA-Z0-9_`~!@#$%^&*()\-=+\[\]{}|;:'",./?\\]/g, '');  // 仅允许指定字符
    if (this.value.length > 20) {  // 如果确认密码长度超过20个字符
        this.value = this.value.slice(0, 20);  // 截取前20个字符
    }
});

// 限制邮箱输入的长度，最多50个字符
email.addEventListener('input', function () {
    this.value = this.value.replace(/[^a-zA-Z0-9_`~!@#$%^&*()\-=+\[\]{}|;:'",./?\\]/g, '');  // 仅允许指定字符 绝对不允许出现尖括号
    if (this.value.length > 50) {  // 如果邮箱长度超过50个字符
        this.value = this.value.slice(0, 50);  // 截取前50个字符
    }
});

// 限制电话号码输入的长度，最多20个字符
phoneNumber.addEventListener('input', function () {
    this.value = this.value.replace(/[^a-zA-Z0-9_`~!@#$%^&*()\-=+\[\]{}|;:'",./?\\]/g, '');  // 仅允许指定字符 绝对不允许出现尖括号
    if (this.value.length > 20) {  // 如果电话号码长度超过20个字符
        this.value = this.value.slice(0, 20);  // 截取前20个字符
    }
});

// 表单提交事件监听器
document.getElementById('signUpForm').addEventListener('submit', function (event) {
    event.preventDefault();  // 阻止表单的默认提交行为，防止页面刷新或跳转

    const username = document.getElementById('username').value;  // 获取用户名输入框中的值
    const signUpPassword = document.getElementById('signUpPassword').value;  // 获取密码输入框中的值
    const signUpPassword_confirm = document.getElementById('signUpPassword_confirm').value;  // 获取确认密码输入框中的值
    const email = document.getElementById('email').value;  // 获取邮箱输入框中的值
    const phoneNumber = document.getElementById('phoneNumber').value;  // 获取电话号码输入框中的值

    if(signUpPassword != signUpPassword_confirm) {  // 检查两次输入的密码是否一致
        var title = "两次录入的密码不一致";
            Swal.fire({
                title: title,
                icon: 'error',  // 其他选项：'error', 'warning', 'info', 'question'
                confirmButtonText: '确定'
            });
        return;  // 阻止表单提交
    }

    // 构建要发送的请求数据对象
    const data = {
        username: username,   // 用户名字段
        signUpPassword: signUpPassword,  // 密码字段
        email: email,  // 邮箱字段
        phoneNumber: phoneNumber  // 电话号码字段
    };

    // 使用 Fetch API 向服务器发送异步请求
    fetch('http://localhost:8080/api/signUp', {  // 注册接口的完整 URL
        method: 'POST',  // 请求方法为 POST，表示向服务器提交数据
        headers: {
            'Content-Type': 'application/json'  // 设置请求头，指定请求体的格式为 JSON
        },
        body: JSON.stringify(data)  // 将 JavaScript 对象转换为 JSON 字符串，作为请求体发送
    })
    .then(response => response.text())  // 将服务器返回的响应转换为文本格式
    .then(result => {
        var title = "注册成功";
        var text = '您的帐号：'+ result;
        Swal.fire({
            title: title,
            html: text,
            icon: 'success',  // 其他选项：'error', 'warning', 'info', 'question'
            confirmButtonText: '确定'
        });
    })
    .catch(error => {
        console.error('Error:', error);  // 在控制台输出错误信息，便于调试
        var title = "网络超时，请重试。";
            Swal.fire({
                title: title,
                icon: 'error',  // 其他选项：'error', 'warning', 'info', 'question'
                confirmButtonText: '确定'
            });
    });
});