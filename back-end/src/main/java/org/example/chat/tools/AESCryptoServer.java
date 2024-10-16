package org.example.chat.tools;  // 定义类所在的包

import javax.crypto.Cipher;  // 导入Cipher类，用于执行加密和解密操作
import javax.crypto.spec.GCMParameterSpec;  // 导入GCMParameterSpec类，用于指定GCM模式下的参数
import javax.crypto.spec.SecretKeySpec;  // 导入SecretKeySpec类，用于生成加密密钥
import java.util.Base64;  // 导入Base64类，用于进行Base64编码和解码

public class AESCryptoServer {

    // 硬编码的AES密钥，长度为32字节（256位），用于AES加密和解密
    private static final byte[] SECRET_KEY = {
            (byte) 0x00, (byte) 0x11, (byte) 0x22, (byte) 0x33,
            (byte) 0x44, (byte) 0x55, (byte) 0x66, (byte) 0x77,
            (byte) 0x88, (byte) 0x99, (byte) 0xAA, (byte) 0xBB,
            (byte) 0xCC, (byte) 0xDD, (byte) 0xEE, (byte) 0xFF,
            (byte) 0x00, (byte) 0x11, (byte) 0x22, (byte) 0x33,
            (byte) 0x44, (byte) 0x55, (byte) 0x66, (byte) 0x77,
            (byte) 0x88, (byte) 0x99, (byte) 0xAA, (byte) 0xBB,
            (byte) 0xCC, (byte) 0xDD, (byte) 0xEE, (byte) 0xFF
    };

    // 硬编码的初始化向量（IV），用于GCM模式下的AES加密，长度为12字节
    private static final byte[] IV = {
            (byte) 0x01, (byte) 0x02, (byte) 0x03, (byte) 0x04,
            (byte) 0x05, (byte) 0x06, (byte) 0x07, (byte) 0x08,
            (byte) 0x09, (byte) 0x0A, (byte) 0x0B, (byte) 0x0C
    };

    // GCM标签长度，单位为比特，用于确保加密消息的完整性
    private static final int TAG_LENGTH_BIT = 128;

    /**
     * 将字节数组转换为十六进制字符串
     *
     * @param bytes 字节数组
     * @return 十六进制字符串
     * 该方法用于调试或日志记录，方便查看字节数组的内容
     */
    private static String bytesToHex(byte[] bytes) {
        StringBuilder hexString = new StringBuilder();
        for (byte b : bytes) {
            String hex = Integer.toHexString(0xFF & b);  // 将字节转换为十六进制字符串
            if (hex.length() == 1) {
                hexString.append('0');  // 保证每个字节占两位，例如0x0A会被转换为"0a"
            }
            hexString.append(hex);  // 将转换后的十六进制字符串追加到StringBuilder中
        }
        return hexString.toString();  // 返回完整的十六进制字符串
    }

    /**
     * 将十六进制字符串转换为字节数组
     *
     * @param hex 十六进制字符串
     * @return 字节数组
     * 该方法用于将字符串形式的密钥或数据转换为字节数组，以便进行加密或解密操作
     */
    private static byte[] hexToBytes(String hex) {
        int len = hex.length();
        byte[] data = new byte[len / 2];  // 每两个十六进制字符对应一个字节
        for (int i = 0; i < len; i += 2) {
            data[i / 2] = (byte) ((Character.digit(hex.charAt(i), 16) << 4)  // 获取高4位
                    + Character.digit(hex.charAt(i + 1), 16));  // 获取低4位，并组合成一个字节
        }
        return data;  // 返回转换后的字节数组
    }

    /**
     * 加密消息
     *
     * @param message 要加密的消息
     * @return 加密后的字符串（Base64编码）
     * @throws Exception 如果加密过程中出现错误，抛出异常
     *                   该方法使用AES-GCM模式对输入的消息进行加密，并返回Base64编码的加密结果
     */
    public static String encrypt(String message) throws Exception {
        SecretKeySpec keySpec = new SecretKeySpec(SECRET_KEY, "AES");  // 使用预定义的密钥创建SecretKeySpec对象
        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");  // 获取AES/GCM/NoPadding模式的Cipher实例
        GCMParameterSpec spec = new GCMParameterSpec(TAG_LENGTH_BIT, IV);  // 创建GCM参数规范对象，包含标签长度和IV
        cipher.init(Cipher.ENCRYPT_MODE, keySpec, spec);  // 使用加密模式初始化Cipher对象
        byte[] encryptedBytes = cipher.doFinal(message.getBytes("UTF-8"));  // 对消息进行加密，返回加密后的字节数组
        return Base64.getEncoder().encodeToString(encryptedBytes);  // 返回Base64编码的加密结果，便于传输或存储
    }

    /**
     * 解密消息
     *
     * @param encryptedMessageBase64 加密的字符串（Base64编码）
     * @return 解密后的字符串
     * @throws Exception 如果解密过程中出现错误，抛出异常
     *                   该方法使用AES-GCM模式对输入的Base64编码的加密消息进行解密，并返回解密后的原始消息
     */
    public static String decrypt(String encryptedMessageBase64) throws Exception {
        SecretKeySpec keySpec = new SecretKeySpec(SECRET_KEY, "AES");  // 使用预定义的密钥创建SecretKeySpec对象
        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");  // 获取AES/GCM/NoPadding模式的Cipher实例
        GCMParameterSpec spec = new GCMParameterSpec(TAG_LENGTH_BIT, IV);  // 创建GCM参数规范对象，包含标签长度和IV
        cipher.init(Cipher.DECRYPT_MODE, keySpec, spec);  // 使用解密模式初始化Cipher对象
        byte[] encryptedBytes = Base64.getDecoder().decode(encryptedMessageBase64);  // 对Base64编码的加密消息进行解码
        byte[] decryptedBytes = cipher.doFinal(encryptedBytes);  // 对解码后的字节数组进行解密，返回原始字节数组
        return new String(decryptedBytes, "UTF-8");  // 将解密后的字节数组转换为字符串并返回
    }
}