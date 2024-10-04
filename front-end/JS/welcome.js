// welcome.js

const DELIMITER = '[b1565ef8ea49b3b3959db8c5487229ea]'; // 分隔符

var account = sessionStorage.getItem('account'); // 从sessionStorage中获取当前登录的账号

const messageChunks = {}; // 存储未完成的消息块，键为消息ID，值为消息内容

const timers = {}; // 存储每个消息ID的定时器

// 创建WebSocket连接，URL为后端配置的路径
const socket = new WebSocket('ws://localhost:8080/ws'); // 指定WebSocket的连接地址

// 保存消息到本地存储的函数
function saveMessageToLocal(senderAccount, receiverAccount, messageContent) {
    // key 是保存消息时使用的本地存储的键名
    // key 含义是当前帐号与对方的通讯信息 (我与对方)
    let key = `messages-${account}-${senderAccount}`;  // 别人发给当前用户的消息
    if (senderAccount == account) {  // 如果发送者是当前账号
        key = `messages-${account}-${receiverAccount}`;  // 当前用户发送给别人的消息
    }
    let messages = localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key)) : [];  // 从localStorage获取消息列表
    messages.push({ sender: senderAccount, message: messageContent });  // 将新消息添加到消息列表中 (包含发送者和所发送的信息)
    localStorage.setItem(key, JSON.stringify(messages));  // 保存更新后的消息列表到localStorage
    console.log("成功保存");  // 打印成功信息
}

function sendMessageToServer (message) {
    const chunkSize = 1024;  // 定义每个块的大小（字节数）
    let offset = 0;  // 初始化偏移量
    const messageId = account + Date.now().toString();  // 生成唯一的消息ID 账号 + 时间戳

    // 循环拆分并发送消息块
    while (offset < message.length) {
    // 提取消息的一部分作为块
    const chunk = message.slice(offset, offset + chunkSize);

    // 创建要发送的消息对象
    const chunkMessage = {
      type: 'chunk',  // 消息类型为块
      messageId: messageId,  // 唯一的消息ID，用于在接收端重组
      chunkData: chunk,  // 块的内容
      isLastChunk: (offset + chunkSize) >= message.length  // 是否为最后一个块
    };

    // 发送块到服务器
    socket.send(JSON.stringify(chunkMessage));  // 将消息对象序列化为JSON字符串并发送

    // 更新偏移量
    offset += chunkSize;
  }
}

// 当WebSocket连接成功时触发
socket.onopen = function () {  // 定义连接成功的回调函数
    console.log('WebSocket connection established');  // 打印连接成功信息

    // 发送初始消息到服务器
    const messages = ['login', account];  // 定义包含登录和账号信息的消息
    const multiLineMessage = messages.join(DELIMITER);  // 用特定的分隔符连接消息
    sendMessageToServer(multiLineMessage);  // 发送消息到服务器
};

// 处理消息
function process(fullMessage){
    const blocks = fullMessage.split(DELIMITER);  // 使用分隔符拆分消息
    const command = blocks[0];  // 获取消息的命令
    console.log("收到命令" + command);  // 打印收到的命令

    if (command == "loginSuccessfully") {  // 如果命令是登录成功
        const receiverAccount = blocks[1];  // 获取接收方账号
        const receiverUsername = blocks[2];  // 获取接收方昵称
        const receiverEmail = blocks[3];  // 获取接收方邮箱
        const receiverTelephone = blocks[4];  // 获取接收方电话
        alert("欢迎回来：" + receiverAccount + "\n" + "昵称：" + receiverUsername + "\n" + "电子邮箱：" + receiverEmail + "\n" + "电话号码：" + receiverTelephone);  // 显示欢迎信息
    } else if (command == "usersList") {  // 如果命令是用户列表
        const contactList = document.getElementById("contactList");  // 获取联系人列表的DOM元素
        contactList.innerHTML = "";  // 清空现有的联系人列表

        for (let i = 1; i < blocks.length; i += 2) {  // 遍历联系人列表
            const userAccount = blocks[i];  // 获取用户账号
            const userName = blocks[i + 1];  // 获取用户昵称
            const contactItem = document.createElement("div");  // 创建一个新的联系人元素

            if (userAccount != account) {  // 如果联系人不是当前用户
                contactItem.textContent = `账号：${userAccount}, 昵称：${userName}`;  // 设置联系人的文本内容
                contactItem.classList.add("contact-item");  // 添加样式类
                contactList.appendChild(contactItem);  // 将联系人元素添加到联系人列表

                // 为联系人添加点击事件
                contactItem.addEventListener("click", function () {
                    startConversation(userAccount, userName);  // 点击联系人后开始对话
                });
            }
        }
    } else if (command == "messageFrom") {  // 如果命令是收到消息
        console.log("收到消息");  // 打印收到消息信息
        const messages = document.getElementById("messages");  // 获取消息容器的DOM元素
        const senderAccount = blocks[1];  // 获取发送方账号
        const messageContent = blocks[2];  // 获取消息内容
        const messageBubble = document.createElement("div");  // 创建消息泡泡元素
        const messageWrapper = document.createElement("div");  // 创建消息包装器元素

        messageBubble.classList.add("bubble");  // 添加样式类
        messageWrapper.classList.add("message", "message-left");  // 对方消息靠左

        const receiverAccount = account;  // 当前接收消息的用户
        saveMessageToLocal(senderAccount, receiverAccount, messageContent);  // 调用函数保存消息到本地

        if (senderAccount == document.getElementById("contactAccount").textContent.split(': ')[1]) {  // 检查收到的消息是否属于当前会话
            messageBubble.textContent = `[${senderAccount}]: ${messageContent}`;  // 设置消息内容
            messageWrapper.appendChild(messageBubble);  // 将消息泡泡添加到消息包装器
            messages.appendChild(messageWrapper);  // 将消息包装器添加到消息容器
            messages.scrollTop = messages.scrollHeight;  // 滚动到最新消息
        } else {
            alert("你收到来自其他联系人的消息");  // 弹出提示框，提示收到其他联系人的消息
        }
    }
}

// 接收来自服务器的消息
socket.onmessage = function (event) {  // 定义接收消息的回调函数
    const payload = event.data;  // 获取消息的负载
    console.log("收到消息" + payload);  // 打印收到消息信息
    const json = JSON.parse(payload);  // 解析JSON
    if (json.type === 'chunk') {
        const messageId = json.messageId;  // 获取消息ID
        const chunkData = json.chunkData;  // 获取块数据
        const isLastChunk = json.isLastChunk;  // 是否为最后一个块
        // 如果是新消息，初始化存储和定时器
        if (!messageChunks[messageId]) {
            messageChunks[messageId] = '';  // 初始化消息内容
            // 设置定时器，超时后删除未完成的消息
            timers[messageId] = setTimeout(() => {
            delete messageChunks[messageId];  // 删除未完成的消息
            delete timers[messageId];  // 删除定时器
            }, 30000);  // 超时时间，例如30秒
        }
        // 追加块数据
        messageChunks[messageId] += chunkData;
        if (isLastChunk) {
            // 收到最后一个块，处理完整消息
            const fullMessage = messageChunks[messageId];
            process(fullMessage);  // 自定义的消息处理函数
            // 清理数据和定时器
            delete messageChunks[messageId];
            clearTimeout(timers[messageId]);
            delete timers[messageId];
        }
    }
};

// 开始新的对话
function startConversation(chatwith, username) {
    document.getElementById("input-area").style.visibility = "visible";  // 显示输入区域
    sessionStorage.setItem('chatwith', chatwith);  // 存储当前对话的联系人账号
    const contactName = document.getElementById("contactName");  // 获取联系人名称DOM元素
    const contactAccount = document.getElementById("contactAccount");  // 获取联系人账号DOM元素
    contactName.textContent = username;  // 设置联系人名称
    contactAccount.textContent = `账号: ${chatwith}`;  // 设置联系人账号

    const messagesContainer = document.getElementById("messages");  // 获取消息容器DOM元素
    messagesContainer.innerHTML = "";  // 清空消息容器

    const key = `messages-${account}-${chatwith}`;  // 定义存储消息的键名
    const savedMessages = localStorage.getItem(key);  // 从localStorage获取保存的消息

    if (savedMessages) {  // 如果有保存的消息
        const messages = JSON.parse(savedMessages);  // 解析JSON格式的消息
        messages.forEach(message => {  // 遍历每条消息
            const messageBubble = document.createElement("div");  // 创建消息泡泡
            const messageWrapper = document.createElement("div");  // 创建消息包装器
            messageBubble.classList.add("bubble");  // 添加样式类

            if (message.sender == account) {  // 如果是本方消息
                messageWrapper.classList.add("message", "message-right");  // 本方消息靠右
            } else {
                messageWrapper.classList.add("message", "message-left");  // 对方消息靠左
            }

            messageBubble.textContent = `[${message.sender}]: ${message.message}`;  // 设置消息内容
            messageWrapper.appendChild(messageBubble);  // 将消息泡泡添加到包装器
            messagesContainer.appendChild(messageWrapper);  // 将消息包装器添加到消息容器
        });

        messagesContainer.scrollTop = messagesContainer.scrollHeight;  // 滚动到最新消息
    }
    console.log("开始与账号 " + chatwith + " 的对话");  // 打印对话信息
}

// 当WebSocket连接关闭时触发
socket.onclose = function () {  // 定义连接关闭的回调函数
    alert("链接已断开");  // 弹出提示框
    window.location.href = '../HTML/index.html';  // 跳转到首页
};

// 当WebSocket连接发生错误时触发
socket.onerror = function (error) {  // 定义错误处理的回调函数
    alert("WebSocket连接失败，请检查网络连接！");  // 弹出提示框
    window.location.href = '../HTML/index.html';  // 跳转到首页
};

// 页面加载完成时的事件监听器
document.addEventListener("DOMContentLoaded", function () {
    const contactList = document.getElementById("contactList");  // 获取联系人列表DOM元素
    const messages = document.getElementById("messages");  // 获取消息容器DOM元素
    const messageInput = document.getElementById("messageInput");  // 获取消息输入框DOM元素
    const sendButton = document.getElementById("sendButton");  // 获取发送按钮DOM元素
    const menuButton = document.getElementById("menuButton");  // 获取菜单按钮DOM元素
    const exitButton = document.getElementById("exitButton");  // 获取退出按钮DOM元素
    const dropdownContent = document.getElementById('dropdownContent');  // 获取下拉菜单DOM元素

    document.getElementById("input-area").style.visibility = "hidden";  // 隐藏输入区域

    // 发送消息按钮的点击事件
    sendButton.addEventListener("click", function () {
        const message = messageInput.value.trim();  // 获取并清理消息输入框中的内容
        if (message) {  // 如果消息不为空
            const messageBubble = document.createElement("div");  // 创建消息泡泡元素
            const messageWrapper = document.createElement("div");  // 创建消息包装器元素

            messageBubble.classList.add("bubble");  // 添加样式类
            messageWrapper.classList.add("message", "message-right");  // 本方消息靠右

            messageBubble.textContent = "[" + account + "]: " + message;  // 设置消息内容
            messageWrapper.appendChild(messageBubble);  // 将消息泡泡添加到包装器
            messages.appendChild(messageWrapper);  // 将消息包装器添加到消息容器
            messageInput.value = "";  // 清空输入框
            messages.scrollTop = messages.scrollHeight;  // 滚动到最新消息

            const command = "sendMessage";  // 定义发送消息的命令
            const senderAccount = account;  // 获取发送方账号
            const receiverAccount = sessionStorage.getItem('chatwith');  // 获取接收方账号
            const payload = [command, senderAccount,receiverAccount,message];  // 定义包含登录和账号信息的消息
            const multiLinePayload = payload.join(DELIMITER);  // 用特定的分隔符连接消息
            sendMessageToServer(multiLinePayload);  // 发送消息到服务器
            console.log("发送消息");  // 打印消息发送信息
            saveMessageToLocal(senderAccount, receiverAccount, message);  // 保存消息到本地
        }
    });

    // 退出按钮的点击事件
    exitButton.addEventListener("click", function () {
        socket.close();  // 关闭WebSocket连接
    });

    // 菜单按钮的点击事件
    menuButton.addEventListener("click", function () {
        const dropdown = document.getElementById("dropdownContent");  // 获取下拉菜单DOM元素
        dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";  // 切换显示状态
    });

    // 处理下拉菜单项的点击事件
    document.getElementById("feature1").addEventListener("click", function () {
        alert("功能 1 被点击");  // 弹出提示框
        document.getElementById("dropdownContent").style.display = "none";  // 点击后隐藏下拉菜单
    });

    document.getElementById("feature2").addEventListener("click", function () {
        alert("功能 2 被点击");  // 弹出提示框
        document.getElementById("dropdownContent").style.display = "none";  // 点击后隐藏下拉菜单
    });

    document.getElementById("feature3").addEventListener("click", function () {
        alert("功能 3 被点击");  // 弹出提示框
        document.getElementById("dropdownContent").style.display = "none";  // 点击后隐藏下拉菜单
    });
});