import 'dart:convert';
import 'package:encrypt/encrypt.dart';
import 'dart:typed_data';

class EncryptionService {
  static String encrypt(String text, String keyBase64) {
    final key = Key.fromBase64(keyBase64);
    final iv = IV.fromSecureRandom(16);
    final encrypter = Encrypter(AES(key, mode: AESMode.cbc));

    final encrypted = encrypter.encrypt(text, iv: iv);
    return "${iv.base64}:${encrypted.base64}";
  }

  static String decrypt(String encryptedText, String keyBase64) {
    try {
      final parts = encryptedText.split(':');
      if (parts.length != 2) return "Invalid Format";

      final iv = IV.fromBase64(parts[0]);
      final key = Key.fromBase64(keyBase64);
      final encrypter = Encrypter(AES(key, mode: AESMode.cbc));

      return encrypter.decrypt(Encrypted.fromBase64(parts[1]), iv: iv);
    } catch (e) {
      return "Decryption Error";
    }
  }

  static Map<String, String> decodeInviteCode(String code) {
    final decoded = utf8.decode(base64.decode(code));
    final parts = decoded.split(':');
    return {
      'busId': parts[0],
      'key': parts[1],
    };
  }
}
