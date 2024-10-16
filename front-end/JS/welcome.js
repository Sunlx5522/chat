// welcome.js

let db; // 数据库
var key; //密钥
let selectedBubbleId = null; // 用来存储选中的 .bubble 元素的 ID
var account = sessionStorage.getItem('account'); // 从sessionStorage中获取当前登录的账号
sessionStorage.setItem('chatwith', '');  // 使用sessionStorage存储账号
const timers = {}; // 存储每个消息ID的定时器
const messageHashes = {}; // 存储消息哈希值
const messageChunks = {}; // 存储未完成的消息块，键为消息ID，值为消息内容
const mySessionStorage = {}; // 我的临时存储器
const socket = new WebSocket('ws://localhost:8080/ws'); // 指定WebSocket的连接地址
const DELIMITER = '[b1565ef8ea49b3b3959db8c5487229ea]'; // 分隔符
//文件处理 'image/png', 'image/jpeg', 'image/jpg', 'image/x-icon', 'image/gif', 'application/x-zip-compressed','application/x-compressed','text/plain'
const imageDataUrlPattern = /^data:image\/(png|jpeg|jpg|x-icon|gif);base64,[A-Za-z0-9+/=]+$/; //图片格式
const zipDataUrlPattern = /^data:application\/(x-zip-compressed);base64,[A-Za-z0-9+/=]+$/; //zip压缩包格式
const rarDataUrlPattern = /^data:application\/(x-compressed);base64,[A-Za-z0-9+/=]+$/; //rar压缩包格式
const txtDataUrlPattern = /^data:text\/(plain);base64,[A-Za-z0-9+/=]+$/; //rar压缩包格式
const mp4DataUrlPattern = /^data:video\/(mp4);base64,[A-Za-z0-9+/=]+$/; //rar压缩包格式
const mp3DataUrlPattern = /^data:audio\/(mpeg);base64,[A-Za-z0-9+/=]+$/; //rar压缩包格式
const pdfDataUrlPattern = /^data:application\/(pdf);base64,[A-Za-z0-9+/=]+$/; //rar压缩包格式
const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/x-icon', 'image/gif', 'application/x-zip-compressed', 'application/x-compressed', 'text/plain', 'video/mp4', 'audio/mpeg','application/pdf']; // 定义允许的类型
const gifValidTypes = ['image/png', 'image/jpeg', 'image/jpg','image/gif']; // 定义允许的类型
//emoji表情处理

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

//初始化密钥
async function initKey() {
    key = await importKey(rawKey); //生成密钥
    console.log('密钥初始化成功');
}

//定时器设置
function setTimer(messageId) {
    // 设置定时器，超时后删除未完成的消息
    timers[messageId] = setTimeout(() => {
        delete messageChunks[messageId];  // 删除未完成的消息
        delete messageHashes[messageId];  // 删除未完成的消息
        delete timers[messageId];  // 删除定时器
    }, 30000);  // 超时时间，例如30秒
}

//解码消息并处理

async function decode(fullMessage, messageId) {
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

// 打开或创建数据库
function initDB() {
    let request = window.indexedDB.open(account + "db", 2);
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
        if (!db.objectStoreNames.contains('myEmoji')) {
            let objectStore = db.createObjectStore('myEmoji', { keyPath: 'id', autoIncrement: true });
            console.log('表情对象存储创建成功');
        }
    };
    console.log('数据库初始化完成');
}

async function chunkHandler(json) {
    const messageId = json.messageId;  // 获取消息ID
    const chunkData = json.chunkData;  // 获取块数据
    const isLastChunk = json.isLastChunk;  // 是否为最后一个块

    // 如果是第一个块，保存 SHA-256 哈希值
    if (json.sha256) {
        messageHashes[messageId] = json.sha256;
        messageChunks[messageId] = '';  // 初始化消息内容
        messageChunks[messageId] += chunkData; // 消息追加
        setTimer(messageId);
        if (isLastChunk) {
            // 收到最后一个块，处理完整消息,并解码
            const fullMessage = await decryptMessage(messageChunks[messageId], key, iv);
            decode(fullMessage, messageId);
        }
    }
    else {
        if (messageChunks[messageId]) {
            messageChunks[messageId] += chunkData;
        }
        if (isLastChunk) {
            // 收到最后一个块，处理完整消息 ,并解码
            const fullMessage = await decryptMessage(messageChunks[messageId], key, iv);
            decode(fullMessage, messageId);
        }
    }
}

function initSocket() {
    // 当WebSocket连接成功时触发
    socket.onopen = function () {  // 定义连接成功的回调函数
        console.log('WebSocket connection established');  // 打印连接成功信息
        // 发送初始消息到服务器
        const messages = ['login', account];  // 定义包含登录和账号信息的消息
        const multiLineMessage = messages.join(DELIMITER);  // 用特定的分隔符连接消息
        sendMessageToServer(multiLineMessage);  // 发送消息到服务器
    };
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
    // 接收来自服务器的消息
    socket.onmessage = async function (event) {  // 定义接收消息的回调函数
        const payload = event.data;  // 获取消息的负载
        const json = JSON.parse(payload);  // 解析JSON
        if (json.type === 'chunk') {
            chunkHandler(json);
        }
    };

}

initKey();
initDB();
initSocket();

//功能性函数

//base64格式返回器
function getMimeType(base64String) {
    const match = base64String.match(/^data:(.*?);base64,/);
    if (match) {
        return match[1]; // 返回 MIME 类型
    } else {
        return null; // 如果没有前缀，返回 null
    }
}

//哈希计算器
async function hashCalculator(message) {
    // 计算消息的 SHA-256 哈希
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');  // 将哈希转换为十六进制字符串
    return hashHex;
}

// 保存消息到 IndexedDB
function saveMessage(senderAccount, receiverAccount, messageContent) {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject('数据库尚未初始化');
            return;
        }

        let transaction = db.transaction(['messages'], 'readwrite');
        let objectStore = transaction.objectStore('messages');
        let message = {
            sender: senderAccount,
            receiver: receiverAccount,
            content: messageContent,
            timestamp: new Date()
        };
        let request = objectStore.add(message);

        request.onsuccess = function (event) {
            console.log('消息已保存到 IndexedDB');
            const id = event.target.result; // 获取生成的主键
            resolve(id);
        };

        request.onerror = function (event) {
            console.error('保存消息时出错:', event.target.error);
            reject(event.target.error);
        };
    });
}

function deleteMessageById(id) {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject('数据库尚未初始化');
            return;
        }

        // 创建一个 readwrite 事务，允许删除数据
        let transaction = db.transaction(['messages'], 'readwrite');
        let objectStore = transaction.objectStore('messages');
        let request = objectStore.delete(Number(id));  // 确保 ID 是数字类型

        // 处理删除成功的情况
        request.onsuccess = function () {
            console.log(`ID 为 ${id} 的消息已从 object store 中删除`);
        };

        // 处理删除失败的情况
        request.onerror = function (event) {
            console.error('删除消息时出错:', event.target.error);
            reject(`删除 ID 为 ${id} 的消息时出错: ${event.target.error}`);
        };

        // 监听事务完成事件，确保事务已提交
        transaction.oncomplete = function () {
            console.log('事务已成功提交');
            resolve(`ID 为 ${id} 的消息已成功删除`);
        };

        // 监听事务出错事件
        transaction.onerror = function (event) {
            console.error('事务提交失败:', event.target.error);
            reject('事务提交失败');
        };
    });
}

// 根据ID获取单条消息
function getMessageById(id) {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject('数据库尚未初始化');
            return;
        }

        let transaction = db.transaction(['messages'], 'readonly');
        let objectStore = transaction.objectStore('messages');
        let request = objectStore.get(id);

        request.onsuccess = function (event) {
            const message = event.target.result;
            if (message) {
                resolve(message);
            } else {
                reject(`未找到 ID 为 ${id} 的消息`);
            }
        };

        request.onerror = function (event) {
            console.error('获取消息时出错:', event.target.error);
            reject(event.target.error);
        };
    });
}


//为对话获取信息
function getMessagesForConversation(account, chatwith, callback) {
    let transaction = db.transaction(['messages'], 'readonly');
    let objectStore = transaction.objectStore('messages');
    let messages = [];
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

//显示红点
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

//移除红点
function removeRedDot(userAccount) {
    const avatarContainer = document.getElementById(userAccount + "avatarContainer");
    if (!avatarContainer) return;
    const redDot = avatarContainer.querySelector(".red-dot");
    if (redDot) {
        avatarContainer.removeChild(redDot);
    }
}

function base64ToBlob(base64, mimeType) {
    //const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/x-icon', 'image/gif', 'application/x-zip-compressed','application/x-compressed']; // 定义允许的类型
    // 移除可能存在的前缀 x-compressed
    const base64Prefix_0 = 'data:application/x-zip-compressed;base64,';
    if (base64.startsWith(base64Prefix_0)) {
        base64 = base64.substring(base64Prefix_0.length);
    }

    const base64Prefix_1 = 'data:application/x-compressed;base64,';
    if (base64.startsWith(base64Prefix_1)) {
        base64 = base64.substring(base64Prefix_1.length);
    }

    const base64Prefix_2 = 'data:image/png;base64,';
    if (base64.startsWith(base64Prefix_2)) {
        base64 = base64.substring(base64Prefix_2.length);
    }

    const base64Prefix_3 = 'data:image/jpeg;base64,';
    if (base64.startsWith(base64Prefix_3)) {
        base64 = base64.substring(base64Prefix_3.length);
    }

    const base64Prefix_4 = 'data:image/jpg;base64,';
    if (base64.startsWith(base64Prefix_4)) {
        base64 = base64.substring(base64Prefix_4.length);
    }

    const base64Prefix_5 = 'data:image/x-icon;base64,';
    if (base64.startsWith(base64Prefix_5)) {
        base64 = base64.substring(base64Prefix_5.length);
    }

    const base64Prefix_6 = 'data:image/gif;base64,';
    if (base64.startsWith(base64Prefix_6)) {
        base64 = base64.substring(base64Prefix_6.length);
    }

    const base64Prefix_7 = 'data:text/plain;base64,';
    if (base64.startsWith(base64Prefix_7)) {
        base64 = base64.substring(base64Prefix_7.length);
    }

    const base64Prefix_8 = 'data:video/mp4;base64,';
    if (base64.startsWith(base64Prefix_8)) {
        base64 = base64.substring(base64Prefix_8.length);
    }

    const base64Prefix_9 = 'data:audio/mpeg;base64,';
    if (base64.startsWith(base64Prefix_9)) {
        base64 = base64.substring(base64Prefix_9.length);
    }
    const base64Prefix_10 = 'data:application/pdf;base64,';
    if (base64.startsWith(base64Prefix_10)) {
        base64 = base64.substring(base64Prefix_10.length);
    }

    // 移除所有非 Base64 字符
    base64 = base64.replace(/[^A-Za-z0-9+/=]/g, '');

    // 处理长度不为4的倍数的情况，进行填充
    while (base64.length % 4 !== 0) {
        base64 += '=';
    }

    let byteCharacters;
    try {
        byteCharacters = atob(base64);
    } catch (error) {
        console.error('无法解码 Base64 字符串：', error);
        return null;
    }

    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);

        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: mimeType });
}

//单位换算
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

//发送消息至服务器
async function sendMessageToServer(message) {
    var encodeMessage = await encryptMessage(message, key, iv);
    const chunkSize = 1024;  // 定义每个块的大小（字节数）
    let offset = 0;  // 初始化偏移量
    const messageId = account + Date.now().toString();  // 生成唯一的消息ID 账号 + 时间戳

    // 计算消息的 SHA-256 哈希
    const hashHex = await hashCalculator(message);  // 将哈希转换为十六进制字符串
    //console.log("计算出的哈希" + hashHex);
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

//计算大小
function getBase64Size(base64String) {
    // 移除前缀部分（例如 'data:application/rar;base64,'）
    const base64Body = base64String.split(',')[1] || base64String;

    // 计算原始字节大小
    const padding = (base64Body.match(/=/g) || []).length; // 计算 Base64 填充的 `=` 数量
    const base64Length = base64Body.length;

    const originalSize = (base64Length * 3 / 4) - padding;
    return originalSize; // 返回字节大小
}

//懒加载
// 定义 IntersectionObserver 懒加载逻辑
const imgObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            // 首先显示加载中的 GIF
            //const loadingGif = '../SOURCEFILE/IMAGES/welcome/loading.gif';
            //img.src = loadingGif; // 设置为加载动画

            // 加载真实图片
            const realImageSrc = img.dataset.src;

            // 创建一个新的 Image 对象，加载真实图片
            const tempImg = new Image();
            tempImg.src = realImageSrc;

            // 当真实图片加载完成时，执行替换
            tempImg.onload = function () {
                img.classList.add("fade-in");  // 添加淡入效果的类
                img.src = realImageSrc;  // 替换为真实图片
                // 检查图片在页面上的显示宽度
                //img.style.width = img.offsetWidth + "px";
                console.log("图片的显示宽度 (offsetWidth):", img.offsetWidth);
                // 停止观察该图片
                observer.unobserve(img);
            };

            const messages = document.getElementById("messages");
            const lastMessage = messages.lastElementChild;

            // 判断该图片所在的消息是否是最后一个消息
            if (img.closest('.message') === lastMessage) {
                console.log("是最后一个消息");
                // 图片加载完成后滚动到最底部
                img.onload = () => {
                    const messagesContainer = document.getElementById("messages");
                    messagesContainer.scrollTop = messagesContainer.scrollHeight; // 滚动到最底部
                };
            }
        }
    });
}, {
    // 预加载的阈值
    threshold: 1
});

//添加消息
async function addMessage(id, senderAccount, messageContent, shouldObserve = true) {
    const fileType = await getMimeType(messageContent);
    if (fileType == null) {
        console.log("文件格式：" + "文本类型");
    }
    else {
        console.log("文件格式：" + fileType);
    }
    const messages = document.getElementById("messages");  // 获取消息容器的DOM元素
    const messageBubble = document.createElement("div");  // 创建消息泡泡元素
    const messageWrapper = document.createElement("div");  // 创建消息包装器元素
    messageBubble.classList.add("bubble");  // 添加样式类
    messageBubble.id = "messageBubble:" + id;
    messageWrapper.id = "messageWrapper:" + id;
    messageBubble.title = messageBubble.id;
    //头像元素
    const avatar = document.createElement("img");
    const storedAvatar = mySessionStorage[senderAccount + "avatar"];
    avatar.src = storedAvatar;  // 根据发送方账号设置头像图片路径
    avatar.alt = "头像";
    avatar.classList.add("avatar");  // 添加头像样式类
    if (imageDataUrlPattern.test(messageContent)) {

        const img = document.createElement("img");
        img.dataset.src = messageContent;  // 设置 data-src 属性用于懒加载
        img.alt = "图片";
        img.classList.add("message-image");

        img.src = "../SOURCEFILE/IMAGES/welcome/place.png";

        messageBubble.appendChild(img);

        // 使用 IntersectionObserver 观察图片元素
        img.classList.add("message-observe");
        if (shouldObserve) {
            // 使用 IntersectionObserver 观察图片元素
            imgObserver.observe(img);  // 开始懒加载观察
        }

        img.classList.add("item");
        messageBubble.addEventListener('click', function (e) {
            e.preventDefault()
            if (e.target.classList.contains('item')) {
              originalEl = e.target
              cloneEl = originalEl.cloneNode(true)
              originalEl.style.opacity = 0
              openPreview()
            }
          })

        
    }
    else if (zipDataUrlPattern.test(messageContent)) {
        //Blob 对象本身由 JavaScript 的垃圾回收机制（Garbage Collector, GC）管理。当没有任何引用指向一个 Blob 时，GC 会自动回收其占用的内存。因此，无需手动释放 Blob 对象。
        //Blob 对象本身由 JavaScript 的垃圾回收机制（Garbage Collector, GC）管理。当没有任何引用指向一个 Blob 时，GC 会自动回收其占用的内存。因此，无需手动释放 Blob 对象。
        const blobSize = getBase64Size(messageContent);
        const formattedSize = formatBytes(blobSize, 2);

        const fileInfo = document.createElement("div"); // 您也可以使用 <span> 或其他元素
        fileInfo.innerHTML = `ZIP文件<br>(${formattedSize})`;

        //link.title = `${formattedSize}`;
        const img = document.createElement("img");
        img.src = "../SOURCEFILE/IMAGES/welcome/zip.png";
        img.alt = "压缩文件";
        img.classList.add("message-image"); // 添加样式类

        img.style.display = 'block';
        fileInfo.style.display = 'block';
        messageBubble.appendChild(img); // 将图片添加到消息泡泡
        messageBubble.appendChild(fileInfo); // 将图片添加到消息泡泡

        messageBubble.addEventListener("click", async function () {
            try {
                const message = await getMessageById(id);
                const theContent = message.content;
                const blob = base64ToBlob(theContent, 'application/zip');
                if (blob) {
                    // 创建一个指向 Blob 的 URL
                    const blobURL = URL.createObjectURL(blob);
                    // 创建一个隐藏的 <a> 元素
                    const downloadLink = document.createElement('a');
                    downloadLink.href = blobURL;
                    downloadLink.download = 'download.zip'; // 您可以根据需要更改文件名
                    // 将 <a> 元素添加到文档中
                    document.body.appendChild(downloadLink);
                    // 触发点击事件，启动下载
                    downloadLink.click();
                    var title = "已开始下载";
                    Swal.fire({
                        title: title,
                        icon: 'success',  // 其他选项：'error', 'warning', 'info', 'question'
                        showConfirmButton: false,  // 隐藏确认按钮
                        timer: 1000,  // 设置定时器，2秒后自动关闭
                        timerProgressBar: true,  // 显示进度条
                    });
                    // 移除 <a> 元素并释放 Blob URL
                    document.body.removeChild(downloadLink);
                    URL.revokeObjectURL(blobURL);
                }
            } catch (error) {
                console.error('获取消息内容失败:', error);
            }
        });
    } else if (rarDataUrlPattern.test(messageContent)) {
        //Blob 对象本身由 JavaScript 的垃圾回收机制（Garbage Collector, GC）管理。当没有任何引用指向一个 Blob 时，GC 会自动回收其占用的内存。因此，无需手动释放 Blob 对象。
        const blobSize = getBase64Size(messageContent);
        const formattedSize = formatBytes(blobSize, 2);

        const fileInfo = document.createElement("div"); // 您也可以使用 <span> 或其他元素
        fileInfo.innerHTML = `RAR文件<br>(${formattedSize})`;

        //link.title = `${formattedSize}`;
        const img = document.createElement("img");
        img.src = "../SOURCEFILE/IMAGES/welcome/rar.png";
        img.alt = "压缩文件";
        img.classList.add("message-image"); // 添加样式类

        img.style.display = 'block';
        fileInfo.style.display = 'block';
        messageBubble.appendChild(img); // 将图片添加到消息泡泡
        messageBubble.appendChild(fileInfo); // 将图片添加到消息泡泡

        messageBubble.addEventListener("click", async function () {
            try {
                const message = await getMessageById(id);
                const theContent = message.content;
                const blob = base64ToBlob(theContent, 'application/rar');
                if (blob) {
                    // 创建一个指向 Blob 的 URL
                    const blobURL = URL.createObjectURL(blob);
                    // 创建一个隐藏的 <a> 元素
                    const downloadLink = document.createElement('a');
                    downloadLink.href = blobURL;
                    downloadLink.download = 'download.rar'; // 您可以根据需要更改文件名
                    // 将 <a> 元素添加到文档中
                    document.body.appendChild(downloadLink);
                    // 触发点击事件，启动下载
                    downloadLink.click();
                    var title = "已开始下载";
                    Swal.fire({
                        title: title,
                        icon: 'success',  // 其他选项：'error', 'warning', 'info', 'question'
                        showConfirmButton: false,  // 隐藏确认按钮
                        timer: 1000,  // 设置定时器，2秒后自动关闭
                        timerProgressBar: true,  // 显示进度条
                    });
                    // 移除 <a> 元素并释放 Blob URL
                    document.body.removeChild(downloadLink);
                    URL.revokeObjectURL(blobURL);
                }
            } catch (error) {
                console.error('获取消息内容失败:', error);
            }
        });
    } else if (txtDataUrlPattern.test(messageContent)) {
        //Blob 对象本身由 JavaScript 的垃圾回收机制（Garbage Collector, GC）管理。当没有任何引用指向一个 Blob 时，GC 会自动回收其占用的内存。因此，无需手动释放 Blob 对象。
        const blobSize = getBase64Size(messageContent);
        const formattedSize = formatBytes(blobSize, 2);

        const fileInfo = document.createElement("div"); // 您也可以使用 <span> 或其他元素
        fileInfo.innerHTML = `TXT文件<br>(${formattedSize})`;

        //link.title = `${formattedSize}`;
        const img = document.createElement("img");
        img.src = "../SOURCEFILE/IMAGES/welcome/txt.png";
        img.alt = "文本文件";
        img.classList.add("message-image"); // 添加样式类

        img.style.display = 'block';
        fileInfo.style.display = 'block';
        messageBubble.appendChild(img); // 将图片添加到消息泡泡
        messageBubble.appendChild(fileInfo); // 将图片添加到消息泡泡

        messageBubble.addEventListener("click", async function () {
            try {
                const message = await getMessageById(id);
                const theContent = message.content;
                const blob = base64ToBlob(theContent, 'text/plain');
                if (blob) {
                    // 创建一个指向 Blob 的 URL
                    const blobURL = URL.createObjectURL(blob);
                    // 创建一个隐藏的 <a> 元素
                    const downloadLink = document.createElement('a');
                    downloadLink.href = blobURL;
                    downloadLink.download = 'download.txt'; // 您可以根据需要更改文件名
                    // 将 <a> 元素添加到文档中
                    document.body.appendChild(downloadLink);
                    // 触发点击事件，启动下载
                    downloadLink.click();
                    var title = "已开始下载";
                    Swal.fire({
                        title: title,
                        icon: 'success',  // 其他选项：'error', 'warning', 'info', 'question'
                        showConfirmButton: false,  // 隐藏确认按钮
                        timer: 1000,  // 设置定时器，2秒后自动关闭
                        timerProgressBar: true,  // 显示进度条
                    });
                    // 移除 <a> 元素并释放 Blob URL
                    document.body.removeChild(downloadLink);
                    URL.revokeObjectURL(blobURL);
                }
            } catch (error) {
                console.error('获取消息内容失败:', error);
            }
        });
    } else if (pdfDataUrlPattern.test(messageContent)) {
        //Blob 对象本身由 JavaScript 的垃圾回收机制（Garbage Collector, GC）管理。当没有任何引用指向一个 Blob 时，GC 会自动回收其占用的内存。因此，无需手动释放 Blob 对象。
        const blobSize = getBase64Size(messageContent);
        const formattedSize = formatBytes(blobSize, 2);

        const fileInfo = document.createElement("div"); // 您也可以使用 <span> 或其他元素
        fileInfo.innerHTML = `PDF文件<br>(${formattedSize})`;

        //link.title = `${formattedSize}`;
        const img = document.createElement("img");
        img.src = "../SOURCEFILE/IMAGES/welcome/pdf.png";
        img.alt = "PDF文件";
        img.classList.add("message-image"); // 添加样式类

        img.style.display = 'block';
        fileInfo.style.display = 'block';
        messageBubble.appendChild(img); // 将图片添加到消息泡泡
        messageBubble.appendChild(fileInfo); // 将图片添加到消息泡泡

        messageBubble.addEventListener("click", async function () {
            try {
                const message = await getMessageById(id);
                const theContent = message.content;
                const blob = base64ToBlob(theContent, 'application/pdf');
                if (blob) {
                    // 创建一个指向 Blob 的 URL
                    const blobURL = URL.createObjectURL(blob);
                    // 创建一个隐藏的 <a> 元素
                    const downloadLink = document.createElement('a');
                    downloadLink.href = blobURL;
                    downloadLink.download = 'download.pdf'; // 您可以根据需要更改文件名
                    // 将 <a> 元素添加到文档中
                    document.body.appendChild(downloadLink);
                    // 触发点击事件，启动下载
                    downloadLink.click();
                    var title = "已开始下载";
                    Swal.fire({
                        title: title,
                        icon: 'success',  // 其他选项：'error', 'warning', 'info', 'question'
                        showConfirmButton: false,  // 隐藏确认按钮
                        timer: 1000,  // 设置定时器，2秒后自动关闭
                        timerProgressBar: true,  // 显示进度条
                    });
                    // 移除 <a> 元素并释放 Blob URL
                    document.body.removeChild(downloadLink);
                    URL.revokeObjectURL(blobURL);
                }
            } catch (error) {
                console.error('获取消息内容失败:', error);
            }
        });
    } else if (mp4DataUrlPattern.test(messageContent)) {
        //Blob 对象本身由 JavaScript 的垃圾回收机制（Garbage Collector, GC）管理。当没有任何引用指向一个 Blob 时，GC 会自动回收其占用的内存。因此，无需手动释放 Blob 对象。
        const blobSize = getBase64Size(messageContent);
        const formattedSize = formatBytes(blobSize, 2);

        const fileInfo = document.createElement("div"); // 您也可以使用 <span> 或其他元素
        fileInfo.innerHTML = `MP4文件<br>(${formattedSize})`;

        //link.title = `${formattedSize}`;
        const img = document.createElement("img");
        img.src = "../SOURCEFILE/IMAGES/welcome/play_video.png";
        img.alt = "MP4文件";
        img.classList.add("message-image"); // 添加样式类

        img.style.display = 'block';
        fileInfo.style.display = 'block';
        messageBubble.appendChild(img); // 将图片添加到消息泡泡
        messageBubble.appendChild(fileInfo); // 将图片添加到消息泡泡

        messageBubble.addEventListener("click", async function () {
            try {
                const message = await getMessageById(id);
                const theContent = message.content;
                const blob = base64ToBlob(theContent, 'video/mp4');
                if (blob) {
                    // 创建一个指向 Blob 的 URL
                    const blobURL = URL.createObjectURL(blob);
                    // 创建一个隐藏的 <a> 元素
                    const downloadLink = document.createElement('a');
                    downloadLink.href = blobURL;
                    downloadLink.download = 'download.mp4'; // 您可以根据需要更改文件名
                    // 将 <a> 元素添加到文档中
                    document.body.appendChild(downloadLink);
                    // 触发点击事件，启动下载
                    downloadLink.click();
                    var title = "已开始下载";
                    Swal.fire({
                        title: title,
                        icon: 'success',  // 其他选项：'error', 'warning', 'info', 'question'
                        showConfirmButton: false,  // 隐藏确认按钮
                        timer: 1000,  // 设置定时器，2秒后自动关闭
                        timerProgressBar: true,  // 显示进度条
                    });
                    // 移除 <a> 元素并释放 Blob URL
                    document.body.removeChild(downloadLink);
                    URL.revokeObjectURL(blobURL);
                }
            } catch (error) {
                console.error('获取消息内容失败:', error);
            }
        });
    } else if (mp3DataUrlPattern.test(messageContent)) {
        //Blob 对象本身由 JavaScript 的垃圾回收机制（Garbage Collector, GC）管理。当没有任何引用指向一个 Blob 时，GC 会自动回收其占用的内存。因此，无需手动释放 Blob 对象。
        const blobSize = getBase64Size(messageContent);
        const formattedSize = formatBytes(blobSize, 2);

        const fileInfo = document.createElement("div"); // 您也可以使用 <span> 或其他元素
        fileInfo.innerHTML = `MP3文件<br>(${formattedSize})`;

        //link.title = `${formattedSize}`;
        const img = document.createElement("img");
        img.src = "../SOURCEFILE/IMAGES/welcome/play_mp3.png";
        img.alt = "MP3文件";
        img.classList.add("message-image"); // 添加样式类

        img.style.display = 'block';
        fileInfo.style.display = 'block';
        messageBubble.appendChild(img); // 将图片添加到消息泡泡
        messageBubble.appendChild(fileInfo); // 将图片添加到消息泡泡

        messageBubble.addEventListener("click", async function () {
            try {
                const message = await getMessageById(id);
                const theContent = message.content;
                const blob = base64ToBlob(theContent, 'video/mp4');
                if (blob) {
                    // 创建一个指向 Blob 的 URL
                    const blobURL = URL.createObjectURL(blob);
                    // 创建一个隐藏的 <a> 元素
                    const downloadLink = document.createElement('a');
                    downloadLink.href = blobURL;
                    downloadLink.download = 'download.mp3'; // 您可以根据需要更改文件名
                    // 将 <a> 元素添加到文档中
                    document.body.appendChild(downloadLink);
                    // 触发点击事件，启动下载
                    downloadLink.click();
                    var title = "已开始下载";
                    Swal.fire({
                        title: title,
                        icon: 'success',  // 其他选项：'error', 'warning', 'info', 'question'
                        showConfirmButton: false,  // 隐藏确认按钮
                        timer: 1000,  // 设置定时器，2秒后自动关闭
                        timerProgressBar: true,  // 显示进度条
                    });
                    // 移除 <a> 元素并释放 Blob URL
                    document.body.removeChild(downloadLink);
                    URL.revokeObjectURL(blobURL);
                }
            } catch (error) {
                console.error('获取消息内容失败:', error);
            }
        });
    }
    else {
        // 否则，按文本处理
        messageBubble.innerHTML = replaceEmojiCodes(messageContent);
        //replaceEmojiCodes(text)

        messageBubble.addEventListener("click", async function () {
            // 使用 Clipboard API 将文本复制到剪贴板
            navigator.clipboard.writeText(messageContent).then(function () {
                console.log('消息已复制到剪贴板');
                var title = "消息已复制到剪贴板";
                Swal.fire({
                    title: title,
                    icon: 'success',  // 其他选项：'error', 'warning', 'info', 'question'
                    showConfirmButton: false,  // 隐藏确认按钮
                    timer: 1000,  // 设置定时器，2秒后自动关闭
                    timerProgressBar: true,  // 显示进度条
                });
            }).catch(function (err) {
                console.error('无法复制消息：', err);
            });
        });

    }
    //messageBubble.textContent = `${messageContent}`;  // 设置消息内容
    if (senderAccount == account) {
        messageWrapper.classList.add("message", "message-right");  // 本方消息靠右
        messageWrapper.appendChild(messageBubble);  // 将消息泡泡添加到消息包装器
        messageWrapper.appendChild(avatar);  // 将消息泡泡添加到消息包装器
        messages.appendChild(messageWrapper);  // 将消息包装器添加到消息容器
    } else {
        messageWrapper.classList.add("message", "message-left");  // 对方消息靠左
        messageWrapper.appendChild(avatar);  // 将消息泡泡添加到消息包装器
        messageWrapper.appendChild(messageBubble);  // 将消息泡泡添加到消息包装器
        messages.appendChild(messageWrapper);  // 将消息包装器添加到消息容器
    }
}

//添加联系人项
function addContantItem(contactList, userAccount, userName, fileType, base64Data) {
    const contactItem = document.createElement("div");  // 创建一个新的联系人元素
    contactItem.id = userAccount; // 联系人项 id
    contactItem.classList.add("contact-item");  // 添加样式类

    // 创建一个容器来包裹头像和红点
    const avatarContainer = document.createElement("div");
    avatarContainer.id = userAccount + "avatarContainer"; // 设置唯一的 id
    avatarContainer.classList.add("avatar-container"); // 添加样式类

    //存储头像
    const avatarKey = userAccount + "avatar"; //头像 键
    const avatarData = `data:${fileType};base64,${base64Data}`; // 将 Base64 数据加上 data URL 前缀
    mySessionStorage[avatarKey] = avatarData;//sessionStorage.setItem(avatarKey, avatarData);
    mySessionStorage[userAccount + "counter"] = "0"; //计数器归0
    console.log("头像已存储到 mySessionStorage");

    //设置头像
    const storedAvatar = mySessionStorage[userAccount + "avatar"];//获取头像
    const avatar = document.createElement("img");
    avatar.id = userAccount + "img";
    avatar.src = storedAvatar;  // 根据发送方账号设置头像图片路径
    avatar.alt = "头像";
    avatar.classList.add("avatar");  // 添加头像样式类

    // 将头像添加到容器中
    avatarContainer.appendChild(avatar);

    // 创建一个用户信息的容器
    const userInfo = document.createElement("div");
    userInfo.classList.add("user-info");  // 添加样式类
    userInfo.innerHTML = `<div class="user-name">${userName}</div><div class="user-account">${userAccount}</div>`;

    if (userAccount != account) {  // 如果联系人不是当前用户
        contactItem.appendChild(avatarContainer);
        contactItem.appendChild(userInfo);
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

function command_loginSuccessfully(blocks) {
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
}

function command_usersList(blocks) {
    const contactList = document.getElementById("contactList");  // 获取联系人列表的DOM元素
    contactList.innerHTML = "";  // 清空现有的联系人列表

    for (let i = 1; i < blocks.length; i += 4) {  // 遍历联系人列表
        const userAccount = blocks[i];  // 获取用户账号
        const userName = blocks[i + 1];  // 获取用户昵称
        const fileType = blocks[i + 2];  //获取文件类型
        const base64Data = blocks[i + 3]; //获取文件编码
        addContantItem(contactList, userAccount, userName, fileType, base64Data);
    }
}

async function command_messageFrom(blocks) {
    console.log("收到消息");  // 打印收到消息信息
    const receiverAccount = account;  // 当前接收消息的用户
    const senderAccount = blocks[1];  // 获取发送方账号
    const messageContent = blocks[2];  // 获取消息内容
    const id = await saveMessage(senderAccount, receiverAccount, messageContent);
    const chatWith = sessionStorage.getItem('chatwith');
    if (chatWith !== null && chatWith !== '') {
        if (senderAccount == chatWith) {  // 检查收到的消息是否属于当前会话
            addMessage(id, senderAccount, messageContent, true);
            setTimeout(() => {
                const messagesTmp = document.getElementById("messages");
                messagesTmp.scrollTop = messagesTmp.scrollHeight;  // 滚动到最新消息
            }, 0);
        } else {
            var counter = parseInt(mySessionStorage[senderAccount + "counter"]);
            counter = counter + 1;
            mySessionStorage[senderAccount + "counter"] = counter;//sessionStorage.setItem(senderAccount + "counter", counter);
            showRedDot(senderAccount, counter);
        }
    }
    else {
        var counter = parseInt(mySessionStorage[senderAccount + "counter"]);
        counter = counter + 1;
        mySessionStorage[senderAccount + "counter"] = counter;//sessionStorage.setItem(senderAccount + "counter", counter);
        showRedDot(senderAccount, counter);
    }
}

function command_myAvatar(blocks) {
    const fileType = blocks[1];
    console.log("文件类型：" + fileType);
    const base64Data = blocks[2];
    const avatarKey = "myAvatar";
    const avatarData = `data:${fileType};base64,${base64Data}`; // 将 Base64 数据加上 data URL 前缀
    mySessionStorage[avatarKey] = avatarData;//sessionStorage.setItem(avatarKey, avatarData);
    console.log("头像已存储到 mySessionStorage");//console.log("头像已存储到 sessionStorage");
}

async function command_messageConfirm(blocks) {
    //信息确认 
    console.log("信息确认");
    const receiverAccount = blocks[1];
    console.log(receiverAccount);
    const base64String = blocks[2];
    const id = await saveMessage(account, receiverAccount, base64String);  // 保存消息到本地//saveMessageToLocal(senderAccount, receiverAccount, base64String);  // 保存消息到本地
    addMessage(id, account, base64String, true);
    setTimeout(() => {
        const messagesTmp = document.getElementById("messages");
        messagesTmp.scrollTop = messagesTmp.scrollHeight;  // 滚动到最新消息
    }, 0);
    //const fileType = blocks[1];
    //console.log("文件类型：" + fileType);
    //const base64Data = blocks[2];
    //const avatarKey = "myAvatar";
    //const avatarData = `data:${fileType};base64,${base64Data}`; // 将 Base64 数据加上 data URL 前缀
    //mySessionStorage[avatarKey] = avatarData;//sessionStorage.setItem(avatarKey, avatarData);
    //console.log("头像已存储到 mySessionStorage");//console.log("头像已存储到 sessionStorage");
}

// 处理消息
function process(fullMessage) {
    const blocks = fullMessage.split(DELIMITER);  // 使用分隔符拆分消息
    const command = blocks[0];  // 获取消息的命令
    console.log("收到命令" + command);  // 打印收到的命令

    if (command == "loginSuccessfully") {  // 如果命令是登录成功
        command_loginSuccessfully(blocks);
    } else if (command == "usersList") {  // 如果命令是用户列表
        command_usersList(blocks);
    } else if (command == "messageFrom") {  // 如果命令是收到消息
        command_messageFrom(blocks);
    }
    else if (command == "myAvatar") {
        command_myAvatar(blocks);
    } else if (command == "messageConfirm") {
        command_messageConfirm(blocks);
    }
}

//处理消息显示逻辑
function showMessages(messages) {

    const messagesContainer = document.getElementById("messages");  // 获取消息容器DOM元素
    messagesContainer.innerHTML = "";  // 清空消息容器
    messages.forEach(message => {  // 遍历每条消息
        addMessage(message.id, message.sender, message.content, false);
    });


    //messagesContainer.scrollTop = messagesContainer.scrollHeight;  // 滚动到最新消息
    setTimeout(() => {
        const imagesToObserve = messagesContainer.querySelectorAll('.message-observe');
        console.log(`Found ${imagesToObserve.length} images to observe`);
        imagesToObserve.forEach(img => {
            imgObserver.observe(img);
        });

        const messagesTmp = document.getElementById("messages");
        messagesTmp.scrollTop = messagesTmp.scrollHeight;  // 滚动到最新消息
    }, 0);
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

// 页面加载完成时的事件监听器
document.addEventListener("DOMContentLoaded", function () {

    const contactList = document.getElementById("contactList");  // 获取联系人列表DOM元素
    const messages = document.getElementById("messages");  // 获取消息容器DOM元素
    const messageInput = document.getElementById("messageInput");  // 获取消息输入框DOM元素
    const sendButton = document.getElementById("sendButton");  // 获取发送按钮DOM元素
    const menuButton = document.getElementById("menuButton");  // 获取菜单按钮DOM元素
    const exitButton = document.getElementById("exitButton");  // 获取退出按钮DOM元素
    const fileButton = document.getElementById("fileButton");  // 获取文件按钮DOM元素
    const customMenu = document.getElementById('customMenu');  //菜单
    //myEmojiButton
    const myEmojiButton = document.getElementById('myEmojiButton');//按钮

    const emojiTable = document.getElementById('emojiTable');  //菜单
    const emojiButton = document.getElementById('emojiButton');  //菜单
    const eTable = document.getElementById('eTable');  //菜单

    const superEmojiTable = document.getElementById('superEmojiTable');  //菜单
    const superEmojiButton = document.getElementById('superEmojiButton');  //菜单
    const superETable = document.getElementById('superETable');  //菜单

    document.getElementById("input-area").style.visibility = "hidden";  // 隐藏输入区域
    document.getElementById("tools").style.visibility = "hidden";  // 隐藏工具区域

    //emojiButton

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
        img.classList.add("normalEmoji");  // 添加样式类
        td.appendChild(img); // 将图片添加到单元格
        row.appendChild(td); // 将单元格添加到行

        // 每当达到一行的emoji数量限制，或者这是最后一个emoji时，添加行到表格
        if ((index + 1) % emojisPerRow === 0 || index === Object.entries(emojiMap).length - 1) {
            eTable.appendChild(row); // 将行添加到表格
            row = document.createElement('tr'); // 创建新的行
        }
    });
    document.querySelectorAll('.normalEmoji').forEach(img => {
        img.addEventListener('click', function () {
            emojiTable.classList.toggle('hidden'); // 切换emojitable的显示状态
            const currentText = messageInput.value;  // 获取当前输入框的值
            const cursorPosition = messageInput.selectionStart;  // 获取光标位置
            const emojiText = '[' + img.alt + ']';  // 要插入的表情文本

            // 将表情文本插入到光标位置
            messageInput.value = currentText.substring(0, cursorPosition)
                + emojiText
                + currentText.substring(cursorPosition);

            // 更新光标位置到插入表情文本之后
            const newCursorPosition = cursorPosition + emojiText.length;
            messageInput.setSelectionRange(newCursorPosition, newCursorPosition);

            // 聚焦到输入框
            messageInput.focus();
        });
    });

    emojiTable.appendChild(eTable); // 将表格添加到emojiTable容器

    emojiButton.addEventListener("click", function () {
        emojiTable.classList.toggle('hidden'); // 切换emojitable的显示状态

        if (emojiTable.classList.contains('hidden')) {
            return;
        }// 如果emojiTable是隐藏的，则不需要定位

        const buttonRect = emojiButton.getBoundingClientRect(); // 获取emojiButton的位置以定位emojiTable
        // 设置样式以定位emojiTable
        emojiTable.style.left = `${buttonRect.left + window.scrollX + buttonRect.width / 2}px`;
        emojiTable.style.bottom = `${window.innerHeight - (buttonRect.top + window.scrollY)}px`; // 使用bottom属性
    });

    //超级表情
    let row_s = document.createElement('tr');
    Object.entries(emojiMap).forEach(([key, value], index) => {
        // 为每个emoji创建一个单元格
        const td = document.createElement('td');
        const img = document.createElement('img');
        img.src = value;
        img.alt = key.replace(/]$/, '').replace(/\[/g, '');
        img.classList.add("superEmoji");  // 添加样式类
        img.style.width = '30px'; // 设置图片大小
        img.style.height = '30px'; // 设置图片大小
        td.appendChild(img); // 将图片添加到单元格
        row_s.appendChild(td); // 将单元格添加到行

        // 每当达到一行的emoji数量限制，或者这是最后一个emoji时，添加行到表格
        if ((index + 1) % emojisPerRow === 0 || index === Object.entries(emojiMap).length - 1) {
            superETable.appendChild(row_s); // 将行添加到表格
            row_s = document.createElement('tr'); // 创建新的行
        }
    });
    document.querySelectorAll('.superEmoji').forEach(img => {
        img.addEventListener('click', function () {
            superEmojiTable.classList.toggle('hidden'); // 切换emojitable的显示状态
            const command = "sendSuperEmoji";
            const senderAccount = account;  // 获取发送方账号
            const receiverAccount = sessionStorage.getItem('chatwith');  // 获取接收方账号
            const payload = [command, senderAccount, receiverAccount, img.alt];  // 定义包含登录和账号信息的消息
            const multiLinePayload = payload.join(DELIMITER);  // 用特定的分隔符连接消息
            sendMessageToServer(multiLinePayload);  // 发送消息到服务器
        });
    });

    superEmojiTable.appendChild(superETable); // 将表格添加到emojiTable容器

    superEmojiButton.addEventListener("click", function () {
        superEmojiTable.classList.toggle('hidden'); // 切换emojitable的显示状态

        if (superEmojiTable.classList.contains('hidden')) {
            return;
        }// 如果emojiTable是隐藏的，则不需要定位

        const buttonRect = superEmojiButton.getBoundingClientRect(); // 获取emojiButton的位置以定位emojiTable
        // 设置样式以定位emojiTable
        superEmojiTable.style.left = `${buttonRect.left + window.scrollX + buttonRect.width / 2}px`;
        superEmojiTable.style.bottom = `${window.innerHeight - (buttonRect.top + window.scrollY)}px`; // 使用bottom属性
    });

    // 监听右键点击事件
    document.addEventListener('contextmenu', function (event) {
        // 检查点击的目标元素是否有指定类 'bubble' 或者其父元素具有该类
        const targetElement = event.target;
        const bubbleParent = targetElement.closest('.bubble'); // 检查是否有父类 'bubble'

        if (bubbleParent) {
            event.preventDefault(); // 阻止默认的右键菜单
            //message-left
            selectedBubbleId = bubbleParent.id; // 获取对应的 id
            console.log('选中的元素 ID:', selectedBubbleId);
            customMenu.style.display = 'block';
            const targetElementTmp = event.target;
            const bubbleParentTmp = targetElementTmp.closest('.message-left'); // 检查是否有父类 'bubble'
            if (bubbleParentTmp) {
                // 设置自定义菜单的位置
                customMenu.style.left = `${event.pageX}px`;
                customMenu.style.top = `${event.pageY}px`;
            } else {
                // 设置自定义菜单的位置
                customMenu.style.left = `${event.pageX - customMenu.offsetWidth}px`;
                customMenu.style.top = `${event.pageY}px`;
            }
        } else {
            // 如果点击的不是特定类的元素，隐藏自定义菜单，并显示默认菜单
            customMenu.style.display = 'none';
        }
    });

    // 隐藏自定义菜单
    document.addEventListener('click', function () {
        customMenu.style.display = 'none';
    });

    // 为菜单项添加点击事件
    document.getElementById('menuItem1').addEventListener('click', async function () {
        if (selectedBubbleId) {
            let cleanId = selectedBubbleId.replace('messageBubble:', '').trim();
            const elementToRemove = document.getElementById("messageWrapper:" + cleanId);  // 获取要移除的元素
            if (elementToRemove) {
                // 1. 添加淡出类，触发过渡效果
                elementToRemove.classList.add('fade-out');

                // 2. 使用 setTimeout 等待过渡完成后移除元素（0.5s 是过渡时间）
                setTimeout(() => {
                    messages.removeChild(elementToRemove);  // 从父元素中移除指定的子元素
                }, 500);  // 等待 500ms，即动画完成后移除

                // 3. 同步移除 IndexedDB 中的消息
                await deleteMessageById(cleanId);
            }
        } else {
            alert('没有选中任何 .bubble 元素');
        }
    });

    //文件按钮监听
    fileButton.addEventListener('click', function () {
        document.getElementById('fileInput').click();
    });
    document.getElementById('fileInput').addEventListener('change', async function (event) {
        const file = event.target.files[0];
        var base64String;
        if (file) {
            console.log('已选择文件：', file.name);
            console.log('文件类型：', file.type);
            // 检查文件大小是否为0
            if (file.size === 0) {
                var title = "文件内容不能为空";
                Swal.fire({
                    title: title,
                    icon: 'error',  // 其他选项：'error', 'warning', 'info', 'question'
                    confirmButtonText: '确定',
                });
                return;  // 终止后续处理
            }

            if (validTypes.includes(file.type)) {
                const fileType = file.type; // 或者使用 file.name.split('.').pop() 获取后缀
                // 创建 FileReader 对象来读取文件
                const reader = new FileReader();
                console.log('已创建读取器');
                // 当 FileReader 完成读取时的回调
                reader.onload = async function (e) {
                    console.log('读取完成');
                    base64String = e.target.result; // 获取 base64 编码的字符串
                    const command = "sendMessage";  // 定义发送消息的命令
                    const senderAccount = account;  // 获取发送方账号
                    const receiverAccount = sessionStorage.getItem('chatwith');  // 获取接收方账号
                    const payload = [command, senderAccount, receiverAccount, base64String];  // 定义包含登录和账号信息的消息
                    const multiLinePayload = payload.join(DELIMITER);  // 用特定的分隔符连接消息
                    sendMessageToServer(multiLinePayload);  // 发送消息到服务器
                    console.log("发送消息");  // 打印消息发送信息
                    const id = await saveMessage(senderAccount, receiverAccount, base64String);  // 保存消息到本地//saveMessageToLocal(senderAccount, receiverAccount, base64String);  // 保存消息到本地
                    addMessage(id, senderAccount, base64String, true);
                    setTimeout(() => {
                        const messagesTmp = document.getElementById("messages");
                        messagesTmp.scrollTop = messagesTmp.scrollHeight;  // 滚动到最新消息
                    }, 0);
                };
                reader.readAsDataURL(file);
            }
            else {
                var title = "不支持的文件格式";
                Swal.fire({
                    title: title,
                    icon: 'error',  // 其他选项：'error', 'warning', 'info', 'question'
                    confirmButtonText: '确定',
                });
            }
            document.getElementById('fileInput').value = "";
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
    sendButton.addEventListener("click", async function () {
        const message = messageInput.value.trim();  // 获取并清理消息输入框中的内容
        if (message) {
            messageInput.value = "";  // 清空输入框
            const command = "sendMessage";  // 定义发送消息的命令
            const senderAccount = account;  // 获取发送方账号
            const receiverAccount = sessionStorage.getItem('chatwith');  // 获取接收方账号
            const payload = [command, senderAccount, receiverAccount, message];  // 定义包含登录和账号信息的消息
            const multiLinePayload = payload.join(DELIMITER);  // 用特定的分隔符连接消息
            sendMessageToServer(multiLinePayload);  // 发送消息到服务器
            console.log("发送消息");  // 打印消息发送信息
            const id = await saveMessage(senderAccount, receiverAccount, message);  // 保存消息到本地//saveMessageToLocal(senderAccount, receiverAccount, message);  // 保存消息到本地
            if (message) {  // 如果消息不为空
                addMessage(id, senderAccount, message, true);
                setTimeout(() => {
                    const messagesTmp = document.getElementById("messages");
                    messagesTmp.scrollTop = messagesTmp.scrollHeight;  // 滚动到最新消息
                }, 0);
            }
        }
        else {
            messageInput.value = "";  // 清空输入框
            var title = "消息不能为空";
            Swal.fire({
                title: title,
                icon: 'error',  // 其他选项：'error', 'warning', 'info', 'question'
                confirmButtonText: '确定',
            });
        }
    });

    document.getElementById('emojiFileInput').addEventListener('change', async function (event) {
        const file = event.target.files[0];
        var base64String;
        if (file) {
            console.log('已选择文件：', file.name);
            console.log('文件类型：', file.type);
            // 检查文件大小是否为0
            if (file.size === 0) {
                var title = "文件内容不能为空";
                Swal.fire({
                    title: title,
                    icon: 'error',  // 其他选项：'error', 'warning', 'info', 'question'
                    confirmButtonText: '确定',
                });
                return;  // 终止后续处理
            }

            if (gifValidTypes.includes(file.type)) {
                const fileType = file.type; // 或者使用 file.name.split('.').pop() 获取后缀
                // 创建 FileReader 对象来读取文件
                const reader = new FileReader();
                console.log('已创建表情读取器');
                // 当 FileReader 完成读取时的回调
                reader.onload = async function (e) {
                    console.log('读取完成');
                    base64String = e.target.result; // 获取 base64 编码的字符串
                    //const id = await saveMessage(senderAccount, receiverAccount, base64String);  // 保存消息到本地//saveMessageToLocal(senderAccount, receiverAccount, base64String);  // 保存消息到本地
                    //addMessage(id, senderAccount, base64String, true);
                    //setTimeout(() => {
                        //const messagesTmp = document.getElementById("messages");
                        //messagesTmp.scrollTop = messagesTmp.scrollHeight;  // 滚动到最新消息
                    //}, 0);
                };
                reader.readAsDataURL(file);
            }
            else {
                var title = "不支持的文件格式";
                Swal.fire({
                    title: title,
                    icon: 'error',  // 其他选项：'error', 'warning', 'info', 'question'
                    confirmButtonText: '确定',
                });
            }
            document.getElementById('fileInput').value = "";
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
    document.getElementById("feature6").addEventListener("click", function () {
        dropdownContent.classList.toggle("show");  // 切换显示状态的类
    });
});

