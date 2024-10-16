// 硬编码的AES密钥，使用Uint8Array表示，确保是32字节长度
const rawKey = new Uint8Array([
    0x00, 0x11, 0x22, 0x33,
    0x44, 0x55, 0x66, 0x77,
    0x88, 0x99, 0xAA, 0xBB,
    0xCC, 0xDD, 0xEE, 0xFF,
    0x00, 0x11, 0x22, 0x33,
    0x44, 0x55, 0x66, 0x77,
    0x88, 0x99, 0xAA, 0xBB,
    0xCC, 0xDD, 0xEE, 0xFF
]);

// 硬编码的IV (Initialization Vector), 使用12字节的Uint8Array表示
const iv = new Uint8Array([
    0x01, 0x02, 0x03, 0x04,
    0x05, 0x06, 0x07, 0x08,
    0x09, 0x0A, 0x0B, 0x0C
]);

// 将原始字节数组形式的AES密钥导入为CryptoKey对象
async function importKey(rawKey) {
    return await window.crypto.subtle.importKey(
        "raw",                 // 密钥为原始字节数组格式
        rawKey,                // Uint8Array格式的AES密钥
        { name: "AES-GCM" },   // 指定加密算法为AES-GCM
        false,                 // 设置为密钥不可导出
        ["encrypt", "decrypt"] // 指定该密钥可用于加密和解密
    );
}

// 将字符串转为Uint8Array字节数组，用于加密时将明文字符串转换成字节
function stringToUint8Array(str) {
    const encoder = new TextEncoder(); // 使用TextEncoder进行编码
    return encoder.encode(str); // 将字符串转换为Uint8Array
}

// 将Uint8Array字节数组转为字符串，用于解密后的数据还原为可读明文
function uint8ArrayToString(bytes) {
    const decoder = new TextDecoder(); // 使用TextDecoder进行解码
    return decoder.decode(bytes); // 将Uint8Array解码为字符串
}

// 将 Uint8Array 转换为 Base64 编码字符串，便于传输
function uint8ArrayToBase64(uint8Array) {
    let binaryString = ''; // 用于存储字节数组转换后的二进制字符串
    for (let i = 0; i < uint8Array.length; i++) {
        binaryString += String.fromCharCode(uint8Array[i]); // 将每个字节转换为对应字符
    }
    return btoa(binaryString); // 使用Base64编码转换二进制字符串
}

// 将 Base64 编码字符串转换为 Uint8Array，便于解密时还原数据
function base64ToUint8Array(base64String) {
    const binaryString = atob(base64String); // 使用Base64解码
    const uint8Array = new Uint8Array(binaryString.length); // 创建等长的Uint8Array
    for (let i = 0; i < binaryString.length; i++) {
        uint8Array[i] = binaryString.charCodeAt(i); // 将每个字符的Unicode值转为对应字节
    }
    return uint8Array; // 返回解码后的Uint8Array
}

// 使用AES-GCM算法加密消息
async function encryptMessage(message, key, iv) {
    const encodedMessage = stringToUint8Array(message); // 将明文字符串转换为字节数组
    const encrypted = await window.crypto.subtle.encrypt(
        {
            name: "AES-GCM", // 加密算法为AES-GCM
            iv: iv           // 使用固定的IV进行加密
        },
        key,                 // 使用导入的CryptoKey对象
        encodedMessage       // 要加密的字节数组
    );
    const encryptedArray = new Uint8Array(encrypted); // 将加密结果转换为Uint8Array
    return uint8ArrayToBase64(encryptedArray); // 将加密结果转换为Base64字符串并返回
}

// 解密 Base64 编码的加密字符串
async function decryptMessage(encryptedMessageBase64, key, iv) {
    const encryptedArray = base64ToUint8Array(encryptedMessageBase64); // 将Base64字符串转换为Uint8Array
    const decrypted = await window.crypto.subtle.decrypt(
        {
            name: "AES-GCM", // 解密算法为AES-GCM
            iv: iv           // 使用相同的IV进行解密
        },
        key,                 // 使用导入的CryptoKey对象
        encryptedArray       // 要解密的字节数组
    );
    return uint8ArrayToString(new Uint8Array(decrypted)); // 将解密结果转换为字符串并返回
}
