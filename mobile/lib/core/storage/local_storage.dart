import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:hive_flutter/hive_flutter.dart';

class LocalStorage {
  static const _secureStorage = FlutterSecureStorage();
  static const _userKey = 'cached_user_profile';
  static const _tokenKey = 'auth_jwt_token';
  static const _offlinePinKey = 'offline_user_pin';

  static late Box _syncBox;
  static late Box _historyBox;

  static Future<void> init() async {
    await Hive.initFlutter();
    _syncBox = await Hive.openBox('pending_sync_queue');
    _historyBox = await Hive.openBox('local_session_history');
  }

  // Token management
  static Future<void> saveToken(String token) async {
    await _secureStorage.write(key: _tokenKey, value: token);
  }

  static Future<String?> getToken() async {
    return await _secureStorage.read(key: _tokenKey);
  }

  // User Profile
  static Future<void> saveUser(Map<String, dynamic> user, {String? offlinePin}) async {
    await _secureStorage.write(key: _userKey, value: jsonEncode(user));
    if (offlinePin != null && offlinePin.isNotEmpty) {
      await _secureStorage.write(key: _offlinePinKey, value: offlinePin);
    }
  }

  static Future<Map<String, dynamic>?> getUser() async {
    final str = await _secureStorage.read(key: _userKey);
    if (str == null) return null;
    try {
      return jsonDecode(str) as Map<String, dynamic>;
    } catch (_) {
      return null;
    }
  }

  static Future<bool> verifyOfflinePin(String pin) async {
    final savedPin = await _secureStorage.read(key: _offlinePinKey);
    return savedPin != null && savedPin == pin;
  }

  static Future<void> clearAuth() async {
    await _secureStorage.deleteAll();
  }

  // Offline Sync Queue
  static Box get syncBox => _syncBox;
  static Box get historyBox => _historyBox;

  static Future<void> enqueueOfflineSubmission(Map<String, dynamic> submission) async {
    await _syncBox.add(submission);
    await _historyBox.add(submission);
  }

  static List<Map<String, dynamic>> getPendingQueue() {
    return _syncBox.values.map((e) => Map<String, dynamic>.from(e as Map)).toList();
  }

  static Future<void> clearPendingQueue() async {
    await _syncBox.clear();
  }
}
