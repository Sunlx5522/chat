var account = sessionStorage.getItem('account'); // 从sessionStorage中获取字符串

// 创建WebSocket连接，URL为后端配置的路径
const socket = new WebSocket('ws://localhost:8080/ws'); // 指定WebSocket的连接地址

// 当WebSocket连接成功时触发
socket.onopen = function () { // 定义连接成功的回调函数
    console.log('WebSocket connection established'); // 打印连接成功信息
    // 发送初始消息到服务器
    const messages = [
        'login',
        account
    ];
    // 用换行符连接消息
    const multiLineMessage = messages.join('[b1565ef8ea49b3b3959db8c5487229ea]'); // 连接成一条多行消息
    // 发送多行消息
    socket.send(multiLineMessage); // 向服务器发送消息
};

// 接收来自服务器的消息
socket.onmessage = function (event) { // 定义接收消息的回调函数
    const payload = event.data; // 获取消息的负载
    const blocks = payload.split('[b1565ef8ea49b3b3959db8c5487229ea]'); // 拆分成字符串数组 
    const command = blocks[0]; // 第一个消息
    if (command == "loginSuccessfully") {
        const receiverAccount = blocks[1]; // 第二个消息
        const receiverUsername = blocks[2]; // 第三个消息
        const receiverEmail = blocks[3]; // 第四个消息
        const receiverTelephone = blocks[4]; // 第五个消息
        alert("欢迎回来：" + receiverAccount + "\n" + "昵称：" + receiverUsername + "\n" + "电子邮箱：" + receiverEmail + "\n" + "电话号码：" + receiverTelephone);
    }
};

// 当WebSocket连接关闭时触发
socket.onclose = function () { // 定义连接关闭的回调函数
    alert("链接已断开"); // 弹出提示框
    window.location.href = '../HTML/index.html';
};

// 当WebSocket连接发生错误时触发
socket.onerror = function (error) { // 定义错误处理的回调函数
    alert("WebSocket连接失败，请检查网络连接！"); // 弹出提示框
    window.location.href = '../HTML/index.html'; // 可选：跳转到首页
};

document.addEventListener("DOMContentLoaded", function () {
    const contactList = document.getElementById("contactList");
    const messages = document.getElementById("messages");
    const messageInput = document.getElementById("messageInput");
    const sendButton = document.getElementById("sendButton");
    const menuButton = document.getElementById("menuButton");
    const exitButton = document.getElementById("exitButton");
    const dropdownContent = document.getElementById('dropdownContent');

    // 示例联系人
    const contacts = ["Alice", "Bob", "Charlie"];
    contacts.forEach(contact => {
        const contactItem = document.createElement("div");
        contactItem.textContent = contact;
        contactList.appendChild(contactItem);
    });

    // 发送消息
    sendButton.addEventListener("click", function () {
        const message = messageInput.value.trim();
        if (message) {
            const messageBubble = document.createElement("div");
            messageBubble.textContent = message;
            messages.appendChild(messageBubble);
            messageInput.value = ""; // 清空输入框
            messages.scrollTop = messages.scrollHeight; // 滚动到最新消息
        }
    });

    // 退出按钮点击事件
    exitButton.addEventListener("click", function () {
        socket.close();
    });

    document.getElementById("menuButton").addEventListener("click", function () {
        const dropdown = document.getElementById("dropdownContent");
        dropdown.style.display = dropdown.style.display === "block" ? "none" : "block"; // 切换显示状态
    });

    // 处理下拉菜单项的点击事件
    document.getElementById("feature1").addEventListener("click", function () {
        alert("功能 1 被点击"); // 待添加
        document.getElementById("dropdownContent").style.display = "none"; // 点击后隐藏下拉菜单
    });

    document.getElementById("feature2").addEventListener("click", function () {
        alert("功能 2 被点击"); // 待添加
        document.getElementById("dropdownContent").style.display = "none";
    });

    document.getElementById("feature3").addEventListener("click", function () {
        alert("功能 3 被点击"); // 待添加
        document.getElementById("dropdownContent").style.display = "none";
    });

});