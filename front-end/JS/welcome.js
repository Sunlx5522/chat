// welcome.js

const DELIMITER = '[b1565ef8ea49b3b3959db8c5487229ea]'; // 分隔符

const mySessionStorage = {}; // 我的临时存储器

var account = sessionStorage.getItem('account'); // 从sessionStorage中获取当前登录的账号

//信息格式 可扩展
const imageDataUrlPattern = /^data:image\/(png|jpeg|jpg|gif);base64,[A-Za-z0-9+/=]+$/; //图片格式

const messageChunks = {}; // 存储未完成的消息块，键为消息ID，值为消息内容
const messageHashes = {}; // 存储消息哈希值

const timers = {}; // 存储每个消息ID的定时器

const emojiMap = {
    "[pepe鸭]": '../SOURCEFILE/IMAGES/emoji/pepe鸭.gif',
    "[wink]": '../SOURCEFILE/IMAGES/emoji/wink.gif',
    "[华强鸭]": '../SOURCEFILE/IMAGES/emoji/华强鸭.gif',
    "[受不了]": '../SOURCEFILE/IMAGES/emoji/受不了.gif',
    "[吐彩虹]": '../SOURCEFILE/IMAGES/emoji/吐彩虹.gif',
    "[呆]": '../SOURCEFILE/IMAGES/emoji/呆.gif',
    "[哭]": '../SOURCEFILE/IMAGES/emoji/哭.gif',
    "[害怕]": '../SOURCEFILE/IMAGES/emoji/害怕.gif',
    "[很酷]": '../SOURCEFILE/IMAGES/emoji/很酷.gif',
    "[思考]": '../SOURCEFILE/IMAGES/emoji/思考.gif',
    "[恶魔鸭]": '../SOURCEFILE/IMAGES/emoji/恶魔鸭.gif',
    "[打伞]": '../SOURCEFILE/IMAGES/emoji/打伞.gif',
    "[打火鸭]": '../SOURCEFILE/IMAGES/emoji/打火鸭.gif',
    "[扔飞机]": '../SOURCEFILE/IMAGES/emoji/扔飞机.gif',
    "[抽烟]": '../SOURCEFILE/IMAGES/emoji/抽烟.gif',
    "[招手]": '../SOURCEFILE/IMAGES/emoji/招手.gif',
    "[摆手]": '../SOURCEFILE/IMAGES/emoji/摆手.gif',
    "[擦玻璃]": '../SOURCEFILE/IMAGES/emoji/擦玻璃.gif',
    "[无所谓]": '../SOURCEFILE/IMAGES/emoji/无所谓.gif',
    "[朋友]": '../SOURCEFILE/IMAGES/emoji/朋友.gif',
    "[洗澡]": '../SOURCEFILE/IMAGES/emoji/洗澡.gif',
    "[烤鸭]": '../SOURCEFILE/IMAGES/emoji/烤鸭.gif',
    "[睡觉]": '../SOURCEFILE/IMAGES/emoji/睡觉.gif',
    "[笑哭]": '../SOURCEFILE/IMAGES/emoji/笑哭.gif',
    "[第一]": '../SOURCEFILE/IMAGES/emoji/第一.gif',
    "[红温]": '../SOURCEFILE/IMAGES/emoji/红温.gif',
    "[老母鸭]": '../SOURCEFILE/IMAGES/emoji/老母鸭.gif',
    "[虎皮鸭]": '../SOURCEFILE/IMAGES/emoji/虎皮鸭.gif',
    "[诱惑]": '../SOURCEFILE/IMAGES/emoji/诱惑.gif',
    "[赞]": '../SOURCEFILE/IMAGES/emoji/赞.gif',
    "[钱]": '../SOURCEFILE/IMAGES/emoji/钱.gif',
    "[雪人]": '../SOURCEFILE/IMAGES/emoji/雪人.gif',
    "[震惊]": '../SOURCEFILE/IMAGES/emoji/震惊.gif',
    "[飞吻]": '../SOURCEFILE/IMAGES/emoji/飞吻.gif',
    "[飞起来]": '../SOURCEFILE/IMAGES/emoji/飞起来.gif',
    "[骷髅]": '../SOURCEFILE/IMAGES/emoji/骷髅.gif',
    
    // 添加更多表情包映射
};
// 打开或创建数据库

let db;
let request = window.indexedDB.open(account + "db", 1);

request.onerror = function (event) {
    console.log('数据库打开出错');
};

request.onsuccess = function (event) {
    db = event.target.result;
    console.log('数据库打开成功');
};

request.onupgradeneeded = function (event) {
    db = event.target.result;
    if (!db.objectStoreNames.contains('messages')) {
        let objectStore = db.createObjectStore('messages', { keyPath: 'id', autoIncrement: true });
        objectStore.createIndex('sender', 'sender', { unique: false });
        objectStore.createIndex('receiver', 'receiver', { unique: false });
        console.log('对象存储创建成功');
    }
};

// 保存消息到 IndexedDB
function saveMessage(senderAccount, receiverAccount, messageContent) {
    let transaction = db.transaction(['messages'], 'readwrite');
    let objectStore = transaction.objectStore('messages');
    let message = {
        sender: senderAccount,
        receiver: receiverAccount,
        content: messageContent,
        timestamp: new Date()
    };
    let request = objectStore.add(message);

    request.onsuccess = function () {
        console.log('消息已保存到 IndexedDB');
    };

    request.onerror = function () {
        console.log('保存消息时出错');
    };
}

function getMessagesForConversation(account, chatwith, callback) {
    let transaction = db.transaction(['messages'], 'readonly');
    let objectStore = transaction.objectStore('messages');

    let messages = [];

    // 使用索引查询消息
    //let index = objectStore.index('receiver');
    //let request = index.openCursor();

    let request = objectStore.openCursor();

    request.onsuccess = function (event) {
        let cursor = event.target.result;
        if (cursor) {
            let message = cursor.value;
            // 检查消息是否属于当前会话
            if ((message.sender === account && message.receiver === chatwith) ||
                (message.sender === chatwith && message.receiver === account)) {
                messages.push(message);
            }
            cursor.continue();
        } else {
            // 遍历完成，调用回调函数
            callback(messages);
        }
    };

    request.onerror = function (event) {
        console.error('获取消息时出错：', event.target.error);
    };
}

// 创建WebSocket连接，URL为后端配置的路径
const socket = new WebSocket('ws://localhost:8080/ws'); // 指定WebSocket的连接地址

//正则表达式
function isValidAvatarData(avatarData, fileType) {
    // 构建正则表达式模式
    const pattern = new RegExp(`^data:${fileType};base64,[A-Za-z0-9+/=]+$`);
    return pattern.test(avatarData);
}

function showRedDot(userAccount, count) {
    // 获取头像容器
    const avatarContainer = document.getElementById(userAccount + "avatarContainer");
    if (!avatarContainer) return;

    // 检查红点是否已经存在
    let redDot = avatarContainer.querySelector(".red-dot");
    if (!redDot) {
        // 创建红点元素
        redDot = document.createElement("span");
        redDot.classList.add("red-dot");
        avatarContainer.appendChild(redDot);
    }

    // 设置红点中的数字，超过 99 显示为 "99+"
    redDot.textContent = count > 99 ? '99+' : count;
}

function removeRedDot(userAccount) {
    const avatarContainer = document.getElementById(userAccount + "avatarContainer");
    if (!avatarContainer) return;
    const redDot = avatarContainer.querySelector(".red-dot");
    if (redDot) {
        avatarContainer.removeChild(redDot);
    }
}


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

async function sendMessageToServer(message) {
    const key = await importKey(rawKey); //生成密钥
    var encodeMessage = await encryptMessage(message, key, iv);
    const chunkSize = 1024;  // 定义每个块的大小（字节数）
    let offset = 0;  // 初始化偏移量
    const messageId = account + Date.now().toString();  // 生成唯一的消息ID 账号 + 时间戳

    // 计算消息的 SHA-256 哈希
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');  // 将哈希转换为十六进制字符串

    // 循环拆分并发送消息块
    while (offset < encodeMessage.length) {
        // 提取消息的一部分作为块
        const chunk = encodeMessage.slice(offset, offset + chunkSize);

        // 创建要发送的消息对象
        const chunkMessage = {
            type: 'chunk',  // 消息类型为块
            messageId: messageId,  // 唯一的消息ID，用于在接收端重组
            chunkData: chunk,  // 块的内容
            isLastChunk: (offset + chunkSize) >= encodeMessage.length,  // 是否为最后一个块
            sha256: offset === 0 ? hashHex : undefined  // 在第一个块中附加 SHA-256 哈希
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
function process(fullMessage) {
    const blocks = fullMessage.split(DELIMITER);  // 使用分隔符拆分消息
    const command = blocks[0];  // 获取消息的命令
    console.log("收到命令" + command);  // 打印收到的命令

    if (command == "loginSuccessfully") {  // 如果命令是登录成功
        const receiverAccount = blocks[1];  // 获取接收方账号
        const receiverUsername = blocks[2];  // 获取接收方昵称
        const receiverEmail = blocks[3];  // 获取接收方邮箱
        const receiverTelephone = blocks[4];  // 获取接收方电话
        var title = "欢迎回来：" + receiverAccount;
        var text = "昵称：" + receiverUsername + "<br>" + "电子邮箱：" + receiverEmail + "<br>" + "电话号码：" + receiverTelephone;
        Swal.fire({
            title: title,
            html: text,
            icon: 'info',  // 其他选项：'error', 'warning', 'info', 'question'
            confirmButtonText: '确定'
        });
        //alert("欢迎回来：" + receiverAccount + "\n" + "昵称：" + receiverUsername + "\n" + "电子邮箱：" + receiverEmail + "\n" + "电话号码：" + receiverTelephone);  // 显示欢迎信息
    } else if (command == "usersList") {  // 如果命令是用户列表
        const contactList = document.getElementById("contactList");  // 获取联系人列表的DOM元素
        contactList.innerHTML = "";  // 清空现有的联系人列表

        for (let i = 1; i < blocks.length; i += 4) {  // 遍历联系人列表
            const userAccount = blocks[i];  // 获取用户账号
            const userName = blocks[i + 1];  // 获取用户昵称
            const fileType = blocks[i + 2];
            const base64Data = blocks[i + 3];
            const avatarKey = userAccount + "avatar";
            const avatarData = `data:${fileType};base64,${base64Data}`; // 将 Base64 数据加上 data URL 前缀
            mySessionStorage[avatarKey] = avatarData;//sessionStorage.setItem(avatarKey, avatarData);
            mySessionStorage[userAccount + "counter"] = "0";//sessionStorage.setItem(userAccount + "counter", 0);
            console.log("头像已存储到 mySessionStorage");//console.log("头像已存储到 sessionStorage");
            const contactItem = document.createElement("div");  // 创建一个新的联系人元素
            contactItem.id = userAccount; // 联系人项 id
            const storedAvatar = mySessionStorage[userAccount + "avatar"];//const storedAvatar = sessionStorage.getItem(userAccount + "avatar");
            const avatar = document.createElement("img");
            avatar.id = userAccount + "img";
            avatar.src = storedAvatar;  // 根据发送方账号设置头像图片路径
            avatar.alt = "头像";
            avatar.classList.add("avatar");  // 添加头像样式类

            // 创建一个容器来包裹头像和红点
            const avatarContainer = document.createElement("div");
            avatarContainer.id = userAccount + "avatarContainer"; // 设置唯一的 id
            avatarContainer.classList.add("avatar-container"); // 添加样式类

            // 将头像添加到容器中
            avatarContainer.appendChild(avatar);

            // 创建一个用户信息的容器
            const userInfo = document.createElement("div");
            userInfo.classList.add("user-info");  // 添加样式类
            userInfo.innerHTML = `<div class="user-name">${userName}</div><div class="user-account">${userAccount}</div>`;

            if (userAccount != account) {  // 如果联系人不是当前用户
                contactItem.appendChild(avatarContainer);
                contactItem.appendChild(userInfo);
                //contactItem.innerHTML = `账号：${userAccount}<br>昵称：${userName}`; //添加元素
                contactItem.classList.add("contact-item");  // 添加样式类
                contactList.appendChild(contactItem);  // 将联系人元素添加到联系人列表

                // 为联系人添加点击事件
                contactItem.addEventListener("click", function () {
                    startConversation(userAccount, userName);  // 点击联系人后开始对话
                    mySessionStorage[userAccount + "counter"] = "0";//sessionStorage.setItem(userAccount + "counter", 0);
                    //待处理 移除红点
                    removeRedDot(userAccount);
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

        const storedAvatar = mySessionStorage[senderAccount + "avatar"];
        const avatar = document.createElement("img");
        avatar.src = storedAvatar;  // 根据发送方账号设置头像图片路径
        avatar.alt = "头像";
        avatar.classList.add("avatar");  // 添加头像样式类

        messageBubble.classList.add("bubble");  // 添加样式类
        messageWrapper.classList.add("message", "message-left");  // 对方消息靠左

        const receiverAccount = account;  // 当前接收消息的用户
        saveMessage(senderAccount, receiverAccount, messageContent);  // 调用函数保存消息到本地//saveMessageToLocal(senderAccount, receiverAccount, messageContent);  // 调用函数保存消息到本地
        const chatWith = sessionStorage.getItem('chatwith');
        if (chatWith !== null && chatWith !== '') {
            if (senderAccount == chatWith) {  // 检查收到的消息是否属于当前会话

                if (imageDataUrlPattern.test(messageContent)) {
                    // 如果匹配，创建 img 元素
                    const img = document.createElement("img");
                    img.src = messageContent;
                    img.alt = "图片";
                    img.classList.add("message-image"); // 添加样式类

                    messageBubble.appendChild(img); // 将图片添加到消息泡泡
                } else {
                    // 否则，按文本处理
                    messageBubble.textContent = messageContent;
                }

                //messageBubble.textContent = `${messageContent}`;  // 设置消息内容
                messageWrapper.appendChild(avatar);  // 将消息泡泡添加到消息包装器
                messageWrapper.appendChild(messageBubble);  // 将消息泡泡添加到消息包装器
                messages.appendChild(messageWrapper);  // 将消息包装器添加到消息容器
                //messages.scrollTop = messages.scrollHeight;  // 滚动到最新消息
                setTimeout(() => {
                    messages.scrollTop = messages.scrollHeight;  // 滚动到最新消息
                }, 0);
            } else {
                var counter = parseInt(mySessionStorage[senderAccount + "counter"]);
                counter = counter + 1;
                mySessionStorage[senderAccount + "counter"] = counter;//sessionStorage.setItem(senderAccount + "counter", counter);
                console.log(senderAccount + " counter：" + counter);
                //逻辑 添加红点
                showRedDot(senderAccount, counter);
            }
        }
        else {
            //alert("你收到来自"+senderAccount+"的消息");  // 弹出提示框，提示收到其他联系人的消息
            //使用其他逻辑替换
            var counter = parseInt(mySessionStorage[senderAccount + "counter"]);
            counter = counter + 1;
            mySessionStorage[senderAccount + "counter"] = counter;//sessionStorage.setItem(senderAccount + "counter", counter);
            console.log(senderAccount + " counter：" + counter);
            //逻辑 添加红点
            showRedDot(senderAccount, counter);
        }
    }
    else if (command == "myAvatar") {
        const fileType = blocks[1];
        console.log("文件类型：" + fileType);
        const base64Data = blocks[2];
        // 存储到 sessionStorage
        const avatarKey = "myAvatar";
        const avatarData = `data:${fileType};base64,${base64Data}`; // 将 Base64 数据加上 data URL 前缀
        mySessionStorage[avatarKey] = avatarData;//sessionStorage.setItem(avatarKey, avatarData);
        console.log("头像已存储到 mySessionStorage");//console.log("头像已存储到 sessionStorage");
    }
}

// 接收来自服务器的消息
socket.onmessage = async function (event) {  // 定义接收消息的回调函数
    const key = await importKey(rawKey); //生成密钥
    const payload = event.data;  // 获取消息的负载
    //console.log("收到消息" + payload);  // 打印收到消息信息
    const json = JSON.parse(payload);  // 解析JSON
    if (json.type === 'chunk') {
        const messageId = json.messageId;  // 获取消息ID
        const chunkData = json.chunkData;  // 获取块数据
        const isLastChunk = json.isLastChunk;  // 是否为最后一个块

        // 如果是第一个块，保存 SHA-256 哈希值
        if (json.sha256) {
            messageHashes[messageId] = json.sha256;
            messageChunks[messageId] = '';  // 初始化消息内容
            messageChunks[messageId] += chunkData;
            // 设置定时器，超时后删除未完成的消息
            timers[messageId] = setTimeout(() => {
                delete messageChunks[messageId];  // 删除未完成的消息
                delete messageHashes[messageId];  // 删除未完成的消息
                delete timers[messageId];  // 删除定时器
            }, 30000);  // 超时时间，例如30秒
            if (isLastChunk) {
                // 收到最后一个块，处理完整消息
                const fullMessageBase64 = messageChunks[messageId];
                const fullMessage = await decryptMessage(fullMessageBase64, key, iv);
                // 计算消息的 SHA-256 哈希值
                crypto.subtle.digest('SHA-256', new TextEncoder().encode(fullMessage))
                    .then(hashBuffer => {
                        const hashArray = Array.from(new Uint8Array(hashBuffer));
                        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

                        // 比较哈希值
                        if (hashHex === messageHashes[messageId]) {
                            process(fullMessage);  // 校验通过，处理消息
                        } else {
                            console.error('消息完整性校验失败');
                        }

                        // 清理数据和定时器
                        delete messageChunks[messageId];
                        delete messageHashes[messageId];
                        clearTimeout(timers[messageId]);
                        delete timers[messageId];
                    });
            }
        }
        else {
            if (messageChunks[messageId]) {
                messageChunks[messageId] += chunkData;

            }
            if (isLastChunk) {
                // 收到最后一个块，处理完整消息
                const fullMessageBase64 = messageChunks[messageId];
                const fullMessage = await decryptMessage(fullMessageBase64, key, iv);
                // 计算消息的 SHA-256 哈希值
                crypto.subtle.digest('SHA-256', new TextEncoder().encode(fullMessage))
                    .then(hashBuffer => {
                        const hashArray = Array.from(new Uint8Array(hashBuffer));
                        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

                        // 比较哈希值
                        if (hashHex === messageHashes[messageId]) {
                            process(fullMessage);  // 校验通过，处理消息
                        } else {
                            console.error('消息完整性校验失败');
                        }

                        // 清理数据和定时器
                        delete messageChunks[messageId];
                        delete messageHashes[messageId];
                        clearTimeout(timers[messageId]);
                        delete timers[messageId];
                    });
            }
        }
    }
};

//处理消息显示逻辑
function showMessages(messages) {

    const messagesContainer = document.getElementById("messages");  // 获取消息容器DOM元素
    messagesContainer.innerHTML = "";  // 清空消息容器
    messages.forEach(message => {  // 遍历每条消息
        /*sender: senderAccount,
        receiver: receiverAccount,
        content: messageContent,
        timestamp: new Date*/
        const messageBubble = document.createElement("div");  // 创建消息泡泡
        const messageWrapper = document.createElement("div");  // 创建消息包装器

        messageBubble.classList.add("bubble");  // 添加样式类

        if (message.sender == account) {  // 如果是本方消息
            const storedAvatar = mySessionStorage["myAvatar"];
            const avatar = document.createElement("img");
            avatar.src = storedAvatar;  // 根据发送方账号设置头像图片路径
            avatar.alt = "头像";
            avatar.classList.add("avatar");  // 添加头像样式类

            messageWrapper.classList.add("message", "message-right");  // 本方消息靠右
            if (imageDataUrlPattern.test(message.content)) {
                // 如果匹配，创建 img 元素
                const img = document.createElement("img");
                img.src = message.content;
                img.alt = "图片";
                img.classList.add("message-image"); // 添加样式类

                messageBubble.appendChild(img); // 将图片添加到消息泡泡
            } else {
                // 否则，按文本处理
                messageBubble.textContent = message.content;
                messageBubble.innerHTML=replaceEmojiCodes(message.content);
            }

            //messageBubble.textContent = `${message.message}`;  // 设置消息内容
            messageWrapper.appendChild(messageBubble);  // 将消息泡泡添加到包装器
            messageWrapper.appendChild(avatar);  // 将消息泡泡添加到消息包装器
            messagesContainer.appendChild(messageWrapper);  // 将消息包装器添加到消息容器
        } else {
            const storedAvatar = mySessionStorage[message.sender + "avatar"];
            const avatar = document.createElement("img");
            avatar.src = storedAvatar;  // 根据发送方账号设置头像图片路径
            avatar.alt = "头像";
            avatar.classList.add("avatar");  // 添加头像样式类

            messageWrapper.classList.add("message", "message-left");  // 对方消息靠左
            if (imageDataUrlPattern.test(message.content)) {
                // 如果匹配，创建 img 元素
                const img = document.createElement("img");
                img.src = message.content;
                img.alt = "图片";
                img.classList.add("message-image"); // 添加样式类

                messageBubble.appendChild(img); // 将图片添加到消息泡泡
            } else {
                // 否则，按文本处理
                messageBubble.textContent = message.content;
                messageBubble.innerHTML=replaceEmojiCodes(message.content);
            }

            //messageBubble.textContent = `${message.message}`;  // 设置消息内容
            messageWrapper.appendChild(avatar);  // 将消息泡泡添加到消息包装器
            messageWrapper.appendChild(messageBubble);  // 将消息泡泡添加到包装器
            messagesContainer.appendChild(messageWrapper);  // 将消息包装器添加到消息容器
        }

    });

    //messagesContainer.scrollTop = messagesContainer.scrollHeight;  // 滚动到最新消息
    setTimeout(() => {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 0);
}
function replaceEmojiCodes(text) {
    if (typeof text !== 'string') return 'error'; // 如果text不是字符串，返回error
    const emojiFileNames = ['笑哭', '吐彩虹', '老母鸭', /* ... */];
    const emojiFilePath = '../SOURCEFILE/IMAGES/emoji/';
    let replacedText = text;
    for (const [code, imagePath] of Object.entries(emojiMap)) {
        // 使用转义函数对特殊字符进行转义
        const escapedCode = code.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        replacedText = replacedText.replace(new RegExp(escapedCode, 'g'), `<img src="${imagePath}" alt="emoji" class="emoji" />`);
    }
    return replacedText;
}
// 开始新的对话
function startConversation(chatwith, username) {
    document.getElementById("input-area").style.visibility = "visible";  // 显示输入区域
    document.getElementById("tools").style.visibility = "visible";  // 显示工具区域
    document.getElementById("messageInput").value = "";  // 清空输入框
    sessionStorage.setItem('chatwith', chatwith);  // 存储当前对话的联系人账号
    const contactName = document.getElementById("contactName");  // 获取联系人名称DOM元素
    const contactAccount = document.getElementById("contactAccount");  // 获取联系人账号DOM元素
    contactName.textContent = username;  // 设置联系人名称
    contactAccount.textContent = `${chatwith}`;  // 设置联系人账号

    getMessagesForConversation(account, chatwith, showMessages); // 显示消息
    console.log("开始与账号 " + chatwith + " 的对话");  // 打印对话信息
}

// 当WebSocket连接关闭时触发
socket.onclose = function () {  // 定义连接关闭的回调函数
    var title = "连接已断开";
    Swal.fire({
        title: title,
        icon: 'error',  // 其他选项：'error', 'warning', 'info', 'question'
        confirmButtonText: '确定'
    }).then((result) => {
        if (result.isConfirmed) {
            // 用户点击了“确定”按钮，执行页面跳转
            window.location.href = '../HTML/index.html';  // 跳转到首页
        }
    });
};

// 当WebSocket连接发生错误时触发
socket.onerror = function (error) {  // 定义错误处理的回调函数
    var title = "WebSocket连接失败，请检查网络连接！";
    Swal.fire({
        title: title,
        icon: 'error',  // 其他选项：'error', 'warning', 'info', 'question'
        confirmButtonText: '确定'
    }).then((result) => {
        if (result.isConfirmed) {
            // 用户点击了“确定”按钮，执行页面跳转
            window.location.href = '../HTML/index.html';  // 跳转到首页
        }
    });
};

// 页面加载完成时的事件监听器
document.addEventListener("DOMContentLoaded", function () {

    const contactList = document.getElementById("contactList");  // 获取联系人列表DOM元素
    const messages = document.getElementById("messages");  // 获取消息容器DOM元素
    const messageInput = document.getElementById("messageInput");  // 获取消息输入框DOM元素
    const sendButton = document.getElementById("sendButton");  // 获取发送按钮DOM元素
    const menuButton = document.getElementById("menuButton");  // 获取菜单按钮DOM元素
    const exitButton = document.getElementById("exitButton");  // 获取退出按钮DOM元素
    const fileButton = document.getElementById("fileButton");  // 获取文件按钮DOM元素
    const emojiButton = document.getElementById("emojiButton");
    const emojiTable = document.getElementById("emojiTable");
    const eTable = document.getElementById('eTable');
    //const dropdownContent = document.getElementById('dropdownContent');  // 获取下拉菜单DOM元素

    document.getElementById("input-area").style.visibility = "hidden";  // 隐藏输入区域
    document.getElementById("tools").style.visibility = "hidden";  // 隐藏工具区域


    //文件按钮监听
    fileButton.addEventListener('click', function () {
        document.getElementById('fileInput').click();
    });
    document.getElementById('fileInput').addEventListener('change', function (event) {
        const file = event.target.files[0];
        var base64String;
        if (file) {
            // 用户已选择文件，执行对应的操作
            // 在这里处理文件，例如读取文件内容或上传到服务器
            // 获取文件后缀名（文件类型）
            const fileType = file.type; // 或者使用 file.name.split('.').pop() 获取后缀
            console.log('已选择文件：', file.name);
            console.log('文件类型：', fileType);

            // 创建 FileReader 对象来读取文件
            const reader = new FileReader();
            console.log('已创建读取器');
            // 当 FileReader 完成读取时的回调
            reader.onload = function (e) {
                console.log('读取完成');
                base64String = e.target.result; // 获取 base64 编码的字符串
                //console.log('文件的 Base64 编码：', base64String);

                const command = "sendMessage";  // 定义发送消息的命令
                const senderAccount = account;  // 获取发送方账号
                const receiverAccount = sessionStorage.getItem('chatwith');  // 获取接收方账号
                const payload = [command, senderAccount, receiverAccount, base64String];  // 定义包含登录和账号信息的消息
                const multiLinePayload = payload.join(DELIMITER);  // 用特定的分隔符连接消息
                sendMessageToServer(multiLinePayload);  // 发送消息到服务器
                console.log("发送消息");  // 打印消息发送信息
                saveMessage(senderAccount, receiverAccount, base64String);  // 保存消息到本地//saveMessageToLocal(senderAccount, receiverAccount, base64String);  // 保存消息到本地

                const messageBubble = document.createElement("div");  // 创建消息泡泡元素
                const messageWrapper = document.createElement("div");  // 创建消息包装器元素

                const storedAvatar = mySessionStorage["myAvatar"];
                const avatar = document.createElement("img");
                avatar.src = storedAvatar;  // 根据发送方账号设置头像图片路径
                avatar.alt = "头像";
                avatar.classList.add("avatar");  // 添加头像样式类

                messageBubble.classList.add("bubble");  // 添加样式类
                messageWrapper.classList.add("message", "message-right");  // 本方消息靠右
                if (imageDataUrlPattern.test(base64String)) {
                    // 如果匹配，创建 img 元素
                    const img = document.createElement("img");
                    img.src = base64String;
                    img.alt = "图片";
                    img.classList.add("message-image"); // 添加样式类

                    messageBubble.appendChild(img); // 将图片添加到消息泡泡
                } else {
                    // 否则，按文本处理
                    messageBubble.textContent = messageContent;
                }
                //messageBubble.textContent = message;  // 设置消息内容
                messageWrapper.appendChild(messageBubble);  // 将消息泡泡添加到包装器
                messageWrapper.appendChild(avatar);  // 将消息泡泡添加到消息包装器
                messages.appendChild(messageWrapper);  // 将消息包装器添加到消息容器


                // 你可以在这里处理 base64 编码的文件，例如将其上传到服务器或用于前端展示
            };
            reader.readAsDataURL(file);




            /*if (imageDataUrlPattern.test(messageContent)) {
                    // 如果匹配，创建 img 元素
                    const img = document.createElement("img");
                    img.src = messageContent;
                    img.alt = "图片";
                    img.classList.add("message-image"); // 添加样式类
    
                    messageBubble.appendChild(img); // 将图片添加到消息泡泡
                } else {
                    // 否则，按文本处理
                    messageBubble.textContent = messageContent;
                }*/

        } else {
            // 用户未选择文件，不执行任何操作
        }
    });

    // 使用事件委托监听点击事件
    contactList.addEventListener('click', (event) => {
        // 使用 closest 查找点击的目标是否为 .contact-item 或其子元素
        const contactItem = event.target.closest('.contact-item');

        // 如果找到了 contact-item 元素，继续处理
        if (contactItem) {
            // 移除所有联系项的 'selected' 类
            document.querySelectorAll('.contact-item').forEach(i => i.classList.remove('selected'));

            // 为当前点击的联系项添加 'selected' 类
            contactItem.classList.add('selected');

        }
    });

    // 发送消息按钮的点击事件
    sendButton.addEventListener("click", function () {
        const message = messageInput.value.trim();  // 获取并清理消息输入框中的内容
        if (message) {  // 如果消息不为空
            const messageBubble = document.createElement("div");  // 创建消息泡泡元素
            const messageWrapper = document.createElement("div");  // 创建消息包装器元素

            const storedAvatar = mySessionStorage["myAvatar"];
            const avatar = document.createElement("img");
            avatar.src = storedAvatar;  // 根据发送方账号设置头像图片路径
            avatar.alt = "头像";
            avatar.classList.add("avatar");  // 添加头像样式类

            messageBubble.classList.add("bubble");  // 添加样式类
            messageWrapper.classList.add("message", "message-right");  // 本方消息靠右

            messageBubble.textContent = message;  // 设置消息内容
            messageBubble.innerHTML = replaceEmojiCodes(messageBubble.textContent);//表情包替换表情包标识
            messageWrapper.appendChild(messageBubble);  // 将消息泡泡添加到包装器
            messageWrapper.appendChild(avatar);  // 将消息泡泡添加到消息包装器
            messages.appendChild(messageWrapper);  // 将消息包装器添加到消息容器
            messageInput.value = "";  // 清空输入框
            //messages.scrollTop = messages.scrollHeight;  // 滚动到最新消息
            setTimeout(() => {
                messages.scrollTop = messages.scrollHeight;  // 滚动到最新消息
            }, 0);

            const command = "sendMessage";  // 定义发送消息的命令
            const senderAccount = account;  // 获取发送方账号
            const receiverAccount = sessionStorage.getItem('chatwith');  // 获取接收方账号
            const payload = [command, senderAccount, receiverAccount, message];  // 定义包含登录和账号信息的消息
            const multiLinePayload = payload.join(DELIMITER);  // 用特定的分隔符连接消息
            sendMessageToServer(multiLinePayload);  // 发送消息到服务器
            console.log("发送消息");  // 打印消息发送信息
            saveMessage(senderAccount, receiverAccount, message);  // 保存消息到本地//saveMessageToLocal(senderAccount, receiverAccount, message);  // 保存消息到本地
        }
    });

    // 退出按钮的点击事件
    exitButton.addEventListener("click", function () {
        socket.close();  // 关闭WebSocket连接
    });

    // 菜单按钮的点击事件
    menuButton.addEventListener("click", function () {
        //dropdownContent.style.display = "block";  // 点击后隐藏下拉菜单
        dropdownContent.classList.toggle("show");  // 切换显示状态的类
    });

    // 处理下拉菜单项的点击事件
    document.getElementById("feature1").addEventListener("click", function () {
        //alert("功能 1 被点击");  // 使用其他逻辑替换
        dropdownContent.classList.toggle("show");  // 切换显示状态的类
    });

    document.getElementById("feature2").addEventListener("click", function () {
        //alert("功能 2 被点击");  // 弹出提示框 // 使用其他逻辑替换
        dropdownContent.classList.toggle("show");  // 切换显示状态的类
    });

    document.getElementById("feature3").addEventListener("click", function () {
        //alert("功能 3 被点击");  // 弹出提示框 // 使用其他逻辑替换
        dropdownContent.classList.toggle("show");  // 切换显示状态的类
    });
    document.getElementById("feature4").addEventListener("click", function () {
        contactList.classList.toggle('collapsed');  //向左收回按钮
        dropdownContent.classList.toggle("show");  // 切换显示状态的类
    });
    document.getElementById("feature5").addEventListener("click", function () {
        // 发送初始消息到服务器
        document.getElementById("input-area").style.visibility = "hidden";  // 隐藏输入区域
        document.getElementById("tools").style.visibility = "hidden";  // 隐藏工具区域
        //.innerHTML = "";
        // 清空聊天头部区域的联系人名称和账号信息
        document.getElementById("contactName").textContent = "";
        document.getElementById("contactAccount").textContent = "";
        // 清空消息展示区域的所有消息
        document.getElementById("messages").innerHTML = "";

        const messages = ['refresh', account];  // 定义包含登录和账号信息的消息
        const multiLineMessage = messages.join(DELIMITER);  // 用特定的分隔符连接消息
        sendMessageToServer(multiLineMessage);  // 发送消息到服务器
        dropdownContent.classList.toggle("show");  // 切换显示状态的类
    });
    emojiButton.addEventListener("click",function(){
        emojiTable.classList.toggle('hidden'); // 切换emojitable的显示状态
        
        if (emojiTable.classList.contains('hidden')) {
            return;
        }// 如果emojiTable是隐藏的，则不需要定位
       
        const buttonRect = emojiButton.getBoundingClientRect(); // 获取emojiButton的位置以定位emojiTable
        // 设置样式以定位emojiTable
        emojiTable.style.left = `${buttonRect.left + window.scrollX + buttonRect.width / 2 }px`;
        emojiTable.style.bottom = `${window.innerHeight - (buttonRect.top + window.scrollY)}px`; // 使用bottom属性
    });
    const emojisPerRow = 4;
    let row = document.createElement('tr');
    Object.entries(emojiMap).forEach(([key, value], index) => {
        // 为每个emoji创建一个单元格
        const td = document.createElement('td');
        const img = document.createElement('img');
        img.src = value;
        img.alt = key.replace(/]$/, '').replace(/\[/g, '');
        img.style.width = '30px'; // 设置图片大小
        img.style.height = '30px'; // 设置图片大小
        td.appendChild(img); // 将图片添加到单元格
        row.appendChild(td); // 将单元格添加到行

        // 每当达到一行的emoji数量限制，或者这是最后一个emoji时，添加行到表格
        if ((index + 1) % emojisPerRow === 0 || index === Object.entries(emojiMap).length - 1) {
            eTable.appendChild(row); // 将行添加到表格
            row = document.createElement('tr'); // 创建新的行
        }
    });
    document.querySelectorAll('.emojiTable img').forEach(img => {
        img.addEventListener('click', function() {
            const currentText = messageInput.value;
            messageInput.value = currentText +'[' + img.alt +']';
        });
    });
    emojiTable.appendChild(eTable); // 将表格添加到emojiTable容器
});

