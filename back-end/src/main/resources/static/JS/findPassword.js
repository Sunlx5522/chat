// findPassword.js

// 获取输入框元素
var account = document.getElementById('account');  // 获取账号输入框的元素
var email = document.getElementById('email');  // 获取邮箱输入框的元素
var phoneNumber = document.getElementById('phoneNumber');  // 获取电话号码输入框的元素

var findPasswordForm = document.getElementById('findPasswordForm');  // 获取找回密码表单的元素

// 淡入特效
window.onload = function () {
    if (findPasswordForm) {  // 如果找回密码表单元素存在
        findPasswordForm.classList.add('show');  // 为表单添加 'show' 类，触发 CSS 特效
    }
};

// 添加监听事件
// 为账号输入框添加事件监听
account.oninvalid = function () {
    this.setCustomValidity('请输入账号');  // 设置自定义的无效提示信息
};
account.oninput = function () {
    this.setCustomValidity('');  // 当用户开始输入时，清除无效提示信息
};

// 为邮箱输入框添加事件监听
email.oninvalid = function () {
    this.setCustomValidity('请输入邮箱');  // 设置自定义的无效提示信息
};
email.oninput = function () {
    this.setCustomValidity('');  // 当用户开始输入时，清除无效提示信息
};

// 为电话号码输入框添加事件监听
phoneNumber.oninvalid = function () {
    this.setCustomValidity('请输入电话号码');  // 设置自定义的无效提示信息
};
phoneNumber.oninput = function () {
    this.setCustomValidity('');  // 当用户开始输入时，清除无效提示信息
};

// 返回按钮的点击事件监听器
returnBackButton.addEventListener('click', () => {
    window.location.href = '../HTML/index.html';  // 点击返回按钮后，跳转到首页
});

// 为账号输入框添加输入事件监听器，限制只能输入最多20位数字
account.addEventListener('input', function () {
    this.value = this.value.replace(/\D/g, '');  // 仅保留数字字符，移除其他字符
    if (this.value.length > 20) {  // 如果输入长度超过20位
        this.value = this.value.slice(0, 20);  // 截取前20个字符
    }
});

// 限制输入邮箱不允许出现尖括号，长度限制为50个字符
email.addEventListener('input', function () {
    this.value = this.value.replace(/[^a-zA-Z0-9_`~!@#$%^&*()\-=+\[\]{}|;:'",./?\\]/g, '');  // 仅允许指定字符
    if (this.value.length > 50) {  // 如果输入长度超过50个字符
        this.value = this.value.slice(0, 50);  // 截取前50个字符
    }
});

// 限制输入电话号码不允许出现尖括号，长度限制为20个字符
phoneNumber.addEventListener('input', function () {
    this.value = this.value.replace(/[^a-zA-Z0-9_`~!@#$%^&*()\-=+\[\]{}|;:'",./?\\]/g, '');  // 仅允许指定字符
    if (this.value.length > 20) {  // 如果输入长度超过20个字符
        this.value = this.value.slice(0, 20);  // 截取前20个字符
    }
});

// oninvalid事件：当输入框的值不符合验证条件时触发。使用setCustomValidity()方法设置自定义的提示信息。
// oninput事件：当用户在输入框中输入内容时触发，清除之前的提示信息。

// 表单提交事件监听器
document.getElementById('findPasswordForm').addEventListener('submit', function (event) {
    event.preventDefault();  // 阻止表单的默认提交行为，防止页面刷新或跳转

    const account = document.getElementById('account').value;  // 获取用户输入的账号
    const email = document.getElementById('email').value;  // 获取用户输入的邮箱
    const phoneNumber = document.getElementById('phoneNumber').value;  // 获取用户输入的电话号码

    // 构建要发送给后端的请求数据对象
    const data = {
        account: account,  // 账号字段
        email: email,  // 邮箱字段
        phoneNumber: phoneNumber  // 电话号码字段
    };

    // 使用 Fetch API 向后端发送异步请求
    fetch('/api/findPassword', {  // 后端找回密码接口的URL
        method: 'POST',  // 请求方法为 POST，向服务器提交数据
        headers: {
            'Content-Type': 'application/json'  // 设置请求头，指定请求体格式为 JSON
        },
        body: JSON.stringify(data)  // 将请求数据对象转换为 JSON 字符串
    })
    .then(response => response.text())  // 将服务器返回的响应转换为文本格式
    .then(result => {
        if (result == "null") {  // 如果账号不存在
            var title = "账号不存在";
            Swal.fire({
                title: title,
                icon: 'error',  // 其他选项：'error', 'warning', 'info', 'question'
                confirmButtonText: '确定',
            });
        } else if (result == "error") {  // 如果用户提供的信息有误
            var title = "您提供的信息有误";
            Swal.fire({
                title: title,
                icon: 'error',  // 其他选项：'error', 'warning', 'info', 'question'
                confirmButtonText: '确定',
            });
        } else {  // 如果找回密码成功
            var title = "找回成功";
            var text = '您的密码：'+ result;
            Swal.fire({
                title: title,
                html: text,
                icon: 'success',  // 其他选项：'error', 'warning', 'info', 'question'
                confirmButtonText: '确定'
            });
        }
    })
    .catch(error => {
        console.error('Error:', error);  // 在控制台输出错误信息
        var title = "网络超时，请重试。";
            Swal.fire({
                title: title,
                icon: 'error',  // 其他选项：'error', 'warning', 'info', 'question'
                confirmButtonText: '确定',
            });
    });
});
