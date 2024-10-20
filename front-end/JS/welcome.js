// welcome.js

let db; // 数据库
var key; //密钥
let selectedBubbleId = null; // 用来存储选中的 .bubble 元素的 ID
var account = sessionStorage.getItem('account'); // 从sessionStorage中获取当前登录的账号
// 保存用户信息到本地
let userEmail = "";
let userPhoneNumber = "";
let userName = "";
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
const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/x-icon', 'image/gif', 'application/x-zip-compressed', 'application/x-compressed', 'text/plain', 'video/mp4', 'audio/mpeg', 'application/pdf']; // 定义允许的类型
const avatarValidTypes = ['image/png', 'image/jpeg', 'image/jpg']; // 定义允许的类型
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

// 获取并删除特定会话的所有消息
function deleteMessagesForConversation(account, chatwith) {
    let transaction = db.transaction(['messages'], 'readwrite');
    let objectStore = transaction.objectStore('messages');

    // 打开游标以遍历所有消息
    let request = objectStore.openCursor();

    request.onsuccess = function (event) {
        let cursor = event.target.result;
        if (cursor) {
            let message = cursor.value;
            // 检查消息是否属于当前会话
            if ((message.sender === account && message.receiver === chatwith) ||
                (message.sender === chatwith && message.receiver === account)) {
                // 删除该消息
                let deleteRequest = cursor.delete();
                deleteRequest.onsuccess = function () {
                    console.log(`消息已删除，ID: ${message.id}`);
                };
                deleteRequest.onerror = function (event) {
                    console.error('删除消息时出错：', event.target.error);
                };
            }
            cursor.continue(); // 继续下一个游标项
        } else {
            // 如果游标遍历完成，执行回调函数
            console.log('会话中所有消息已删除');
        }
    };
}

function deleteAllMessages() {
    let transaction = db.transaction(['messages'], 'readwrite');
    let objectStore = transaction.objectStore('messages');

    // 打开游标以遍历所有消息
    let request = objectStore.openCursor();

    request.onsuccess = function (event) {
        let cursor = event.target.result;
        if (cursor) {
            let message = cursor.value;
            // 检查消息是否属于当前会话
            let deleteRequest = cursor.delete();
            deleteRequest.onsuccess = function () {
                console.log(`消息已删除，ID: ${message.id}`);
            };
            deleteRequest.onerror = function (event) {
                console.error('删除消息时出错：', event.target.error);
            };
            cursor.continue(); // 继续下一个游标项
        } else {
            // 如果游标遍历完成，执行回调函数
            console.log('所有消息已删除');
        }
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

function base64ToBlob(base64) {
    const base64Types = [
        { prefix: 'data:application/x-zip-compressed;base64,', mimeType: 'application/x-zip-compressed' },
        { prefix: 'data:application/x-compressed;base64,', mimeType: 'application/x-compressed' },
        { prefix: 'data:image/png;base64,', mimeType: 'image/png' },
        { prefix: 'data:image/jpeg;base64,', mimeType: 'image/jpeg' },
        { prefix: 'data:image/jpg;base64,', mimeType: 'image/jpg' },
        { prefix: 'data:image/PNG;base64,', mimeType: 'image/png' },
        { prefix: 'data:image/JEPG;base64,', mimeType: 'image/jpeg' },
        { prefix: 'data:image/JPG;base64,', mimeType: 'image/jpg' },
        { prefix: 'data:image/x-icon;base64,', mimeType: 'image/x-icon' },
        { prefix: 'data:image/gif;base64,', mimeType: 'image/gif' },
        { prefix: 'data:text/plain;base64,', mimeType: 'text/plain' },
        { prefix: 'data:video/mp4;base64,', mimeType: 'video/mp4' },
        { prefix: 'data:audio/mpeg;base64,', mimeType: 'audio/mpeg' },
        { prefix: 'data:application/pdf;base64,', mimeType: 'application/pdf' }
    ];

    let mimeType = null;

    // Detect and remove the appropriate prefix
    for (let type of base64Types) {
        if (base64.startsWith(type.prefix)) {
            base64 = base64.substring(type.prefix.length);
            mimeType = type.mimeType;
            break;
        }
    }

    if (!mimeType) {
        console.error('Unrecognized Base64 format');
        return null;
    }

    // Clean up non-base64 characters
    base64 = base64.replace(/[^A-Za-z0-9+/=]/g, '');

    // Pad the base64 string if its length is not a multiple of 4
    while (base64.length % 4 !== 0) {
        base64 += '=';
    }

    let byteCharacters;
    try {
        byteCharacters = atob(base64);
    } catch (error) {
        console.error('Failed to decode Base64 string:', error);
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
const imgObserver = new IntersectionObserver(async (entries, observer) => {
    for (const entry of entries) {
        if (entry.isIntersecting) {
            const img = entry.target;
            // 获取唯一的 ID
            const uniqueId = Number(img.dataset.srcId);
            if (!uniqueId) {
                //observer.unobserve(img);
                continue;
            }
            console.log(img.tagName);
            if (img.tagName === 'IMG') {
                loadImg(img, uniqueId, observer);
            } else if (img.tagName === 'VIDEO') {
                loadVideo(img, uniqueId, observer);
            }
        }
    }
}, {
    // 预加载的阈值
    threshold: 1
});

// 异步加载 Base64 音频
async function loadAudio(audioPlayer, id) {
    try {
        const message = await getMessageById(id);
        // 异步创建 Blob 对象
        const blob = base64ToBlob(message.content);
        if (blob) {
            // 创建一个指向 Blob 的 URL
            const blobURL = URL.createObjectURL(blob);
            audioPlayer.src = blobURL;
        }
    } catch (error) {
        console.error("Error loading audio:", error);
    }
}

// 异步加载 Base64 视频
async function loadVideo(video, id, observer) {
    try {
        const message = await getMessageById(id);
        // 异步创建 Blob 对象
        const blob = base64ToBlob(message.content);
        if (blob) {
            // 创建一个指向 Blob 的 URL
            const blobURL = URL.createObjectURL(blob);
            video.src = blobURL;
            video.classList.add("fade-in");  // 添加淡入效果的类
            console.log("视频加载完成");
            observer.unobserve(video);
            console.log("停止观测");
        }
    } catch (error) {
        console.error("Error loading video:", error);
    }
}

// 异步加载 Base64 音频
async function loadImg(img, id, observer) {
    // 异步获取消息内容
    try {
        const message = await getMessageById(id);

        const blob = base64ToBlob(message.content);
        if (blob) {
            // 创建一个指向 Blob 的 URL
            const blobURL = URL.createObjectURL(blob);
            img.src = blobURL;
            img.classList.add("fade-in");  // 添加淡入效果的类
            console.log("图片加载完成");
            observer.unobserve(img);
            console.log("停止观测");
        }

        const messages = document.getElementById("messages");
        const lastMessage = messages.lastElementChild;
        if (img.closest('.message') === lastMessage) {
            console.log("是最后一个消息");
            const messagesContainer = document.getElementById("messages");
            messagesContainer.scrollTop = messagesContainer.scrollHeight; // 滚动到最底部
        }
    } catch (error) {
        console.error('获取消息内容失败:', error);
    }
}

// 异步加载 Base64 音频
async function loadAvatar(avatar, senderAccount) {
    // 异步获取消息内容
    try {
        const storedURL = mySessionStorage[senderAccount + "avatar"];
        avatar.src = storedURL;
        avatar.classList.add("fade-in");  // 添加淡入效果的类
    } catch (error) {
        console.error('头像设置失败:', error);
    }
}

//添加消息 针对大量资源添加.setAttribute('aria-hidden', 'true');尤为关键
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
    loadAvatar(avatar, senderAccount);
    //const storedAvatar = mySessionStorage[senderAccount + "avatar"];
    //avatar.src = storedAvatar;  // 根据发送方账号设置头像图片路径
    avatar.alt = "头像";
    avatar.classList.add("avatar");  // 添加头像样式类
    if (imageDataUrlPattern.test(messageContent)) {
        const img = document.createElement("img");
        //img.dataset.src = messageContent;  // 设置 data-src 属性用于懒加载
        img.dataset.srcId = id;
        console.log("srcID：" + img.dataset.srcId);
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
        messageBubble.addEventListener('click', async function (e) {
            //e.preventDefault()
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
                const blob = base64ToBlob(theContent);
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
                const blob = base64ToBlob(theContent);
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
                const blob = base64ToBlob(theContent);
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
                const blob = base64ToBlob(theContent);
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
        //由于是视频，输入法不读
        //1.懒加载
        //2.样式美化
        //3.输入法不可读 --- 不用处理
        const video = document.createElement("video");
        video.controls = true;
        //video.src = messageContent;
        //loadVideo(video,id);
        video.dataset.srcId = id;
        video.classList.add("message-observe");
        if (shouldObserve) {
            // 使用 IntersectionObserver 观察图片元素
            imgObserver.observe(video);  // 开始懒加载观察
        }
        video.classList.add("item");
        messageBubble.appendChild(video); // 将图片添加到消息泡泡

        video.addEventListener('click', async function (e) {
            e.preventDefault()
            video.requestFullscreen();
        })
    } else if (mp3DataUrlPattern.test(messageContent)) {
        //Blob 对象本身由 JavaScript 的垃圾回收机制（Garbage Collector, GC）管理。当没有任何引用指向一个 Blob 时，GC 会自动回收其占用的内存。因此，无需手动释放 Blob 对象。
        // 创建 Shadow DOM，确保内部的 HTML 独立

        const shadowRoot = messageBubble.attachShadow({ mode: 'open' });

        // 将你的 HTML 动态插入到 Shadow DOM 中
        const theHtml = `
    <style>
        /* 这里的样式仅作用于 Shadow DOM 内部 */
        .audio-container {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background-color: transparent;
            padding: 10px;
            border-radius: 12px;
            width: 200px;
            max-width: 220px;
            margin: 0 auto;
            position: relative;
        }

        #playButton {
            background-color: #ff4081;
            background: radial-gradient(circle at 30% 30%, #ff80ab, #ff4081);
            border: none;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            color: white;
            font-size: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            transition: transform 0.2s, box-shadow 0.2s;
        }

        #playButton:hover {
            transform: scale(1.05);
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
        }

        .progress-container {
            flex-grow: 1;
            margin-left: 10px;
            height: 10px;
            background-color: rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            position: relative;
            overflow: hidden;
            cursor: pointer;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .progress-bar {
            height: 100%;
            background: linear-gradient(90deg, #00aaff, #ff4081);
            width: 0;
            border-radius: 8px;
            transition: width 0.2s ease-out;
            box-shadow: 0 0 15px rgba(255, 64, 129, 0.7), 0 0 30px rgba(0, 170, 255, 0.7);
        }

        .time {
            font-size: 12px;
            color: white;
            margin-left: 10px;
            font-family: 'Roboto', sans-serif;
            white-space: nowrap;
        }

        #downloadButton {
            position: absolute;
            bottom: -10px;
            right: -10px;
            background-color: transparent;
            border: none;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            color: white;
            font-size: 16px;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            transition: transform 0.2s, box-shadow 0.2s;
        }

        #downloadButton:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
        }
    </style>
    <div class="audio-container">
        <button id="playButton">⬇</button>
        <div class="progress-container" id="progressContainer">
            <div class="progress-bar" id="progressBar"></div>
        </div>
        <div class="time" id="currentTime">0:00</div>
        <button id="downloadButton">⬇</button>
        <audio id="audioPlayer" style="display:none;">
            <source type="audio/mp3">
        </audio>
    </div>
`;

        // 将 HTML 插入到 Shadow DOM 中
        shadowRoot.innerHTML = theHtml;

        const playButton = shadowRoot.getElementById('playButton');
        const audioPlayer = shadowRoot.getElementById('audioPlayer');
        const progressBar = shadowRoot.getElementById('progressBar');
        const currentTimeDisplay = shadowRoot.getElementById('currentTime');
        const progressContainer = shadowRoot.getElementById('progressContainer');
        const downloadButton = shadowRoot.getElementById('downloadButton');
        downloadButton.style.display = 'none';
        downloadButton.addEventListener("click", async function () {
            try {
                const message = await getMessageById(id);
                const theContent = message.content;
                const blob = base64ToBlob(theContent);
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

        audioPlayer.addEventListener('canplaythrough', () => {
            console.log('音频加载完成');
            // 开始播放音频
            downloadButton.style.display = 'block';
            playButton.textContent = '▶';  // 改为播放符号
        });

        // 播放/暂停功能
        playButton.addEventListener('click', function () {
            if (audioPlayer.paused) {
                if (audioPlayer.readyState === 0) {
                    loadAudio(audioPlayer, id)
                } else {
                    audioPlayer.play();
                    playButton.textContent = '❚❚';  // 改为暂停符号
                }
            } else {
                audioPlayer.pause();
                playButton.textContent = '▶';  // 改为播放符号
            }
        });

        // 更新进度条和当前播放时间
        audioPlayer.addEventListener('timeupdate', function () {
            const progressPercent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
            progressBar.style.width = progressPercent + '%';

            const minutes = Math.floor(audioPlayer.currentTime / 60);
            const seconds = Math.floor(audioPlayer.currentTime % 60).toString().padStart(2, '0');
            currentTimeDisplay.textContent = `${minutes}:${seconds}`;
        });

        // 允许拖动进度条来调整播放进度
        progressContainer.addEventListener('click', function (e) {
            const containerWidth = progressContainer.offsetWidth;
            const clickX = e.offsetX;
            const newTime = (clickX / containerWidth) * audioPlayer.duration;
            audioPlayer.currentTime = newTime;
        });

        // 播放结束后重置按钮和进度条
        audioPlayer.addEventListener('ended', function () {
            playButton.textContent = '▶';  // 恢复为播放符号
            progressBar.style.width = '0';
            currentTimeDisplay.textContent = '0:00';
        });
    }
    else {
        // 否则，按文本处理
        if (messageContent == "[大爆炸]") {
            const iframe = document.createElement('iframe');
            iframe.src = '../HTML/explode.html';
            iframe.setAttribute('width', '200'); // 设置宽度为800像素
            iframe.setAttribute('height', '100'); // 设置高度为600像素
            messageBubble.appendChild(iframe);
        } else if (messageContent == "[黑客帝国]") {
            const iframe = document.createElement('iframe');
            iframe.src = '../HTML/Matrix.html';
            iframe.setAttribute('width', '200'); // 设置宽度为800像素
            iframe.setAttribute('height', '100'); // 设置高度为600像素
            messageBubble.appendChild(iframe);
        } else if (messageContent == "[我爱你]") {
            const iframe = document.createElement('iframe');
            iframe.src = '../HTML/heart.html';
            iframe.setAttribute('width', '200'); // 设置宽度为800像素
            iframe.setAttribute('height', '100'); // 设置高度为600像素
            messageBubble.appendChild(iframe);
        } else {
            messageContent = messageContent.replace(/\n/g, '<br>');
            //防止恶意攻击
            const shadowRoot = messageBubble.attachShadow({ mode: 'open' });
            const theHtml = replaceEmojiCodes(messageContent);
            shadowRoot.innerHTML = theHtml;
            messageBubble.addEventListener("click", async function () {
                try {
                    // 获取要复制的内容
                    const message = await getMessageById(id);
                    const theContent = message.content;
                    const contentToCopy = theContent; // 如果需要保持换行，转换回来

                    // 复制内容到剪贴板
                    await navigator.clipboard.writeText(contentToCopy);

                    var title = "已复制内容到剪贴板";
                    Swal.fire({
                        title: title,
                        icon: 'success',  // 其他选项：'error', 'warning', 'info', 'question'
                        showConfirmButton: false,  // 隐藏确认按钮
                        timer: 1000,  // 设置定时器，2秒后自动关闭
                        timerProgressBar: true,  // 显示进度条
                    });

                } catch (err) {
                    console.error("无法复制内容到剪贴板", err);
                }
            });
        }
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

//异步加载联系人头像
async function loadContentAvatar(avatar, avatarKey, avatarData) {
    const blob = base64ToBlob(avatarData);
    if (blob) {
        // 创建一个指向 Blob 的 URL
        const blobURL = URL.createObjectURL(blob);
        mySessionStorage[avatarKey] = blobURL;
        avatar.src = blobURL;  // 根据发送方账号设置头像图片路径
    }
}

//添加联系人项
function addContactItem(contactList, userAccount, userName, fileType, base64Data) {
    const contactItem = document.createElement("div");  // 创建一个新的联系人元素
    contactItem.id = userAccount + "contactItem"; // 联系人项 id
    contactItem.classList.add("contact-item");  // 添加样式类

    // 创建一个容器来包裹头像和红点
    const avatarContainer = document.createElement("div");
    avatarContainer.id = userAccount + "avatarContainer"; // 设置唯一的 id
    avatarContainer.classList.add("avatar-container"); // 添加样式类

    //存储头像
    const avatarKey = userAccount + "avatar"; //头像 键
    const avatarData = `data:image/${fileType};base64,${base64Data}`; // 将 Base64 数据加上 data URL 前缀
    //mySessionStorage[avatarKey] = avatarData;
    mySessionStorage[userAccount + "counter"] = "0"; //计数器归0
    console.log("头像已存储到 mySessionStorage");

    //设置头像
    const avatar = document.createElement("img");
    avatar.id = userAccount + "img";
    loadContentAvatar(avatar, avatarKey, avatarData);
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
        contactItem.addEventListener("click", async function () {
            startConversation(userAccount, userName);  // 点击联系人后开始对话
            mySessionStorage[userAccount + "counter"] = "0";//sessionStorage.setItem(userAccount + "counter", 0);
            //待处理 移除红点
            removeRedDot(userAccount);
        });
    }
}

function addRequestItem(requestList, userAccount, userName, fileType, base64Data) {
    const requestItem = document.createElement("div");  // 创建一个新的联系人元素
    requestItem.id = userAccount + "requestItem"; // 联系人项 id
    requestItem.classList.add("request-item");  // 添加样式类

    // 创建一个容器来包裹头像和红点
    const avatarContainer = document.createElement("div");
    avatarContainer.id = "request" + userAccount + "avatarContainer"; // 设置唯一的 id
    avatarContainer.classList.add("avatar-container"); // 添加样式类

    //存储头像
    const avatarKey = userAccount + "avatar"; //头像 键
    const avatarData = `data:image/${fileType};base64,${base64Data}`; // 将 Base64 数据加上 data URL 前缀

    //设置头像
    const avatar = document.createElement("img");
    avatar.id = "request" + userAccount + "img";
    const blob = base64ToBlob(avatarData);
    if (blob) {
        // 创建一个指向 Blob 的 URL
        const blobURL = URL.createObjectURL(blob);
        mySessionStorage[avatarKey] = blobURL;
        avatar.src = blobURL;  // 根据发送方账号设置头像图片路径
    }
    avatar.alt = "头像";
    avatar.classList.add("avatar");  // 添加头像样式类

    // 将头像添加到容器中
    avatarContainer.appendChild(avatar);

    // 创建一个用户信息的容器
    const userInfo = document.createElement("div");
    userInfo.classList.add("user-info");  // 添加样式类
    userInfo.innerHTML = `<div class="user-name">${userName}</div><div class="user-account">${userAccount}</div>`;

    if (userAccount != account) {  // 如果联系人不是当前用户
        requestItem.appendChild(avatarContainer);
        requestItem.appendChild(userInfo);
        requestList.appendChild(requestItem);  // 将联系人元素添加到联系人列表

        // 为联系人添加点击事件
        requestItem.addEventListener("click", async function () {
            Swal.fire({
                title: '你确定要添加对方为好友吗?',
                text: "点击确定后同意！",
                icon: 'question',
                showCancelButton: true,  // 显示取消按钮
                confirmButtonColor: '#3085d6',  // 确定按钮的颜色
                cancelButtonColor: '#d33',  // 取消按钮的颜色
                confirmButtonText: '确定',
                cancelButtonText: '拒绝'
            }).then((result) => {
                if (result.isConfirmed) {
                    console.log("同意");
                    removeRequestItem(userAccount);
                    const command = "acceptFriend";  // 定义发送消息的命令
                    const senderAccount = account;  // 获取发送方账号
                    const receiverAccount = userAccount;
                    const payload = [command, senderAccount, receiverAccount];  // 定义包含登录和账号信息的消息
                    const multiLinePayload = payload.join(DELIMITER);  // 用特定的分隔符连接消息
                    sendMessageToServer(multiLinePayload);  // 发送消息到服务器
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                    // 用户点击了 "否" 按钮，不执行函数
                    console.log("不同意");
                    removeRequestItem(userAccount);
                    const command = "rejectFriend";  // 定义发送消息的命令
                    const senderAccount = account;  // 获取发送方账号
                    const receiverAccount = userAccount;
                    const payload = [command, senderAccount, receiverAccount];  // 定义包含登录和账号信息的消息
                    const multiLinePayload = payload.join(DELIMITER);  // 用特定的分隔符连接消息
                    sendMessageToServer(multiLinePayload);  // 发送消息到服务器
                }
            });
        });
    }
}

function command_loginSuccessfully(blocks) {
    const receiverAccount = blocks[1];  // 获取接收方账号
    const receiverUsername = blocks[2];  // 获取接收方昵称
    const receiverEmail = blocks[3];  // 获取接收方邮箱
    const receiverTelephone = blocks[4];  // 获取接收方电话
    userEmail = receiverEmail;
    userPhoneNumber = receiverTelephone;
    userName = receiverUsername;
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
        addContactItem(contactList, userAccount, userName, fileType, base64Data);
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
    const avatarKey = account + "avatar";
    const avatarData = `data:image/${fileType};base64,${base64Data}`; // 将 Base64 数据加上 data URL 前缀
    console.log("头像已存储到 mySessionStorage");//console.log("头像已存储到 sessionStorage");
    //document.getElementById("avatar")
    const blob = base64ToBlob(avatarData);
    if (blob) {
        // 创建一个指向 Blob 的 URL
        const blobURL = URL.createObjectURL(blob);
        mySessionStorage[avatarKey] = blobURL;
        document.getElementById("avatar").src = blobURL;
    }
}

function command_setAvatar(blocks) {
    const fileType = blocks[1];
    console.log("文件类型：" + fileType);
    const base64Data = blocks[2];
    const avatarKey = account + "avatar";
    const avatarData = `data:image/${fileType};base64,${base64Data}`; // 将 Base64 数据加上 data URL 前缀
    console.log("头像已存储到 mySessionStorage");//console.log("头像已存储到 sessionStorage");
    //document.getElementById("avatar")
    const blob = base64ToBlob(avatarData);
    if (blob) {
        // 创建一个指向 Blob 的 URL
        const blobURL = URL.createObjectURL(blob);
        mySessionStorage[avatarKey] = blobURL;
        document.getElementById("avatar").src = blobURL;
    }
    var title = "修改成功";
    Swal.fire({
        title: title,
        icon: 'success',  // 其他选项：'error', 'warning', 'info', 'question'
        confirmButtonText: '确定'
    });
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
}

async function command_requestList(blocks) {
    const requestList = document.getElementById("requestList");  // 获取联系人列表的DOM元素
    requestList.innerHTML = "";  // 清空现有的联系人列表

    for (let i = 1; i < blocks.length; i += 4) {  // 遍历联系人列表
        const userAccount = blocks[i];  // 获取用户账号
        const userName = blocks[i + 1];  // 获取用户昵称
        const fileType = blocks[i + 2];  //获取文件类型
        const base64Data = blocks[i + 3]; //获取文件编码
        addRequestItem(requestList, userAccount, userName, fileType, base64Data)
    }
}

async function command_sendMessageError(blocks) {
    const receiverAccount = blocks[1];
    var title = "你和" + receiverAccount + "还不是好友";
    Swal.fire({
        title: title,
        icon: 'error',  // 其他选项：'error', 'warning', 'info', 'question'
        confirmButtonText: '确定'
    });
}

async function command_searchForUser(blocks) {
    const command_s = blocks[1];
    if (command_s == "null") {
        var title = "你搜索的账号不存在";
        Swal.fire({
            title: title,
            icon: 'error',  // 其他选项：'error', 'warning', 'info', 'question'
            confirmButtonText: '确定'
        });
    } else if (command_s == "yourself") {
        var title = "你不能搜索自己";
        Swal.fire({
            title: title,
            icon: 'error',  // 其他选项：'error', 'warning', 'info', 'question'
            confirmButtonText: '确定'
        });
    } else if (command_s == "already") {
        var title = "您已发送过请求";
        Swal.fire({
            title: title,
            icon: 'warning',  // 其他选项：'error', 'warning', 'info', 'question'
            confirmButtonText: '确定'
        });
    } else if (command_s == "pleaseHandel") {
        var title = "对方已请求添加你为好友，请尽快处理";
        Swal.fire({
            title: title,
            icon: 'warning',  // 其他选项：'error', 'warning', 'info', 'question'
            confirmButtonText: '确定'
        });
    } else if (command_s == "requestSuccessfully") {
        var title = "请求成功";
        Swal.fire({
            title: title,
            icon: 'success',  // 其他选项：'error', 'warning', 'info', 'question'
            confirmButtonText: '确定'
        });
    }
}

async function command_newRequest(blocks) {
    const requestList = document.getElementById("requestList");  // 获取联系人列表的DOM元素
    for (let i = 1; i < blocks.length; i += 4) {  // 遍历联系人列表
        const userAccount = blocks[i];  // 获取用户账号
        const userName = blocks[i + 1];  // 获取用户昵称
        const fileType = blocks[i + 2];  //获取文件类型
        const base64Data = blocks[i + 3]; //获取文件编码
        addRequestItem(requestList, userAccount, userName, fileType, base64Data);
        var title = "你收到了" + userAccount + "的好友请求";
        Swal.fire({
            title: title,
            icon: 'info',  // 其他选项：'error', 'warning', 'info', 'question'
            confirmButtonText: '确定'
        });
    }
}

async function command_newFriend(blocks) {
    const contactList = document.getElementById("contactList");  // 获取联系人列表的DOM元素
    for (let i = 1; i < blocks.length; i += 4) {  // 遍历联系人列表
        const userAccount = blocks[i];  // 获取用户账号
        const userName = blocks[i + 1];  // 获取用户昵称
        const fileType = blocks[i + 2];  //获取文件类型
        const base64Data = blocks[i + 3]; //获取文件编码
        addContactItem(contactList, userAccount, userName, fileType, base64Data);
        var title = "你和" + userAccount + "成为了好友";
        Swal.fire({
            title: title,
            icon: 'info',  // 其他选项：'error', 'warning', 'info', 'question'
            confirmButtonText: '确定'
        });
    }
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
    } else if (command == "setAvatar") {
        command_setAvatar(blocks);
    } else if (command == "requestList") {
        command_requestList(blocks);
    } else if (command == "sendMessageError") {
        command_sendMessageError(blocks);
    } else if (command == "searchForUser") {
        command_searchForUser(blocks);
    } else if (command == "newRequest") {
        command_newRequest(blocks);
    } else if(command == "newFriend"){
        command_newFriend(blocks);
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
async function startConversation(chatwith, username) {
    const chatArea = document.querySelector(".chat-area");  // 获取聊天区域
    const userInfo = document.querySelector(".user-info2");
    const passwordArea = document.querySelector(".passwordArea");
    const requestdArea = document.querySelector(".requestdArea");
    const addFriendArea = document.querySelector(".addFriendArea");
    chatArea.style.display = "flex";  // 显示聊天区域
    userInfo.style.display = "none"; // 隐藏用户信息区域
    passwordArea.style.display = "none";  // 隐藏修改密码区域
    requestdArea.style.display = "none";  // 隐藏修改密码区域
    addFriendArea.style.display = "none";  //隐藏

    document.getElementById("input-area").style.visibility = "visible";  // 显示输入区域
    document.getElementById("tools").style.visibility = "visible";  // 显示工具区域
    document.getElementById("messages").innerHTML = "";  // 清空输入框
    document.getElementById("messageInput").value = "";  // 清空输入框
    sessionStorage.setItem('chatwith', chatwith);  // 存储当前对话的联系人账号
    const contactName = document.getElementById("contactName");  // 获取联系人名称DOM元素
    const contactAccount = document.getElementById("contactAccount");  // 获取联系人账号DOM元素
    contactName.textContent = username;  // 设置联系人名称
    contactAccount.textContent = `${chatwith}`;  // 设置联系人账号
    getMessagesForConversation(account, chatwith, showMessages); // 显示消息
    console.log("开始与账号 " + chatwith + " 的对话");  // 打印对话信息
}

//删除好友项
async function removeContactItem(userAccount) {
    const id = userAccount + "contactItem";
    const contactList = document.getElementById("contactList");
    const contactItems = contactList.getElementsByClassName("contact-item");
    for (let item of contactItems) {
        if (item.id === id) {
            contactList.removeChild(item);
            break;
        }
    }
}

//删除请求项
async function removeRequestItem(userAccount) {
    const id = userAccount + "requestItem";
    const requestList = document.getElementById("requestList");
    const requestItems = requestList.getElementsByClassName("request-item");
    for (let item of requestItems) {
        if (item.id === id) {
            requestList.removeChild(item);
            break;
        }
    }
}

async function deleteFriend(account, chatWith) {
    const command = "deleteFriend";  // 定义发送消息的命令
    const senderAccount = account;  // 获取发送方账号
    const receiverAccount = chatWith;
    const payload = [command, senderAccount, receiverAccount];  // 定义包含登录和账号信息的消息
    const multiLinePayload = payload.join(DELIMITER);  // 用特定的分隔符连接消息
    sendMessageToServer(multiLinePayload);  // 发送消息到服务器
}

// 页面加载完成时的事件监听器
document.addEventListener("DOMContentLoaded", function () {

    const menuButton = document.getElementById("menuButton");  // 获取菜单按钮DOM元素
    const exitButton = document.getElementById("exitButton");  // 获取退出按钮DOM元素
    const contactList = document.getElementById("contactList");  // 获取联系人列表DOM元素
    const requestList = document.getElementById("requestList");  // 获取联系人列表DOM元素
    const chatArea = document.querySelector(".chat-area");  // 获取聊天区域
    const messages = document.getElementById("messages");  // 获取消息容器DOM元素
    const tools = document.getElementById("tools");  // 工具区域
    const fileButton = document.getElementById("fileButton");  // 获取文件按钮DOM元素
    const deleteMessageButton = document.getElementById("deleteMessageButton");
    const deleteFriendButton = document.getElementById("deleteFriendButton");
    const input_area = document.getElementById("input-area");  // 隐藏输入区域
    const messageInput = document.getElementById("messageInput");  // 获取消息输入框DOM元素
    const sendButton = document.getElementById("sendButton");  // 获取发送按钮DOM元素
    const customMenu = document.getElementById('customMenu');  // 右键菜单
    const userInfo = document.querySelector(".user-info2");
    const passwordArea = document.querySelector(".passwordArea");
    const requestArea = document.querySelector(".requestdArea");
    const addFriendArea = document.querySelector(".addFriendArea");
    const changesForm = document.getElementById("changesForm");
    const changePasswordForm = document.getElementById("changePasswordForm");
    const avatar = document.getElementById("avatar");

    const userEmailInput = document.getElementById("userEmail");
    const userPhoneInput = document.getElementById("userPhoneInput");
    const userNicknameInput = document.getElementById("userNicknameInput");
    const oldPassword = document.getElementById("oldPassword");
    const newPassword = document.getElementById("newPassword");
    const newPassword_confirm = document.getElementById("newPassword_confirm");
    const addFriendAccount = document.getElementById("addFriendAccount");


    const emojiTable = document.getElementById('emojiTable');  //菜单
    const emojiButton = document.getElementById('emojiButton');  //菜单
    const eTable = document.getElementById('eTable');  //菜单
    const superEmojiTable = document.getElementById('superEmojiTable');  //菜单
    const superEmojiButton = document.getElementById('superEmojiButton');  //菜单
    const superETable = document.getElementById('superETable');  //菜单

    //changePasswordForm.classList.add('show');

    //聊天区域不显示
    chatArea.style.display = "none";

    userEmailInput.oninvalid = function () {
        this.setCustomValidity('请输入邮箱');  // 设置自定义的无效提示信息
    };
    userEmailInput.oninput = function () {
        this.setCustomValidity('');  // 清除自定义的无效提示信息
    };
    userPhoneInput.oninvalid = function () {
        this.setCustomValidity('请输入电话号');  // 设置自定义的无效提示信息
    };
    userPhoneInput.oninput = function () {
        this.setCustomValidity('');  // 清除自定义的无效提示信息
    };
    userNicknameInput.oninvalid = function () {
        this.setCustomValidity('请输入用户名');  // 设置自定义的无效提示信息
    };
    userNicknameInput.oninput = function () {
        this.setCustomValidity('');  // 清除自定义的无效提示信息
    };
    oldPassword.oninvalid = function () {
        this.setCustomValidity('请输入旧密码');  // 设置自定义的无效提示信息
    };
    oldPassword.oninput = function () {
        this.setCustomValidity('');  // 清除自定义的无效提示信息
    };
    newPassword.oninvalid = function () {
        this.setCustomValidity('请输入新密码');  // 设置自定义的无效提示信息
    };
    newPassword.oninput = function () {
        this.setCustomValidity('');  // 清除自定义的无效提示信息
    };
    newPassword_confirm.oninvalid = function () {
        this.setCustomValidity('请确认新密码');  // 设置自定义的无效提示信息
    };
    newPassword_confirm.oninput = function () {
        this.setCustomValidity('');  // 清除自定义的无效提示信息
    };
    addFriendAccount.oninvalid = function () {
        this.setCustomValidity('请输入账号');  // 设置自定义的无效提示信息
    };
    addFriendAccount.oninput = function () {
        this.setCustomValidity('');  // 清除自定义的无效提示信息
    };

    deleteMessageButton.addEventListener("click", function () {
        Swal.fire({
            title: '你确定要删除当前会话所有聊天记录吗?',
            text: "该操作无法撤销！",
            icon: 'warning',
            showCancelButton: true,  // 显示取消按钮
            confirmButtonColor: '#3085d6',  // 确定按钮的颜色
            cancelButtonColor: '#d33',  // 取消按钮的颜色
            confirmButtonText: '确定',
            cancelButtonText: '否'
        }).then((result) => {
            if (result.isConfirmed) {
                // 如果用户点击了 "确定" 按钮，执行函数
                //executeFunction();
                console.log("执行操作");
                document.getElementById("messages").innerHTML = "";  // 清空输入框
                const chatWith = sessionStorage.getItem('chatwith');
                deleteMessagesForConversation(account, chatWith);
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                // 用户点击了 "否" 按钮，不执行函数
                console.log("操作取消，不执行任何操作");
            }
        });
    });
    //deleteFriendButton
    deleteFriendButton.addEventListener("click", function () {
        Swal.fire({
            title: '你确定要删除当前好友吗?',
            text: "该操作无法撤销！",
            icon: 'warning',
            showCancelButton: true,  // 显示取消按钮
            confirmButtonColor: '#3085d6',  // 确定按钮的颜色
            cancelButtonColor: '#d33',  // 取消按钮的颜色
            confirmButtonText: '确定',
            cancelButtonText: '否'
        }).then((result) => {
            if (result.isConfirmed) {
                // 如果用户点击了 "确定" 按钮，执行函数
                //executeFunction();
                console.log("执行操作");
                //document.getElementById("messages").innerHTML = "";  // 清空输入框
                const chatWith = sessionStorage.getItem('chatwith');
                deleteMessagesForConversation(account, chatWith);
                document.querySelectorAll('.contact-item').forEach(i => i.classList.remove('selected'));
                removeContactItem(chatWith);
                deleteFriend(account, chatWith);
                //deleteMessagesForConversation(account,chatWith);
                chatArea.style.display = "none";
                userInfo.style.display = "none"; // 隐藏用户信息区域
                passwordArea.style.display = "none";  // 隐藏修改密码区域
                requestArea.style.display = "none";
                addFriendArea.style.display = "none";
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                // 用户点击了 "否" 按钮，不执行函数
                console.log("操作取消，不执行任何操作");
            }
        });
    });
    //寻找好友
    searchForUserButton.addEventListener("click", function () {
        const theAccount = addFriendAccount.value;
        if (theAccount == "") {
            var title = "账号不能为空";
            Swal.fire({
                title: title,
                icon: 'error',  // 其他选项：'error', 'warning', 'info', 'question'
                confirmButtonText: '确定'
            });
        } else {
            const command = "searchForUser";  // 定义发送消息的命令
            const senderAccount = account;  // 获取发送方账号
            const receiverAccount = theAccount;
            const payload = [command, senderAccount, receiverAccount];  // 定义包含登录和账号信息的消息
            const multiLinePayload = payload.join(DELIMITER);  // 用特定的分隔符连接消息
            sendMessageToServer(multiLinePayload);  // 发送消息到服务器
        }
    });
    avatar.addEventListener("click", function () {
        console.log("修改头像");  // 打印对话信息
        document.getElementById('avatarInput').click();
    });
    document.getElementById('avatarInput').addEventListener('change', async function (event) {
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
            if (avatarValidTypes.includes(file.type)) {
                const reader = new FileReader();
                console.log('已创建读取器');
                // 当 FileReader 完成读取时的回调
                reader.onload = async function (e) {
                    console.log('读取完成');
                    base64String = e.target.result; // 获取 base64 编码的字符串
                    const command = "setAvatar";  // 定义发送消息的命令
                    const senderAccount = account;  // 获取发送方账号
                    const payload = [command, senderAccount, base64String];  // 定义包含登录和账号信息的消息
                    const multiLinePayload = payload.join(DELIMITER);  // 用特定的分隔符连接消息
                    sendMessageToServer(multiLinePayload);  // 发送消息到服务器
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

    const emojisPerRow = 4;
    let row = document.createElement('tr');
    Object.entries(emojiMap).forEach(([key, value], index) => {
        // 为每个emoji创建一个单元格
        const td = document.createElement('td');
        const img = document.createElement('img');
        img.src = value;
        img.alt = key.replace(/]$/, '').replace(/\[/g, '');
        img.style.width = '32px'; // 设置图片大小
        img.style.height = '32px'; // 设置图片大小
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
        img.style.width = '32px'; // 设置图片大小
        img.style.height = '32px'; // 设置图片大小
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
    fileButton.addEventListener('click', async function () {
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

    // 使用事件委托监听点击事件
    /*requestList.addEventListener('click', (event) => {
        // 使用 closest 查找点击的目标是否为 .contact-item 或其子元素
        const requestItem = event.target.closest('.request-item');

        // 如果找到了 contact-item 元素，继续处理
        if (requestItem) {
            // 移除所有联系项的 'selected' 类
            document.querySelectorAll('.request-item').forEach(i => i.classList.remove('selected'));

            // 为当前点击的联系项添加 'selected' 类
            requestItem.classList.add('selected');

        }
    });*/



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
        // 判断聊天区域是否显示
        if (userInfo.style.display === "none") {
            // 隐藏修改密码区域
            passwordArea.style.display = "none";
            // 隐藏聊天区域
            chatArea.style.display = "none";
            requestArea.style.display = "none";
            addFriendArea.style.display = "none";
            // 显示用户信息区域
            userInfo.style.display = "flex";
            // 填充用户信息
            changesForm.classList.add('show');
            document.getElementById("userAccount").innerText = account;
            document.getElementById("userEmail").value = userEmail;
            document.getElementById("userPhoneInput").value = userPhoneNumber;
            document.getElementById("userNicknameInput").value = userName;

        } else {

            // 如果聊天区域已经隐藏，可以选择执行其他操作或切换回来
            chatArea.style.display = "flex";  // 显示聊天区域
            userInfo.style.display = "none"; // 隐藏用户信息区域
            requestArea.style.display = "none";
            addFriendArea.style.display = "none";
            passwordArea.style.display = "none";  // 隐藏修改密码区域

        }
    });

    document.getElementById("feature2").addEventListener("click", function () {
        //alert("功能 2 被点击");  // 弹出提示框 // 使用其他逻辑替换
        dropdownContent.classList.toggle("show");  // 切换显示状态的类
        //addFriendArea
        if (addFriendArea.style.display === "none") {
            // 隐藏聊天区域
            chatArea.style.display = "none";
            // 显示用户信息区域
            userInfo.style.display = "none";
            addFriendArea.style.display = "flex";
            passwordArea.style.display = "none";
            // 显示修改密码区域
            requestArea.style.display = "none";
        } else {
            // 如果聊天区域和用户信息区域已经隐藏，可以选择执行其他操作或切换回来
            chatArea.style.display = "flex";  // 显示聊天区域
            userInfo.style.display = "none"; // 隐藏用户信息区域
            passwordArea.style.display = "none";  // 隐藏修改密码区域
            requestArea.style.display = "none";
            addFriendArea.style.display = "none";
        }
    });

    document.getElementById("feature3").addEventListener("click", function () {
        //alert("功能 3 被点击");  // 弹出提示框 // 使用其他逻辑替换
        dropdownContent.classList.toggle("show");  // 切换显示状态的类
        // 判断聊天区域和用户信息区域是否显示,
        if (requestArea.style.display === "none") {
            // 隐藏聊天区域
            chatArea.style.display = "none";
            // 显示用户信息区域
            userInfo.style.display = "none";
            addFriendArea.style.display = "none";
            passwordArea.style.display = "none";
            // 显示修改密码区域
            requestArea.style.display = "flex";
        } else {
            // 如果聊天区域和用户信息区域已经隐藏，可以选择执行其他操作或切换回来
            chatArea.style.display = "flex";  // 显示聊天区域
            userInfo.style.display = "none"; // 隐藏用户信息区域
            passwordArea.style.display = "none";  // 隐藏修改密码区域
            requestArea.style.display = "none";
            addFriendArea.style.display = "none";
        }
    });
    document.getElementById("feature4").addEventListener("click", function () {
        contactList.classList.toggle('collapsed');  //向左收回按钮
        dropdownContent.classList.toggle("show");  // 切换显示状态的类
    });
    document.getElementById("feature5").addEventListener("click", function () {
        //聊天区域不显示
        chatArea.style.display = "none";
        userInfo.style.display = "none"; // 隐藏用户信息区域
        passwordArea.style.display = "none";  // 隐藏修改密码区域
        requestArea.style.display = "none";
        addFriendArea.style.display = "none";
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
        // 判断聊天区域和用户信息区域是否显示,
        if (passwordArea.style.display === "none") {
            // 隐藏聊天区域
            chatArea.style.display = "none";
            // 显示用户信息区域
            userInfo.style.display = "none";
            addFriendArea.style.display = "none";
            requestArea.style.display = "none";
            // 显示修改密码区域
            passwordArea.style.display = "flex";
            changePasswordForm.classList.add('show');
        } else {
            // 如果聊天区域和用户信息区域已经隐藏，可以选择执行其他操作或切换回来
            chatArea.style.display = "flex";  // 显示聊天区域
            userInfo.style.display = "none"; // 隐藏用户信息区域
            requestArea.style.display = "none";
            addFriendArea.style.display = "none";
            passwordArea.style.display = "none";  // 隐藏修改密码区域
        }
    });
    document.getElementById("feature7").addEventListener("click", function () {
        dropdownContent.classList.toggle("show");  // 切换显示状态的类
        Swal.fire({
            title: '你确定要销毁所有聊天记录吗?',
            text: "该操作无法撤销！",
            icon: 'warning',
            showCancelButton: true,  // 显示取消按钮
            confirmButtonColor: '#3085d6',  // 确定按钮的颜色
            cancelButtonColor: '#d33',  // 取消按钮的颜色
            confirmButtonText: '确定',
            cancelButtonText: '否'
        }).then((result) => {
            if (result.isConfirmed) {
                // 如果用户点击了 "确定" 按钮，执行函数
                //executeFunction();
                console.log("执行操作");
                document.getElementById("messages").innerHTML = "";  // 清空输入框
                deleteAllMessages();
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                // 用户点击了 "否" 按钮，不执行函数
                console.log("操作取消，不执行任何操作");
            }
        });
    });

});


document.getElementById('changesForm').addEventListener('submit', function (event) {
    event.preventDefault();  // 阻止表单的默认提交行为，防止页面刷新或跳转

    const userId = account;
    const newName = document.getElementById('userNicknameInput').value;  // 获取新用户名输入框中的值
    const newEmail = document.getElementById('userEmail').value;  // 获取新邮箱输入框中的值
    const newPhoneNumber = document.getElementById('userPhoneInput').value;  // 获取新电话号码输入框中的值

    console.log("用户ID:" + userId + "新用户名:" + newName + "新邮箱:" + newEmail + "新电话号码:" + newPhoneNumber);  // 打印用户信息
    // 构建要发送的请求数据对象
    const data = {
        userId: userId,  // 用户ID字段
        newName: newName,   // 新用户名字段
        newEmail: newEmail,  // 新邮箱字段
        newPhoneNumber: newPhoneNumber  // 新电话号码字段
    };

    // 使用 Fetch API 向服务器发送异步请求
    fetch('http://localhost:8080/api/updateInfo', {  // 注册接口的完整 URL
        method: 'POST',  // 请求方法为 POST，表示向服务器提交数据
        headers: {
            'Content-Type': 'application/json'  // 设置请求头，指定请求体的格式为 JSON
        },
        body: JSON.stringify(data)  // 将 JavaScript 对象转换为 JSON 字符串，作为请求体发送
    })
        .then(response => response.text())  // 将服务器返回的响应转换为文本格式
        .then(result => {

            if (result == "yes") {
                userEmail = newEmail;
                userPhoneNumber = newPhoneNumber;
                userName = newName;
                var title = "修改成功";
                Swal.fire({
                    title: title,
                    icon: 'success',  // 其他选项：'error', 'warning', 'info', 'question'
                    confirmButtonText: '确定'
                });
            } else {
                var title = "错误，用户不存在";
                Swal.fire({
                    title: title,
                    icon: 'error',  // 其他选项：'error', 'warning', 'info', 'question'
                    confirmButtonText: '确定'
                });
            }

        })
        .catch(error => {
            console.error('Error:', error);  // 在控制台输出错误信息，便于调试
            var title = "网络超时，请重试";
            Swal.fire({
                title: title,
                icon: 'error',  // 其他选项：'error', 'warning', 'info', 'question'
                confirmButtonText: '确定'
            });
        });
});




document.getElementById('changePasswordForm').addEventListener('submit', function (event) {
    event.preventDefault();  // 阻止表单的默认提交行为，防止页面刷新或跳转

    const id = account;  // 获取用户ID                                                                                                   
    const oldpassword = document.getElementById('oldPassword').value;  // 获取旧密码输入框中的值
    const newPassword = document.getElementById('newPassword').value;  // 获取新密码输入框中的值
    const newPassword_confirm = document.getElementById('newPassword_confirm').value;  // 获取确认新密码输入框中的值

    if (newPassword != newPassword_confirm) {  // 检查两次输入的密码是否一致
        var title = "两次密码输入不一致";
        Swal.fire({
            title: title,
            icon: 'error',  // 其他选项：'error', 'warning', 'info', 'question'
            confirmButtonText: '确定'
        });
        return;  // 阻止表单提交
    }

    const data = {
        id: id,  // 用户ID字段
        oldPassword: oldpassword,  // 旧密码字段
        newPassword: newPassword,  // 新密码字段
        newPassword_confirm: newPassword_confirm  // 确认新密码字段
    };



    // 使用 Fetch API 向服务器发送异步请求
    fetch('http://localhost:8080/api/updatePassword', {  // 注册接口的完整 URL
        method: 'POST',  // 请求方法为 POST，表示向服务器提交数据
        headers: {
            'Content-Type': 'application/json'  // 设置请求头，指定请求体的格式为 JSON
        },
        body: JSON.stringify(data)  // 将 JavaScript 对象转换为 JSON 字符串，作为请求体发送
    })
        .then(response => response.text())  // 将服务器返回的响应转换为文本格式
        .then(result => {

            if (result == "yes") {
                var title = "修改成功";
                Swal.fire({
                    title: title,
                    icon: 'success',  // 其他选项：'error', 'warning', 'info', 'question'
                    confirmButtonText: '确定'
                });
            } else if (result == "wrong") {
                var title = "原密码错误";
                Swal.fire({
                    title: title,
                    icon: 'error',  // 其他选项：'error', 'warning', 'info', 'question'
                    confirmButtonText: '确定'
                });
            } else {
                var title = "错误，用户不存在";
                Swal.fire({
                    title: title,
                    icon: 'error',  // 其他选项：'error', 'warning', 'info', 'question'
                    confirmButtonText: '确定'
                });
            }

        })
        .catch(error => {
            console.error('Error:', error);  // 在控制台输出错误信息，便于调试
            var title = "网络超时，请重试";
            Swal.fire({
                title: title,
                icon: 'error',  // 其他选项：'error', 'warning', 'info', 'question'
                confirmButtonText: '确定'
            });
        });
});