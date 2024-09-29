var account = sessionStorage.getItem('account'); // 从sessionStorage中获取字符串

// 创建WebSocket连接，URL为后端配置的路径
const socket = new WebSocket('ws://localhost:8080/ws'); // 指定WebSocket的连接地址
function saveMessageToLocal(senderAccount, receiverAccount, messageContent) {
    account=sessionStorage.getItem('account');//account是当前登录的account
    let key = `messages-${account}-${senderAccount}`;//键名中的account指明该消息应该被account读取，解决消息重复的问题,另一个键名是和account对话的人
    if(account==senderAccount){
        key=`messages-${account}-${receiverAccount}`;
    }
    else if(account==receiverAccount){
        key=`messages-${account}-${senderAccount}`;
    }
    let messages = localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key)) : [];
    messages.push({ sender: senderAccount, message: messageContent });
    localStorage.setItem(key, JSON.stringify(messages));
    console.log("成功保存");
}//本地存消息的函数
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
    console.log("收到命令"+command);
    if (command == "loginSuccessfully") {
        const receiverAccount = blocks[1]; // 第二个消息
        const receiverUsername = blocks[2]; // 第三个消息
        const receiverEmail = blocks[3]; // 第四个消息
        const receiverTelephone = blocks[4]; // 第五个消息
        alert("欢迎回来：" + receiverAccount + "\n" + "昵称：" + receiverUsername + "\n" + "电子邮箱：" + receiverEmail + "\n" + "电话号码：" + receiverTelephone);
    }else if (command == "usersList") {
        const contactList = document.getElementById("contactList");
        contactList.innerHTML = ""; // 清空现有的联系人列表

        for (let i = 1; i < blocks.length; i += 2) {
            const userAccount = blocks[i];
            const userName = blocks[i + 1];
            const contactItem = document.createElement("div");
            if(userAccount!=account){//联系人不显示用户本人
                contactItem.textContent = `账号：${userAccount}, 昵称：${userName}`;
                contactItem.classList.add("contact-item"); // 为联系人添加类，以便样式定位
                contactList.appendChild(contactItem);
            // 为联系人添加点击事件
            contactItem.addEventListener("click", function () {
                startConversation(userAccount, userName);
            });
            } 
        }
    }
    else if(command == "messageFrom"){
        console.log("收到消息");
        const messages = document.getElementById("messages");
        const senderAccount = blocks[1];
        const messageContent = blocks[2];
        const messageBubble = document.createElement("div");
        const messageWrapper = document.createElement("div");
        messageBubble.classList.add("bubble");  // 添加样式类
        if(senderAccount == account)
        {
            messageWrapper.classList.add("message", "message-right");  // 本方消息靠右
        }
        else
        {
            messageWrapper.classList.add("message", "message-left"); // 对方消息靠左
        }
        const receiverAccount = account;//用来做savemessagetolocal的参数
        saveMessageToLocal(senderAccount, receiverAccount, messageContent);
        if(senderAccount==document.getElementById("contactAccount").textContent.split(': ')[1]){//检测收到的消息属不属于当前会话
            messageBubble.textContent = `[${senderAccount}]: ${messageContent}`;
            messageWrapper.appendChild(messageBubble);
            messages.appendChild(messageWrapper);
            messages.scrollTop = messages.scrollHeight; // 滚动到最新消息
        }
        else alert("你收到来自其他联系人的消息");
    }
};
function startConversation(account, username) {
    // 更新聊天头部信息
    sessionStorage.setItem('chatwith', account); // 使用sessionStorage存储
    let now_account=sessionStorage.getItem('account');//now_account是当前登录的account
    const contactName = document.getElementById("contactName");
    const contactAccount = document.getElementById("contactAccount");
    contactName.textContent = username;
    contactAccount.textContent = `账号: ${account}`;
    const messagesContainer = document.getElementById("messages");
    messagesContainer.innerHTML = ""; // 清空聊天记录容器的内容
    const senderAccount = sessionStorage.getItem('account');
    const key = `messages-${now_account}-${account}`;//存消息的键名
    console.log(key);
    const savedMessages = localStorage.getItem(key);
    if (savedMessages) {//从localstorage里读取消息
        const messages = JSON.parse(savedMessages);
        messages.forEach(message => {
            const messageBubble = document.createElement("div");
            const messageWrapper = document.createElement("div");
            messageBubble.classList.add("bubble");  // 添加样式类
            if(message.sender == account)
            {
                messageWrapper.classList.add("message", "message-right");  // 本方消息靠右
            }
            else
            {
                messageWrapper.classList.add("message", "message-left"); // 对方消息靠左
            }
            messageBubble.textContent = `[${message.sender}]: ${message.message}`;
            messageWrapper.appendChild(messageBubble);
            messagesContainer.appendChild(messageWrapper);
        });
        messagesContainer.scrollTop = messagesContainer.scrollHeight; // 滚动到最新消息
    }
    console.log("开始与账号 " + account + " 的对话");

}
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

    // 发送消息
    sendButton.addEventListener("click", function () {
        const message = messageInput.value.trim();
        if (message) {
            const messageBubble = document.createElement("div");
            const messageWrapper = document.createElement("div");
            messageBubble.classList.add("bubble");  // 添加样式类
            messageWrapper.classList.add("message", "message-right");  // 本方消息靠右
            messageBubble.textContent = "["+account+"]: "+message;
            messageWrapper.appendChild(messageBubble);
            messages.appendChild(messageWrapper);
            messageInput.value = ""; // 清空输入框
            messages.scrollTop = messages.scrollHeight; // 滚动到最新消息
            const command = "sendMessage";  // 定义 command
            const senderAccount = sessionStorage.getItem('account');
            const receiverAccount = sessionStorage.getItem('chatwith');
            const payload = `${command}[b1565ef8ea49b3b3959db8c5487229ea]${senderAccount}[b1565ef8ea49b3b3959db8c5487229ea]${receiverAccount}[b1565ef8ea49b3b3959db8c5487229ea]${message}`;
            // 发送消息到服务端
            socket.send(payload);
            console.log("发送消息");
            saveMessageToLocal(senderAccount, receiverAccount, message);//保存
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