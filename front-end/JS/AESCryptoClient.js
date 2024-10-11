// 硬编码的AES密钥，使用Uint8Array表示
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

// 硬编码的IV，确保类型为Uint8Array
const iv = new Uint8Array([
    0x01, 0x02, 0x03, 0x04,
    0x05, 0x06, 0x07, 0x08,
    0x09, 0x0A, 0x0B, 0x0C
]);

// 将AES密钥导入为CryptoKey对象
async function importKey(rawKey) {
    return await window.crypto.subtle.importKey(
        "raw",                 // 原始字节数组格式的密钥
        rawKey,                // Uint8Array 格式的密钥
        { name: "AES-GCM" },   // 指定AES-GCM算法
        false,                 // 密钥不可导出
        ["encrypt", "decrypt"] // 密钥的用途：加密和解密
    );
}

// 将字符串转为字节数组
function stringToUint8Array(str) {
    const encoder = new TextEncoder();
    return encoder.encode(str);
}

// 将字节数组转为字符串
function uint8ArrayToString(bytes) {
    const decoder = new TextDecoder();
    return decoder.decode(bytes);
}

// 将 Uint8Array 转换为 Base64 字符串
function uint8ArrayToBase64(uint8Array) {
    let binaryString = '';
    for (let i = 0; i < uint8Array.length; i++) {
        binaryString += String.fromCharCode(uint8Array[i]);
    }
    return btoa(binaryString);
}

// 将 Base64 字符串转换为 Uint8Array
function base64ToUint8Array(base64String) {
    const binaryString = atob(base64String);
    const uint8Array = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        uint8Array[i] = binaryString.charCodeAt(i);
    }
    return uint8Array;
}

async function encryptMessage(message, key, iv) {
    const encodedMessage = stringToUint8Array(message);
    const encrypted = await window.crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv
        },
        key,
        encodedMessage
    );
    const encryptedArray = new Uint8Array(encrypted);
    return uint8ArrayToBase64(encryptedArray); // 返回 Base64 编码的字符串
}

// 解密字符串
async function decryptMessage(encryptedMessageBase64, key, iv) {
    const encryptedArray = base64ToUint8Array(encryptedMessageBase64);
    const decrypted = await window.crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: iv
        },
        key,
        encryptedArray
    );
    return uint8ArrayToString(new Uint8Array(decrypted));
}